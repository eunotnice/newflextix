import { useState, useEffect } from 'react'
import { useEventContract } from './useEventContract'
import { useWeb3 } from '../context/Web3Context'

export interface Event {
  eventId: number;
  name: string;
  description: string;
  imageUri: string;
  organizer: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  hasEnded: boolean;
  stickers: string[]; // Optional stickers array
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { contract, loading: contractLoading } = useEventContract()
  const { provider, isConnected } = useWeb3()

  const fetchEvents = async () => {
    if (contractLoading) {
      console.log('⏳ Waiting for contract to initialize...')
      return
    }
    
    if (!contract || !isConnected) {
      console.log('❌ Missing requirements for fetching events')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Method 1: Try to get events from EventCreated logs
      const filter = contract.filters.EventCreated(null, null)
      const currentBlock = await provider!.getBlockNumber()
      const fromBlock = Math.max(currentBlock - 5000, 0)
      const eventLogs = await contract.queryFilter(filter, fromBlock, 'latest')
      
      let eventsData: Event[] = []
      
      if (eventLogs.length > 0) {
        const eventPromises = eventLogs.map(async (log) => {
          const parsed = contract.interface.parseLog(log)
          const eventId = Number(parsed?.args.eventId)
          
          try {
            const eventData = await contract.events(eventId)
            return {
              eventId: Number(eventData.eventId),
              name: eventData.name,
              description: eventData.description,
              imageUri: eventData.imageUri,
              organizer: eventData.organizer,
              startTime: Number(eventData.startTime),
              endTime: Number(eventData.endTime),
              isActive: eventData.isActive,
              hasEnded: eventData.hasEnded,
              stickers: eventData.stickers || [] // Handle missing stickers
            }
          } catch (error) {
            console.error(`Error fetching event ${eventId}:`, error)
            return null
          }
        })

        const fetchedEvents = await Promise.all(eventPromises)
        eventsData = fetchedEvents.filter((event): event is Event => 
          event !== null && 
          typeof event?.eventId === 'number' &&
          typeof event?.name === 'string'
        )
      } else {
        // Method 2: Fallback to manual checking
        const maxEventsToCheck = 10
        for (let i = 0; i < maxEventsToCheck; i++) {
          try {
            const eventData = await contract.events(i)
            if (eventData.name && eventData.name !== '') {
              eventsData.push({
                eventId: Number(eventData.eventId),
                name: eventData.name,
                description: eventData.description,
                imageUri: eventData.imageUri,
                organizer: eventData.organizer,
                startTime: Number(eventData.startTime),
                endTime: Number(eventData.endTime),
                isActive: eventData.isActive,
                hasEnded: eventData.hasEnded,
                stickers: eventData.stickers || []
              })
            }
          } catch (error) {
            // Continue to next ID
          }
        }
      }
      
      // Sort by event ID (most recent first)
      setEvents(eventsData.sort((a, b) => b.eventId - a.eventId))
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contract && provider && isConnected) {
      fetchEvents()
    }
  }, [contract, provider, isConnected])

  const refetch = () => {
    if (!loading) {
      fetchEvents()
    }
  }

  return {
    events,
    loading,
    refetch
  }
}