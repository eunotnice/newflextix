import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Shield, Gift, Zap, ArrowRight, Star, Users, Trophy } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure NFT Tickets',
      description: 'Blockchain-secured tickets that cannot be counterfeited or duplicated',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create and manage events with multiple ticket tiers and pricing',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Gift,
      title: 'Blind Bag Rewards',
      description: 'Collect rare NFT stickers and effects after attending events',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'QR code scanning for quick and secure event entry',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { label: 'Events Created', value: '1,234', icon: Calendar },
    { label: 'Tickets Sold', value: '45,678', icon: Shield },
    { label: 'NFTs Collected', value: '12,345', icon: Gift },
    { label: 'Happy Users', value: '8,901', icon: Users }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                NFT Event
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ticketing
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The future of event ticketing with blockchain security, NFT collectibles, and transparent smart contracts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/events"
                className="group flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <span className="text-lg font-semibold">Explore Events</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/create-event"
                className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="text-lg font-semibold">Create Event</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose NFTicket?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of event ticketing with blockchain technology and NFT rewards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Smart Contract Transparency */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Contract Addresses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Full transparency with verified smart contracts on the blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-purple-600" />
                Event Ticketing Contract
              </h3>
              <div className="bg-gray-100/50 rounded-xl p-4 font-mono text-sm break-all">
                0x742d35Cc6634C0532925a3b8D4C9db96590c6C87
              </div>
              <p className="text-gray-600 mt-4">
                Main contract handling event creation, ticket sales, and verification
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Gift className="h-6 w-6 mr-3 text-pink-600" />
                Blind Bag NFT Contract
              </h3>
              <div className="bg-gray-100/50 rounded-xl p-4 font-mono text-sm break-all">
                0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
              </div>
              <p className="text-gray-600 mt-4">
                Contract for minting decorative NFT stickers and effects
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/30 shadow-2xl">
            <Trophy className="h-16 w-16 mx-auto mb-6 text-purple-600" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers and attendees who trust NFTicket for secure, transparent ticketing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="group flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <Star className="h-5 w-5" />
                <span className="text-lg font-semibold">Browse Events</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/create-event"
                className="flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 text-gray-700 hover:bg-white/40 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-lg font-semibold">Create Event</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
