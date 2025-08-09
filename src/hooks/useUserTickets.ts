import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useEventContract, Ticket, Event, TicketTier } from './useEventContract';

export interface UserTicketWithDetails extends Ticket {
  event: Event | null;
  tier: TicketTier | null;
}

export const useUserTickets = () => {
  const [tickets, setTickets] = useState<UserTicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWeb3();
  const { contract, getEvent, getTicketTier, getTicket } = useEventContract();

  const fetchUserTickets = async () => {
    if (!contract || !account) {
      setTickets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let tokenIds: number[] = [];

      // Method 1: Try direct ownerOf check (works for any ERC721)
      try {
        const MAX_TOKENS_TO_CHECK = 1000;
        for (let tokenId = 1; tokenId <= MAX_TOKENS_TO_CHECK; tokenId++) {
          try {
            const owner = await contract.ownerOf(tokenId);
            if (owner.toLowerCase() === account.toLowerCase()) {
              tokenIds.push(tokenId);
            }
          } catch (e) {
            // Token likely doesn't exist, skip
          }
        }
        // Deduplicate after loop finishes
        tokenIds = Array.from(new Set(tokenIds));
        console.log('🎟 Token IDs from ownerOf check:', tokenIds);
      } catch (methodError) {
        console.error('❌ Error using ownerOf method:', methodError);
      }


      // Method 2: Fallback to event filtering
      if (tokenIds.length === 0) {
        try {
          // Only filter on indexed parameters (buyer should be indexed)
          const filter = contract.filters.TicketPurchased(null, null, account);
          const purchaseEvents = await contract.queryFilter(filter);
          
          tokenIds = purchaseEvents
            .map((log) => {
              if ("args" in log) {
                const args = log.args as unknown as {
                  tokenId: bigint;
                  eventId: bigint;
                  tierId: bigint;
                  buyer: string;
                };
                return Number(args.tokenId);
              }
              return NaN;
            })
            .filter((id): id is number => !isNaN(id));

          console.log('🎟 Token IDs from events:', tokenIds);
        } catch (eventError) {
          console.error('❌ Error querying events:', eventError);
        }
      }

      // Process each token to get full ticket details
      const ticketPromises = tokenIds.map(async (tokenId) => {
        try {
          const ticket = await getTicket(tokenId);
          const event = await getEvent(ticket.eventId);
          const tier = await getTicketTier(ticket.tierId);
          
          return {
            ...ticket,
            event,
            tier,
          };
        } catch (error) {
          //console.error(❌ Error processing token ${tokenId}:, error);
          return null;
        }
      });

      const userTickets = (await Promise.all(ticketPromises)).filter(t => t !== null) as UserTicketWithDetails[];
      const uniqueTicketsMap = new Map<number, UserTicketWithDetails>();
      for (const t of userTickets) {
        uniqueTicketsMap.set(t.tokenId, t);
      }
      const uniqueTickets = Array.from(uniqueTicketsMap.values());
      setTickets(userTickets);
    } catch (err) {
      console.error('❌ Error in fetchUserTickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [account, contract]);

  return { tickets, loading, refresh: fetchUserTickets };
};