import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Calendar, MapPin, Clock, ExternalLink, Star } from 'lucide-react'
import { useUserTickets } from '../hooks/useUserTickets'
import { useEventContract } from '../hooks/useEventContract'
import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'
import { QRCodeSVG } from 'qrcode.react'; // Make sure to install: npm install qrcode.react

const MyTickets: React.FC = () => {
  const { tickets, loading } = useUserTickets()
  const { hasClaimedBlindBag } = useEventContract()
  const { isConnected, connectWallet } = useWeb3()
  const [qrOpen, setQrOpen] = useState(false)
  const [qrTicket, setQrTicket] = useState<any>(null)

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
    if (!event) return 'unknown'
    const now = Math.floor(Date.now() / 1000)
    if (event.hasEnded) return 'ended'
    if (now >= event.startTime && now <= event.endTime) return 'live'
    if (now < event.startTime) return 'upcoming'
    return 'ended'
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <Ticket className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-purple-200 mb-6">
                Connect your wallet to view your NFT tickets and event history.
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
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
          <h1 className="text-5xl font-bold text-white mb-4">My NFT Tickets</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Your collection of blockchain-verified event tickets
          </p>
        </div>

        {/* Tickets */}
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <Ticket className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
              <p className="text-purple-200 mb-6">
                You haven't purchased any event tickets yet. Explore our amazing events!
              </p>
              <Link
                to="/events"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Browse Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket, index) => {
              const status = getEventStatus(ticket.event)
              const showLuckyDot = (() => {
                if (!ticket.event) return false
                const nowSec = Math.floor(Date.now() / 1000)
                return Boolean(ticket.event.hasEnded) || nowSec >= ticket.event.endTime
              })()
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
                <div
                  key={`${ticket.tokenId}-${ticket.eventId}-${index}`}
                  className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-purple-400 transition-all duration-300 hover:scale-105"
                >
                  {/* Ticket Header */}
                  <div className="relative">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {ticket.event?.name || 'Unknown Event'}
                          </h3>
                          <p className="text-purple-100 text-sm">
                            {ticket.tier?.name || 'General Admission'}
                          </p>
                        </div>
                         <div className="text-right relative">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${statusColors[status]}`}>
                            {statusLabels[status]}
                          </span>
                          {/* Red dot for lucky draw eligibility: show if event ended */}
                          {showLuckyDot && (
                            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-yellow-400 animate-pulse" title="Lucky draw available"></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ticket perforation effect */}
                    <div className="h-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
                      <div className="absolute inset-0 flex justify-center">
                        <div className="w-8 h-8 bg-white/10 rounded-full -mt-2 border-4 border-purple-900"></div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6">
                    {/* Event Details */}
                    <div className="space-y-3 mb-4">
                      {ticket.event && (
                        <>
                          <div className="flex items-center text-purple-200 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(ticket.event.startTime)}</span>
                          </div>

                          <div className="flex items-center text-purple-200 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Ends: {formatDate(ticket.event.endTime)}</span>
                          </div>
                        </>
                      )}

                      <div className="flex items-center text-purple-200 text-sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        <span>Token ID: #{ticket.tokenId}</span>
                      </div>
                    </div>

                    {/* Ticket Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {ticket.isUsed ? (
                          <div className="flex items-center text-green-400">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="text-sm font-semibold">Used</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-blue-400">
                            <Ticket className="w-4 h-4 mr-1" />
                            <span className="text-sm font-semibold">Valid</span>
                          </div>
                        )}
                      </div>

                      {ticket.tier && (
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {ethers.formatEther(ticket.tier.price)} ETH
                          </div>
                          <div className="text-purple-300 text-xs">Purchase Price</div>
                        </div>
                      )}
                    </div>

                    {/* Purchase Date */}
                    <div className="text-xs text-purple-300 border-t border-white/20 pt-3">
                      Purchased: {formatDate(ticket.purchaseTime)}
                    </div>

                    {/* View Event Button */}
                    {ticket.event && (
                      <>
                        <Link
                          to={`/ticketdetails/${ticket.tokenId}`}
                          className="mt-4 block w-full bg-white/10 hover:bg-white/20 text-white text-center py-2 rounded-lg transition-colors text-sm font-semibold"
                        >
                          View Ticket Details
                        </Link>

                        <button
                          className="mt-2 block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-lg transition-colors text-sm font-semibold"
                          onClick={() => { setQrTicket(ticket); setQrOpen(true); }}
                        >
                          Show Ticket QR
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {/* QR Modal */}
        {qrOpen && qrTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center relative">
              <h2 className="text-xl font-bold mb-4 text-purple-700">Ticket QR Code</h2>
              <QRCodeSVG
                value={JSON.stringify({
                  tokenId: qrTicket.tokenId,
                  eventId: qrTicket.eventId,
                  owner: qrTicket.owner
                })}
                size={200}
              />
              <div className="mt-4">
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
                  onClick={() => setQrOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTickets