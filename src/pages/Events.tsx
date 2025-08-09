import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Search, Filter } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'

const Events: React.FC = () => {
  const { events, loading } = useEvents()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all')

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = (event: any) => {
    const now = Math.floor(Date.now() / 1000)
    if (event.hasEnded) return 'ended'
    if (now >= event.startTime && now <= event.endTime) return 'live'
    if (now < event.startTime) return 'upcoming'
    return 'ended'
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    
    const status = getEventStatus(event)
    return matchesSearch && status === filterStatus
  })

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Explore blockchain-powered events with NFT tickets and exclusive rewards
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live Now</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-purple-200">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No events have been created yet. Be the first to create one!'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event)
              const statusColors = {
                upcoming: 'bg-blue-500',
                live: 'bg-green-500',
                ended: 'bg-gray-500'
              }
              const statusLabels = {
                upcoming: 'Upcoming',
                live: 'Live Now',
                ended: 'Ended'
              }

              return (
                <Link
                  key={event.eventId}
                  to={`/events/${event.eventId}`}
                  className="group block"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-purple-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.imageUri || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop`}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[status]}`}>
                          {statusLabels[status]}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {event.name}
                      </h3>
                      
                      <p className="text-purple-200 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center text-purple-200 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(event.startTime)}</span>
                        </div>
                        
                        <div className="flex items-center text-purple-200 text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Ends: {formatDate(event.endTime)}</span>
                        </div>

                        <div className="flex items-center text-purple-200 text-sm">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="truncate">
                            By: {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-300 font-semibold">
                            NFT Tickets Available
                          </span>
                          <div className="text-right">
                            <div className="text-white font-bold">View Details</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events
