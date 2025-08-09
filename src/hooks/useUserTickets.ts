import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { useEventContract, Ticket, Event, TicketTier } from './useEventContract'

export interface UserTicketWithDetails extends Ticket {
  event: Event | null
  tier: TicketTier | null
}

export const useUserTickets = () => {
  const [tickets, setTickets] = useState<UserTicketWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { account } = useWeb3()
  const { contract, getEvent, getTicketTier, getTicket } = useEventContract()

  const fetchUserTickets = async () => {
    if (!contract || !account) {
      setTickets([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Listen for TicketPurchased events for this user
      const filter = contract.filters.TicketPurchased(null, null, null, account)
      const ticketLogs = await contract.queryFilter(filter)
      
      const ticketPromises = ticketLogs.map(async (log) => {
        const parsed = contract.interface.parseLog(log)
        const tokenId = Number(parsed?.args.tokenId)
        
        try {
          const ticket = await getTicket(tokenId)
          if (!ticket) return null

          const [event, tier] = await Promise.all([
            getEvent(ticket.eventId),
            getTicketTier(ticket.tierId)
          ])

          return {
            ...ticket,
            event,
            tier
          }
        } catch (error) {
          console.error(`Error fetching ticket ${tokenId}:`, error)
          return null
        }
      })

      const ticketsData = await Promise.all(ticketPromises)
      const validTickets = ticketsData.filter((ticket): ticket is UserTicketWithDetails => ticket !== null)
      
      // Sort by purchase time (most recent first)
      validTickets.sort((a, b) => b.purchaseTime - a.purchaseTime)
      
      setTickets(validTickets)
    } catch (error) {
      console.error('Error fetching user tickets:', error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserTickets()
  }, [contract, account])

  const refetch = () => {
    fetchUserTickets()
  }

  return {
    tickets,
    loading,
    refetch
  }
}
