import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Ticket, Star, ArrowLeft, ExternalLink } from 'lucide-react'
import { useEventContract, Event, TicketTier } from '../hooks/useEventContract'
import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWeb3()
  const { getEvent, getEventTiers, getTicketTier, purchaseTicket, loading } = useEventContract()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [tiers, setTiers] = useState<TicketTier[]>([])
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [eventLoading, setEventLoading] = useState(true)

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return

      try {
        setEventLoading(true)
        const eventId = parseInt(id)
        
        // Fetch event details
        const eventData = await getEvent(eventId)
        if (!eventData) {
          toast.error('Event not found')
          navigate('/events')
          return
        }
        setEvent(eventData)

        // Fetch ticket tiers
        const tierIds = await getEventTiers(eventId)
        const tierPromises = tierIds.map(tierId => getTicketTier(tierId))
        const tiersData = await Promise.all(tierPromises)
        const validTiers = tiersData.filter((tier): tier is TicketTier => tier !== null)
        setTiers(validTiers)

        if (validTiers.length > 0) {
          setSelectedTier(validTiers[0])
        }
      } catch (error) {
        console.error('Error fetching event data:', error)
        toast.error('Failed to load event details')
      } finally {
        setEventLoading(false)
      }
    }

    fetchEventData()
  }, [id])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = () => {
    if (!event) return 'unknown'
    const now = Math.floor(Date.now() / 1000)
    if (event.hasEnded) return 'ended'
    if (now >= event.startTime && now <= event.endTime) return 'live'
    if (now < event.startTime) return 'upcoming'
    return 'ended'
  }

  const handlePurchase = async () => {
    if (!selectedTier || !isConnected) {
      if (!isConnected) {
        await connectWallet()
      }
      return
    }

    try {
      const totalPrice = ethers.formatEther(selectedTier.price * BigInt(quantity))
      await purchaseTicket(selectedTier.tierId, quantity, totalPrice)
      
      // Refresh tier data to show updated supply
      const updatedTier = await getTicketTier(selectedTier.tierId)
      if (updatedTier) {
        setTiers(prev => prev.map(tier => 
          tier.tierId === updatedTier.tierId ? updatedTier : tier
        ))
        setSelectedTier(updatedTier)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  const canPurchase = () => {
    if (!selectedTier || !event) return false
    const status = getEventStatus()
    return status === 'upcoming' && selectedTier.currentSupply < selectedTier.maxSupply
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
            <button
              onClick={() => navigate('/events')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  const status = getEventStatus()
  const statusColors = {
    upcoming: 'bg-blue-500',
    live: 'bg-green-500',
    ended: 'bg-gray-500',
    unknown: 'bg-gray-500'
  }
  const statusLabels = {
    upcoming: 'Upcoming',
    live: 'Live Now',
    ended: 'Ended',
    unknown: 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center text-purple-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
              {/* Event Image */}
              <div className="relative h-64 md:h-80">
                <img
                  src={event.imageUri || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </span>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-white mb-4">{event.name}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-purple-200">
                    <Calendar className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-semibold">Starts</div>
                      <div className="text-sm">{formatDate(event.startTime)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-purple-200">
                    <Clock className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-semibold">Ends</div>
                      <div className="text-sm">{formatDate(event.endTime)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-purple-200">
                    <Users className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-semibold">Organizer</div>
                      <div className="text-sm font-mono">
                        {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-purple-200">
                    <ExternalLink className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-semibold">Blockchain</div>
                      <div className="text-sm">Ethereum Sepolia</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <h2 className="text-xl font-bold text-white mb-3">About This Event</h2>
                  <p className="text-purple-200 leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Get Your NFT Tickets</h2>

              {tiers.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                  <p className="text-purple-200">No ticket tiers available yet</p>
                </div>
              ) : (
                <>
                  {/* Tier Selection */}
                  <div className="space-y-3 mb-6">
                    {tiers.map((tier) => (
                      <div
                        key={tier.tierId}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedTier?.tierId === tier.tierId
                            ? 'border-purple-400 bg-purple-500/20'
                            : 'border-white/20 hover:border-purple-400/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white">{tier.name}</h3>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {ethers.formatEther(tier.price)} ETH
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-purple-200">
                          <span>{tier.currentSupply} / {tier.maxSupply} sold</span>
                          <span>Max {tier.maxPerWallet} per wallet</span>
                        </div>
                        
                        <div className="mt-2 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${(tier.currentSupply / tier.maxSupply) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTier && (
                    <>
                      {/* Quantity Selection */}
                      <div className="mb-6">
                        <label className="block text-white font-semibold mb-2">Quantity</label>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold text-white w-12 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(selectedTier.maxPerWallet, quantity + 1))}
                            className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-200">Total Price:</span>
                          <span className="text-2xl font-bold text-white">
                            {ethers.formatEther(selectedTier.price * BigInt(quantity))} ETH
                          </span>
                        </div>
                      </div>

                      {/* Purchase Button */}
                      <button
                        onClick={isConnected ? handlePurchase : connectWallet}
                        disabled={loading || !canPurchase()}
                        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                          loading || !canPurchase()
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : !isConnected ? (
                          'Connect Wallet to Purchase'
                        ) : !canPurchase() ? (
                          status === 'ended' ? 'Event Ended' : 'Sold Out'
                        ) : (
                          `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`
                        )}
                      </button>

                      {status === 'upcoming' && (
                        <p className="text-xs text-purple-300 text-center mt-3">
                          🎫 NFT tickets will be minted to your wallet after purchase
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
