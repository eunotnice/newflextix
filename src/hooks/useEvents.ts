import { useState, useEffect } from 'react'
import { useEventContract, Event } from './useEventContract'

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { contract } = useEventContract()

  const fetchEvents = async () => {
    if (!contract) return

    try {
      setLoading(true)
      
      // Listen for EventCreated events to get all event IDs
      const filter = contract.filters.EventCreated()
      const eventLogs = await contract.queryFilter(filter)
      
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
            hasEnded: eventData.hasEnded
          }
        } catch (error) {
          console.error(`Error fetching event ${eventId}:`, error)
          return null
        }
      })

      const eventsData = await Promise.all(eventPromises)
      const validEvents = eventsData.filter((event): event is Event => event !== null)
      
      // Sort by creation time (most recent first)
      validEvents.sort((a, b) => b.eventId - a.eventId)
      
      setEvents(validEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [contract])

  const refetch = () => {
    fetchEvents()
  }

  return {
    events,
    loading,
    refetch
  }
}
