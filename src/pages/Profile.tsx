import React, { useState, useEffect } from 'react'
import { User, Ticket, Trophy, Star, Eye, EyeOff, Share2, Download, Grid, List, Calendar, MapPin, BarChart3, Users, Clock } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useWeb3 } from '../context/Web3Context'
import { useUserTickets } from '../hooks/useUserTickets'
import { useEvents } from '../hooks/useEvents'
import { useEventContract } from '../hooks/useEventContract'
import toast from 'react-hot-toast'

interface DisplayedTicket {
  tokenId: number
  eventTitle: string
  eventImage: string
  tierName: string
  date: string
  location: string
  price: string
  eventId: number
  isUsed: boolean
  purchaseTime: number
  organizer: string
  isDisplayed: boolean
  attributes: {
    venue: string
    category: string
    year: string
  }
}

interface UserCreatedEvent {
  eventId: number
  name: string
  description: string
  imageUri: string
  startTime: number
  endTime: number
  organizer: string
  isActive: boolean
  hasEnded: boolean
  status: 'upcoming' | 'ongoing' | 'ended'
  totalTicketsSold: number
  totalRevenue: string
  tiers: {
    name: string
    price: string
    sold: number
    total: number
  }[]
}



const Profile = () => {
  const navigate = useNavigate()
  const { isConnected, account, connectWallet } = useWeb3()
  const [activeTab, setActiveTab] = useState<'collection' | 'created-events'>('collection')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showOnlyDisplayed, setShowOnlyDisplayed] = useState(false)
  const [eventFilter, setEventFilter] = useState<string>('all')
  
  // Hooks for fetching real data
  const { tickets, loading: ticketsLoading, refresh: refreshTickets } = useUserTickets()
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents()
  const { getEventTiers, getTicketTier } = useEventContract()
  
  // State for processed data
  const [displayedTickets, setDisplayedTickets] = useState<DisplayedTicket[]>([])
  const [userCreatedEvents, setUserCreatedEvents] = useState<UserCreatedEvent[]>([])



    // Process tickets data
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      const processedTickets = tickets.map(ticket => {
        const eventDate = ticket.event?.startTime 
          ? new Date(ticket.event.startTime * 1000).toLocaleDateString()
          : 'TBD'
        
        const tierPrice = ticket.tier?.price 
          ? `${(Number(ticket.tier.price) / 10**18).toFixed(3)} ETH`
          : '0 ETH'
        
        return {
          tokenId: ticket.tokenId,
          eventTitle: ticket.event?.name || `Event #${ticket.eventId}`,
          eventImage: ticket.event?.imageUri || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
          tierName: ticket.tier?.name || `Tier #${ticket.tierId}`,
          date: eventDate,
          location: 'On-chain Event',
          price: tierPrice,
          eventId: ticket.eventId,
          isUsed: ticket.isUsed,
          purchaseTime: ticket.purchaseTime,
          organizer: ticket.event?.organizer || '',
          isDisplayed: true, // Default to displayed
      attributes: {
            venue: 'Blockchain',
            category: 'Event',
            year: new Date(ticket.purchaseTime * 1000).getFullYear().toString()
          }
        }
      })
      setDisplayedTickets(processedTickets)
    } else {
      setDisplayedTickets([])
    }
  }, [tickets])
  
  // Process events data to show only user's created events
  useEffect(() => {
    if (events && events.length > 0 && account) {
      const userEvents = events.filter(event => 
        event.organizer.toLowerCase() === account.toLowerCase()
      )
      
      const processedEvents = userEvents.map(event => {
        const now = Date.now() / 1000
        let status: 'upcoming' | 'ongoing' | 'ended' = 'upcoming'
        
        if (event.hasEnded || now > event.endTime) {
          status = 'ended'
        } else if (now >= event.startTime && now <= event.endTime) {
          status = 'ongoing'
        }
        
        return {
          eventId: event.eventId,
          name: event.name,
          description: event.description,
          imageUri: event.imageUri,
          startTime: event.startTime,
          endTime: event.endTime,
          organizer: event.organizer,
          isActive: event.isActive,
          hasEnded: event.hasEnded,
          status,
          totalTicketsSold: 0, // Will be calculated from tiers
          totalRevenue: '0',
          tiers: [] // Will be fetched separately
        }
      })
      
      setUserCreatedEvents(processedEvents)
    } else {
      setUserCreatedEvents([])
    }
  }, [events, account])





  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'ongoing': return 'text-green-600 bg-green-100 border-green-300'
      case 'ended': return 'text-gray-600 bg-gray-100 border-gray-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  // Toggle display status for tickets
  const toggleDisplayStatus = (tokenId: number) => {
    setDisplayedTickets(prev => prev.map(ticket => 
      ticket.tokenId === tokenId 
        ? { ...ticket, isDisplayed: !ticket.isDisplayed }
        : ticket
    ))
  }

  const filteredTickets = displayedTickets.filter(ticket => {
    if (showOnlyDisplayed && !ticket.isDisplayed) return false
    return true
  })

  const filteredEvents = userCreatedEvents.filter(event => {
    if (eventFilter !== 'all' && event.status !== eventFilter) return false
    return true
  })

  // Calculate statistics from real data
  const totalTicketsOwned = displayedTickets.length
  const displayedTicketsCount = displayedTickets.filter(ticket => ticket.isDisplayed).length
  const totalValue = displayedTickets.reduce((sum, ticket) => {
    const priceValue = parseFloat(ticket.price.replace(' ETH', ''))
    return sum + (isNaN(priceValue) ? 0 : priceValue)
  }, 0)
  const totalEventsCreated = userCreatedEvents.length
  const totalRevenue = userCreatedEvents.reduce((sum, event) => sum + parseFloat(event.totalRevenue), 0)
  const totalTicketsSold = userCreatedEvents.reduce((sum, event) => sum + event.totalTicketsSold, 0)

  // Navigation function
  const handleCreateEventClick = () => {
    navigate('/create-event')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">{account?.slice(0, 6)}...{account?.slice(-4)}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  refreshTickets()
                  refetchEvents()
                  toast.success('Profile data refreshed!')
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Profile link copied to clipboard!')
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <div className="text-center">
              <Ticket className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {ticketsLoading ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-12 mx-auto rounded"></div>
                ) : (
                  totalTicketsOwned
                )}
              </h3>
              <p className="text-gray-600">NFT Tickets</p>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {ticketsLoading ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-12 mx-auto rounded"></div>
                ) : (
                  displayedTicketsCount
                )}
              </h3>
              <p className="text-gray-600">Displayed</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {ticketsLoading ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${totalValue.toFixed(3)} ETH`
                )}
              </h3>
              <p className="text-gray-600">Portfolio Value</p>
            </div>
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {eventsLoading ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-8 mx-auto rounded"></div>
                ) : (
                  totalEventsCreated
                )}
              </h3>
              <p className="text-gray-600">Events Created</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {eventsLoading ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-8 mx-auto rounded"></div>
                ) : (
                  totalTicketsSold
                )}
              </h3>
              <p className="text-gray-600">Tickets Sold</p>
            </div>
            <div className="text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {eventsLoading ? (
                  <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${totalRevenue.toFixed(3)} ETH`
                )}
              </h3>
              <p className="text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'collection'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span>My Collection</span>
            </button>
            <button
              onClick={() => setActiveTab('created-events')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'created-events'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>My Events</span>
            </button>
            <button
              onClick={handleCreateEventClick}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            >
              <Calendar className="w-5 h-5" />
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showOnlyDisplayed}
                      onChange={(e) => setShowOnlyDisplayed(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Show only displayed</span>
                  </label>
                  
                  {ticketsLoading && (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-sm">Loading tickets...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* NFT Collection */}
            {ticketsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your tickets...</h3>
                <p className="text-gray-600">Fetching your NFT tickets from the blockchain</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFT tickets found</h3>
                <p className="text-gray-600">Purchase some event tickets to see them here.</p>
                <Link 
                  to="/events" 
                  className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredTickets.map((ticket) => (
                  <div key={ticket.tokenId} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative">
                          <img 
                            src={ticket.eventImage} 
                            alt={ticket.eventTitle}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            #{ticket.tokenId}
                          </div>
                          <button
                            onClick={() => toggleDisplayStatus(ticket.tokenId)}
                            className={`absolute top-3 right-3 p-2 rounded-full ${ticket.isDisplayed ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} hover:opacity-80 transition-opacity`}
                          >
                            {ticket.isDisplayed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          {ticket.isUsed && (
                            <div className="absolute bottom-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              ✓ Used
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.eventTitle}</h3>
                          <p className="text-purple-600 font-semibold mb-2">{ticket.tierName}</p>
                          <p className="text-gray-600 text-sm mb-4">{ticket.date} • {ticket.location}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Venue:</span>
                              <span className="text-gray-900">{ticket.attributes.venue}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Category:</span>
                              <span className="text-gray-900">{ticket.attributes.category}</span>
                            </div>
                              <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Purchased:</span>
                              <span className="text-gray-900">{new Date(ticket.purchaseTime * 1000).toLocaleDateString()}</span>
                              </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-purple-600">{ticket.price}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.isDisplayed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                {ticket.isDisplayed ? 'Displayed' : 'Hidden'}
                              </span>
                              <Link
                                to={`/events/${ticket.eventId}`}
                                className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold hover:bg-purple-200 transition-colors"
                              >
                                View Event
                              </Link>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center p-6 space-x-4">
                        <img 
                          src={ticket.eventImage} 
                          alt={ticket.eventTitle}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{ticket.eventTitle}</h3>
                            {ticket.isUsed && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                                ✓ Used
                              </span>
                            )}
                          </div>
                          <p className="text-purple-600 font-semibold mb-1">{ticket.tierName}</p>
                          <p className="text-gray-600 text-sm">{ticket.date} • {ticket.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600 mb-2">{ticket.price}</p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleDisplayStatus(ticket.tokenId)}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${ticket.isDisplayed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {ticket.isDisplayed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{ticket.isDisplayed ? 'Displayed' : 'Hidden'}</span>
                            </button>
                            <Link
                              to={`/events/${ticket.eventId}`}
                              className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold hover:bg-purple-200 transition-colors"
                            >
                              View Event
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Created Events Tab */}
        {activeTab === 'created-events' && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Created Events */}
            {eventsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your events...</h3>
                <p className="text-gray-600">Fetching events you've created</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
                <p className="text-gray-600">Create your first event to get started.</p>
                <button
                  onClick={handleCreateEventClick}
                  className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredEvents.map((event) => (
                  <div key={event.eventId} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative">
                          <img 
                            src={event.imageUri} 
                            alt={event.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </div>
                          <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            #{event.eventId}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                          <p className="text-gray-600 text-sm mb-4">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            On-chain Event
                          </p>
                          <p className="text-gray-600 text-sm mb-4">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {new Date(event.startTime * 1000).toLocaleDateString()} - {new Date(event.endTime * 1000).toLocaleDateString()}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">{event.totalTicketsSold}</p>
                              <p className="text-xs text-gray-500">Tickets Sold</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{event.totalRevenue} ETH</p>
                              <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {event.tiers.map((tier, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">{tier.name}:</span>
                                <span className="text-gray-900">{tier.sold}/{tier.total}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Link
                              to={`/events/${event.eventId}`}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              <BarChart3 className="w-4 h-4" />
                              <span>View Details</span>
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center p-6 space-x-4">
                        <img 
                          src={event.imageUri} 
                          alt={event.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">On-chain Event</p>
                          <p className="text-gray-600 text-sm">{new Date(event.startTime * 1000).toLocaleDateString()} - {new Date(event.endTime * 1000).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600 mb-1">{event.totalTicketsSold} sold</p>
                          <p className="text-sm text-green-600 font-semibold mb-2">{event.totalRevenue} ETH</p>
                          <Link
                            to={`/events/${event.eventId}`}
                            className="inline-block p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                              <BarChart3 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}


      </div>
    </div>
  )
}

export default Profile
