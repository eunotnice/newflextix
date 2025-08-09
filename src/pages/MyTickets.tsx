import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Calendar, MapPin, Clock, ExternalLink, Star, Filter } from 'lucide-react'
import { useUserTickets } from '../hooks/useUserTickets'
import { useEventContract } from '../hooks/useEventContract'
import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'
import { QRCodeSVG } from 'qrcode.react'; // Make sure to install: npm install qrcode.react

type TicketStatus = 'all' | 'upcoming' | 'live' | 'ended' | 'unknown'

const MyTickets: React.FC = () => {
  const { tickets, loading } = useUserTickets()
  const { hasClaimedBlindBag } = useEventContract()
  const { isConnected, connectWallet } = useWeb3()
  const [qrOpen, setQrOpen] = useState(false)
  const [qrTicket, setQrTicket] = useState<any>(null)
  const [hoveredTicket, setHoveredTicket] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<TicketStatus>('all')

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = (event: any): Exclude<TicketStatus, 'all'> => {
    if (!event) return 'unknown'
    const now = Math.floor(Date.now() / 1000)
    if (event.hasEnded) return 'ended'
    if (now >= event.startTime && now <= event.endTime) return 'live'
    if (now < event.startTime) return 'upcoming'
    return 'ended'
  }

  // Filter tickets based on selected status
  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets
    
    return tickets.filter(ticket => {
      const status = getEventStatus(ticket.event)
      return status === statusFilter
    })
  }, [tickets, statusFilter])

  // Calculate ticket counts by status
  const ticketCounts = useMemo(() => {
    const counts = {
      all: tickets.length,
      upcoming: 0,
      live: 0,
      ended: 0,
      unknown: 0
    }

    tickets.forEach(ticket => {
      const status = getEventStatus(ticket.event)
      counts[status]++
    })

    return counts
  }, [tickets])

  const filterOptions = [
    { value: 'all' as TicketStatus, label: 'All Tickets', count: ticketCounts.all },
    { value: 'upcoming' as TicketStatus, label: 'Upcoming', count: ticketCounts.upcoming },
    { value: 'live' as TicketStatus, label: 'Live Now', count: ticketCounts.live },
    { value: 'ended' as TicketStatus, label: 'Ended', count: ticketCounts.ended },
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-auto border border-white/30 shadow-2xl">
              <Ticket className="w-16 h-16 text-purple-300 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-purple-200 mb-6">
                Connect your wallet to view your NFT tickets and event history.
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">My NFT Tickets</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Your collection of blockchain-verified event tickets
          </p>
        </div>

        {/* Filter Section */}
        {tickets.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-purple-300 mr-2" />
                  <h3 className="text-lg font-semibold text-white">Filter Tickets</h3>
                </div>
                <div className="text-purple-200 text-sm">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                      statusFilter === option.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white border border-white/20 hover:border-white/30'
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        statusFilter === option.value
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-600/30 text-purple-200'
                      }`}>
                        {option.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Status Legend */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                    <span className="text-purple-200">Upcoming Events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 animate-pulse"></div>
                    <span className="text-purple-200">Live Events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-slate-400"></div>
                    <span className="text-purple-200">Ended Events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-ping"></div>
                    <span className="text-purple-200">Lucky Draw Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tickets */}
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-auto border border-white/30 shadow-2xl">
              <Ticket className="w-16 h-16 text-purple-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
              <p className="text-purple-200 mb-6">
                You haven't purchased any event tickets yet. Explore our amazing events!
              </p>
              <Link
                to="/events"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Browse Events
              </Link>
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-auto border border-white/30 shadow-2xl">
              <Filter className="w-16 h-16 text-purple-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-white mb-2">No {statusFilter} Tickets</h3>
              <p className="text-purple-200 mb-6">
                You don't have any {statusFilter} tickets at the moment.
              </p>
              <button
                onClick={() => setStatusFilter('all')}
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Show All Tickets
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTickets.map((ticket, index) => {
              const status = getEventStatus(ticket.event)
              const showLuckyDot = (() => {
                if (!ticket.event) return false
                const nowSec = Math.floor(Date.now() / 1000)
                return Boolean(ticket.event.hasEnded) || nowSec >= ticket.event.endTime
              })()
              
              const ticketId = `${ticket.tokenId}-${ticket.eventId}-${index}`
              const isHovered = hoveredTicket === ticketId
              
              // Enhanced status colors with gradients
              const statusStyles = {
                upcoming: 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-blue-500/30',
                live: 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-green-500/30 animate-pulse',
                ended: 'bg-gradient-to-r from-gray-500 to-slate-400 shadow-gray-500/30',
                unknown: 'bg-gradient-to-r from-gray-500 to-slate-400 shadow-gray-500/30'
              }
              
              const statusLabels = {
                upcoming: 'Upcoming',
                live: 'Live Now',
                ended: 'Ended',
                unknown: 'Unknown'
              }

              return (
                <div
                  key={ticketId}
                  className={`bg-white/15 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/30 transition-all duration-500 cursor-pointer shadow-2xl ${
                    isHovered 
                      ? 'transform scale-105 border-purple-400/60 shadow-purple-500/40 shadow-2xl bg-white/20' 
                      : 'hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/20'
                  }`}
                  onMouseEnter={() => setHoveredTicket(ticketId)}
                  onMouseLeave={() => setHoveredTicket(null)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Ticket Header */}
                  <div className="relative overflow-hidden">
                    <div className={`bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-6 transition-all duration-300 ${
                      isHovered ? 'from-purple-700 via-pink-700 to-purple-800' : ''
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 truncate">
                            {ticket.event?.name || 'Unknown Event'}
                          </h3>
                          <p className="text-purple-100 text-sm">
                            {ticket.tier?.name || 'General Admission'}
                          </p>
                        </div>
                        <div className="text-right relative ml-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg transition-all duration-300 ${statusStyles[status]} ${
                            isHovered ? 'scale-110' : ''
                          }`}>
                            {statusLabels[status]}
                          </span>
                          {/* Enhanced lucky dot with animation */}
                          {showLuckyDot && (
                            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-ping" title="Lucky draw available">
                              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse"></span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className={`w-full h-full bg-gradient-to-br from-white/20 to-transparent transition-transform duration-700 ${
                          isHovered ? 'scale-110 rotate-1' : ''
                        }`}></div>
                      </div>
                    </div>

                    {/* Enhanced ticket perforation effect */}
                    <div className="h-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
                      <div className="absolute inset-0 flex justify-center">
                        <div className={`w-10 h-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-full -mt-3 border-4 transition-all duration-300 ${
                          isHovered ? 'border-purple-400 scale-110' : 'border-purple-600'
                        }`}>
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/5"></div>
                        </div>
                      </div>
                      {/* Side perforations */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-full -ml-2"></div>
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-full -mr-2"></div>
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6">
                    {/* Event Details with enhanced styling */}
                    <div className="space-y-4 mb-6">
                      {ticket.event && (
                        <>
                          <div className={`flex items-center text-purple-200 text-sm transition-all duration-300 ${
                            isHovered ? 'text-purple-100 transform translate-x-1' : ''
                          }`}>
                            <Calendar className={`w-5 h-5 mr-3 transition-all duration-300 ${
                              isHovered ? 'text-purple-300 scale-110' : ''
                            }`} />
                            <span className="font-medium">{formatDate(ticket.event.startTime)}</span>
                          </div>

                          <div className={`flex items-center text-purple-200 text-sm transition-all duration-300 ${
                            isHovered ? 'text-purple-100 transform translate-x-1' : ''
                          }`}>
                            <Clock className={`w-5 h-5 mr-3 transition-all duration-300 ${
                              isHovered ? 'text-purple-300 scale-110' : ''
                            }`} />
                            <span className="font-medium">Ends: {formatDate(ticket.event.endTime)}</span>
                          </div>
                        </>
                      )}

                      <div className={`flex items-center text-purple-200 text-sm transition-all duration-300 ${
                        isHovered ? 'text-purple-100 transform translate-x-1' : ''
                      }`}>
                        <ExternalLink className={`w-5 h-5 mr-3 transition-all duration-300 ${
                          isHovered ? 'text-purple-300 scale-110' : ''
                        }`} />
                        <span className="font-medium">Token ID: #{ticket.tokenId}</span>
                      </div>
                    </div>

                    {/* Enhanced Ticket Status */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        {ticket.isUsed ? (
                          <div className={`flex items-center text-green-400 transition-all duration-300 ${
                            isHovered ? 'scale-110 text-green-300' : ''
                          }`}>
                            <Star className="w-5 h-5 mr-2" />
                            <span className="text-sm font-bold">Used</span>
                          </div>
                        ) : (
                          <div className={`flex items-center text-blue-400 transition-all duration-300 ${
                            isHovered ? 'scale-110 text-blue-300' : ''
                          }`}>
                            <Ticket className="w-5 h-5 mr-2" />
                            <span className="text-sm font-bold">Valid</span>
                          </div>
                        )}
                      </div>

                      {ticket.tier && (
                        <div className={`text-right transition-all duration-300 ${
                          isHovered ? 'transform scale-105' : ''
                        }`}>
                          <div className="text-white font-bold text-lg">
                            {ethers.formatEther(ticket.tier.price)} ETH
                          </div>
                          <div className="text-purple-300 text-xs font-medium">Purchase Price</div>
                        </div>
                      )}
                    </div>

                    {/* Purchase Date */}
                    <div className="text-xs text-purple-300 border-t border-white/30 pt-4 mb-4 font-medium">
                      Purchased: {formatDate(ticket.purchaseTime)}
                    </div>

                    {/* Enhanced Action Buttons */}
                    {ticket.event && (
                      <div className="space-y-3">
                        <Link
                          to={`/ticketdetails/${ticket.tokenId}`}
                          className={`block w-full bg-white/10 hover:bg-white/20 text-white text-center py-3 rounded-xl transition-all text-sm font-semibold border border-white/20 hover:border-white/40 ${
                            isHovered ? 'transform scale-102 shadow-lg' : ''
                          }`}
                        >
                          View Ticket Details
                        </Link>

                        <button
                          className={`block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center py-3 rounded-xl transition-all text-sm font-semibold shadow-lg hover:shadow-xl ${
                            isHovered ? 'transform scale-102 shadow-purple-500/30' : ''
                          }`}
                          onClick={() => { setQrTicket(ticket); setQrOpen(true); }}
                        >
                          Show Ticket QR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Enhanced QR Modal */}
        {qrOpen && qrTicket && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center relative max-w-sm mx-4 transform animate-scale-in">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl leading-none transition-colors"
                onClick={() => setQrOpen(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6 text-purple-700">Ticket QR Code</h2>
              <div className="bg-white p-4 rounded-xl shadow-inner mb-6">
                <QRCodeSVG
                  value={JSON.stringify({
                    tokenId: qrTicket.tokenId,
                    eventId: qrTicket.eventId,
                    owner: qrTicket.owner
                  })}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                onClick={() => setQrOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default MyTickets