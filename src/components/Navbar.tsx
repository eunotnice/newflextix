import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ticket, Wallet, Menu, X, Calendar, User } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'

const Navbar = () => {
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Calendar },
    { name: 'Events', href: '/events', icon: Ticket },
    { name: 'My Tickets', href: '/my-tickets', icon: Ticket },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              NFTicket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-purple-700 shadow-lg backdrop-blur-sm'
                      : 'text-gray-700 hover:bg-white/10 hover:text-purple-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(account!)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-700 hover:bg-red-500/30 transition-all duration-200 backdrop-blur-sm border border-red-200/50 shadow-lg"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Wallet className="h-4 w-4" />
                <span className="font-medium">Connect Wallet</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-purple-700 shadow-lg backdrop-blur-sm'
                        : 'text-gray-700 hover:bg-white/10 hover:text-purple-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
