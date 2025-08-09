import React, { useState } from 'react'
import { User, Ticket, Trophy, Star, Eye, EyeOff, Share2, Download, Grid, List, Plus, Calendar, MapPin, DollarSign, Save, Trash2, Edit, BarChart3, Users, Clock } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

interface NFTTicket {
  id: number
  tokenId: number
  eventTitle: string
  eventImage: string
  tierName: string
  date: string
  location: string
  price: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  isDisplayed: boolean
  attributes: {
    artist?: string
    venue: string
    category: string
    year: string
  }
}

interface CreatedEvent {
  id: number
  eventId: number
  name: string
  description: string
  imageUri: string
  startDate: string
  endDate: string
  location: string
  category: string
  status: 'upcoming' | 'ongoing' | 'ended'
  totalTicketsSold: number
  totalRevenue: string
  attendees: number
  tiers: {
    name: string
    price: string
    sold: number
    total: number
  }[]
}

interface TicketTier {
  name: string
  price: string
  maxSupply: string
  maxPerWallet: string
  description: string
}

const Profile = () => {
  const { isConnected, account, connectWallet } = useWeb3()
  const [activeTab, setActiveTab] = useState<'collection' | 'created-events' | 'create-event'>('collection')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [showOnlyDisplayed, setShowOnlyDisplayed] = useState(false)
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)

  // Event creation state
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    imageUri: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    category: 'technology',
    website: ''
  })

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      name: 'General Admission',
      price: '0.1',
      maxSupply: '1000',
      maxPerWallet: '5',
      description: 'Standard access to the event'
    }
  ])

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'music', label: 'Music' },
    { value: 'art', label: 'Art' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ]

  // Mock created events data
  const [createdEvents, setCreatedEvents] = useState<CreatedEvent[]>([
    {
      id: 1,
      eventId: 1001,
      name: 'Tech Conference 2024',
      description: 'Annual technology conference featuring the latest innovations in AI, blockchain, and web development.',
      imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      location: 'San Francisco, CA',
      category: 'Technology',
      status: 'upcoming',
      totalTicketsSold: 450,
      totalRevenue: '67.5',
      attendees: 0,
      tiers: [
        { name: 'General Admission', price: '0.1', sold: 300, total: 500 },
        { name: 'VIP Pass', price: '0.3', sold: 150, total: 200 }
      ]
    },
    {
      id: 2,
      eventId: 1002,
      name: 'Blockchain Summit',
      description: 'Exploring the future of decentralized finance and Web3 technologies.',
      imageUri: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      startDate: '2024-02-28',
      endDate: '2024-02-28',
      location: 'Miami, FL',
      category: 'Blockchain',
      status: 'ended',
      totalTicketsSold: 280,
      totalRevenue: '42.0',
      attendees: 265,
      tiers: [
        { name: 'Standard', price: '0.15', sold: 280, total: 300 }
      ]
    },
    {
      id: 3,
      eventId: 1003,
      name: 'AI Workshop Series',
      description: 'Hands-on workshops covering machine learning, neural networks, and practical AI applications.',
      imageUri: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      location: 'Virtual Event',
      category: 'Education',
      status: 'ongoing',
      totalTicketsSold: 150,
      totalRevenue: '22.5',
      attendees: 142,
      tiers: [
        { name: 'Workshop Access', price: '0.15', sold: 150, total: 200 }
      ]
    }
  ])

  // Mock NFT tickets data
  const [nftTickets, setNftTickets] = useState<NFTTicket[]>([
    {
      id: 1,
      tokenId: 12345,
      eventTitle: 'Tech Conference 2024',
      eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'VIP Pass',
      date: '2024-03-15',
      location: 'San Francisco, CA',
      price: '0.3 ETH',
      rarity: 'Epic',
      isDisplayed: true,
      attributes: {
        venue: 'Moscone Center',
        category: 'Technology',
        year: '2024'
      }
    },
    {
      id: 2,
      tokenId: 12346,
      eventTitle: 'Music Festival Summer',
      eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'General Admission',
      date: '2024-06-20',
      location: 'Austin, TX',
      price: '0.2 ETH',
      rarity: 'Common',
      isDisplayed: true,
      attributes: {
        artist: 'Various Artists',
        venue: 'Zilker Park',
        category: 'Music',
        year: '2024'
      }
    },
    {
      id: 3,
      tokenId: 12347,
      eventTitle: 'Art Gallery Opening',
      eventImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Collector Pass',
      date: '2024-01-15',
      location: 'New York, NY',
      price: '0.15 ETH',
      rarity: 'Rare',
      isDisplayed: false,
      attributes: {
        venue: 'MoMA',
        category: 'Art',
        year: '2024'
      }
    },
    {
      id: 4,
      tokenId: 12348,
      eventTitle: 'Blockchain Summit',
      eventImage: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Premium Access',
      date: '2024-02-28',
      location: 'Miami, FL',
      price: '0.25 ETH',
      rarity: 'Legendary',
      isDisplayed: true,
      attributes: {
        venue: 'Miami Convention Center',
        category: 'Blockchain',
        year: '2024'
      }
    },
    {
      id: 5,
      tokenId: 12349,
      eventTitle: 'Fashion Week Gala',
      eventImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Front Row',
      date: '2024-04-10',
      location: 'Paris, France',
      price: '0.8 ETH',
      rarity: 'Legendary',
      isDisplayed: true,
      attributes: {
        venue: 'Grand Palais',
        category: 'Fashion',
        year: '2024'
      }
    }
  ])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100 border-gray-300'
      case 'Rare': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'Epic': return 'text-purple-600 bg-purple-100 border-purple-300'
      case 'Legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'ongoing': return 'text-green-600 bg-green-100 border-green-300'
      case 'ended': return 'text-gray-600 bg-gray-100 border-gray-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const toggleDisplayStatus = (ticketId: number) => {
    setNftTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, isDisplayed: !ticket.isDisplayed }
        : ticket
    ))
  }

  const filteredTickets = nftTickets.filter(ticket => {
    if (filterRarity !== 'all' && ticket.rarity !== filterRarity) return false
    if (showOnlyDisplayed && !ticket.isDisplayed) return false
    return true
  })

  const filteredEvents = createdEvents.filter(event => {
    if (eventFilter !== 'all' && event.status !== eventFilter) return false
    return true
  })

  const displayedTickets = nftTickets.filter(ticket => ticket.isDisplayed)
  const totalValue = nftTickets.reduce((sum, ticket) => sum + parseFloat(ticket.price.replace(' ETH', '')), 0)
  const totalEventsCreated = createdEvents.length
  const totalRevenue = createdEvents.reduce((sum, event) => sum + parseFloat(event.totalRevenue), 0)
  const totalTicketsSold = createdEvents.reduce((sum, event) => sum + event.totalTicketsSold, 0)

  // Event creation functions
  const handleEventDataChange = (field: string, value: string) => {
    setEventData(prev => ({ ...prev, [field]: value }))
  }

  const handleTierChange = (index: number, field: string, value: string) => {
    setTicketTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ))
  }

  const addTier = () => {
    setTicketTiers(prev => [...prev, {
      name: '',
      price: '0.1',
      maxSupply: '100',
      maxPerWallet: '2',
      description: ''
    }])
  }

  const removeTier = (index: number) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      await connectWallet()
      return
    }

    // Validation
    if (!eventData.name || !eventData.description || !eventData.startDate || !eventData.startTime) {
      toast.error('Please fill in all required fields')
      return
    }

    if (ticketTiers.some(tier => !tier.name || !tier.price || !tier.maxSupply)) {
      toast.error('Please complete all ticket tier information')
      return
    }

    setIsCreatingEvent(true)
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Event created successfully!')
      
      // Reset form
      setEventData({
        name: '',
        description: '',
        imageUri: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        category: 'technology',
        website: ''
      })
      setTicketTiers([{
        name: 'General Admission',
        price: '0.1',
        maxSupply: '1000',
        maxPerWallet: '5',
        description: 'Standard access to the event'
      }])
      
      // Switch to created events tab
      setActiveTab('created-events')
      
    } catch (error) {
      toast.error('Failed to create event. Please try again.')
    } finally {
      setIsCreatingEvent(false)
    }
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
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <div className="text-center">
              <Ticket className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{nftTickets.length}</h3>
              <p className="text-gray-600">NFT Tickets</p>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{displayedTickets.length}</h3>
              <p className="text-gray-600">Displayed</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{totalValue.toFixed(2)} ETH</h3>
              <p className="text-gray-600">Portfolio Value</p>
            </div>
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{totalEventsCreated}</h3>
              <p className="text-gray-600">Events Created</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{totalTicketsSold}</h3>
              <p className="text-gray-600">Tickets Sold</p>
            </div>
            <div className="text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(1)} ETH</h3>
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
              onClick={() => setActiveTab('create-event')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'create-event'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
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
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Rarities</option>
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showOnlyDisplayed}
                      onChange={(e) => setShowOnlyDisplayed(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Show only displayed</span>
                  </label>
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
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
                <p className="text-gray-600">Try adjusting your filters or purchase some event tickets.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${ticket.isDisplayed ? 'ring-2 ring-purple-500' : ''}`}>
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative">
                          <img 
                            src={ticket.eventImage} 
                            alt={ticket.eventTitle}
                            className="w-full h-48 object-cover"
                          />
                          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold border ${getRarityColor(ticket.rarity)}`}>
                            {ticket.rarity}
                          </div>
                          <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            #{ticket.tokenId}
                          </div>
                          <button
                            onClick={() => toggleDisplayStatus(ticket.id)}
                            className={`absolute bottom-3 right-3 p-2 rounded-full ${ticket.isDisplayed ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} hover:opacity-80 transition-opacity`}
                          >
                            {ticket.isDisplayed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
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
                            {ticket.attributes.artist && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Artist:</span>
                                <span className="text-gray-900">{ticket.attributes.artist}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-purple-600">{ticket.price}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.isDisplayed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                              {ticket.isDisplayed ? 'Displayed' : 'Hidden'}
                            </span>
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
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRarityColor(ticket.rarity)}`}>
                              {ticket.rarity}
                            </span>
                          </div>
                          <p className="text-purple-600 font-semibold mb-1">{ticket.tierName}</p>
                          <p className="text-gray-600 text-sm">{ticket.date} • {ticket.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600 mb-2">{ticket.price}</p>
                          <button
                            onClick={() => toggleDisplayStatus(ticket.id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${ticket.isDisplayed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {ticket.isDisplayed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{ticket.isDisplayed ? 'Displayed' : 'Hidden'}</span>
                          </button>
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
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">Try adjusting your filters or create your first event.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
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
                            ID: {event.eventId}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                          <p className="text-gray-600 text-sm mb-4">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {event.location}
                          </p>
                          <p className="text-gray-600 text-sm mb-4">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {event.startDate} {event.endDate && `- ${event.endDate}`}
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
                            <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                              <BarChart3 className="w-4 h-4" />
                              <span>Analytics</span>
                            </button>
                            <button className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
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
                          <p className="text-gray-600 text-sm mb-1">{event.location}</p>
                          <p className="text-gray-600 text-sm">{event.startDate} {event.endDate && `- ${event.endDate}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600 mb-1">{event.totalTicketsSold} sold</p>
                          <p className="text-sm text-green-600 font-semibold mb-2">{event.totalRevenue} ETH</p>
                          <div className="flex space-x-1">
                            <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
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

        {/* Create Event Tab */}
        {activeTab === 'create-event' && (
          <form onSubmit={handleCreateEvent} className="space-y-8">
            {/* Basic Event Information */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-purple-600" />
                Event Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={eventData.name}
                    onChange={(e) => handleEventDataChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) => handleEventDataChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Describe your event"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={eventData.category}
                    onChange={(e) => handleEventDataChange('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Image URL
                  </label>
                  <input
                    type="url"
                    value={eventData.imageUri}
                    onChange={(e) => handleEventDataChange('imageUri', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventData.location}
                    onChange={(e) => handleEventDataChange('location', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Event location or 'Virtual Event'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={eventData.startDate}
                    onChange={(e) => handleEventDataChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={eventData.startTime}
                    onChange={(e) => handleEventDataChange('startTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={eventData.endDate}
                    onChange={(e) => handleEventDataChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventData.endTime}
                    onChange={(e) => handleEventDataChange('endTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={eventData.website}
                    onChange={(e) => handleEventDataChange('website', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://your-event-website.com"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Tiers */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <DollarSign className="h-6 w-6 mr-3 text-purple-600" />
                  Ticket Tiers
                </h2>
                <button
                  type="button"
                  onClick={addTier}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Tier</span>
                </button>
              </div>

              <div className="space-y-6">
                {ticketTiers.map((tier, index) => (
                  <div key={index} className="p-6 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Tier {index + 1}
                      </h3>
                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100/50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tier Name *
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., General Admission"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (ETH) *
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={tier.price}
                          onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0.1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Supply *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxSupply}
                          onChange={(e) => handleTierChange(index, 'maxSupply', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="1000"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Per Wallet
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxPerWallet}
                          onChange={(e) => handleTierChange(index, 'maxPerWallet', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="5"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={tier.description}
                          onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          placeholder="Describe what this tier includes"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isCreatingEvent || !isConnected}
                className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isCreatingEvent ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                ) : (
                  <Save className="h-6 w-6" />
                )}
                <span className="text-lg font-semibold">
                  {isCreatingEvent ? 'Creating Event...' : 'Create Event'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
