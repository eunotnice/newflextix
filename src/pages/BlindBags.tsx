import React, { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { Gift, Sparkles, Package, Star, Trophy, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface BlindBag {
  id: number
  name: string
  price: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  image: string
  description: string
  totalSupply: number
  remaining: number
}

const BlindBags: React.FC = () => {
  const { account, connectWallet } = useWeb3()
  const [blindBags, setBlindBags] = useState<BlindBag[]>([])
  const [loading, setLoading] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null)

  useEffect(() => {
    // Mock data for blind bags
    const mockBlindBags: BlindBag[] = [
      {
        id: 1,
        name: 'Mystery Concert Pack',
        price: '0.05',
        rarity: 'Common',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        description: 'Contains exclusive concert memorabilia and potential VIP upgrades',
        totalSupply: 1000,
        remaining: 847
      },
      {
        id: 2,
        name: 'Festival Legends Box',
        price: '0.1',
        rarity: 'Rare',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        description: 'Rare collectibles from legendary festival performances',
        totalSupply: 500,
        remaining: 234
      },
      {
        id: 3,
        name: 'VIP Experience Vault',
        price: '0.25',
        rarity: 'Epic',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        description: 'Epic rewards including backstage passes and artist meet & greets',
        totalSupply: 200,
        remaining: 89
      },
      {
        id: 4,
        name: 'Artist Signature Series',
        price: '0.5',
        rarity: 'Legendary',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        description: 'Ultra-rare signed memorabilia and exclusive artist collaborations',
        totalSupply: 50,
        remaining: 12
      }
    ]
    setBlindBags(mockBlindBags)
  }, [])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100'
      case 'Rare': return 'text-blue-600 bg-blue-100'
      case 'Epic': return 'text-purple-600 bg-purple-100'
      case 'Legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Common': return <Package className="w-4 h-4" />
      case 'Rare': return <Star className="w-4 h-4" />
      case 'Epic': return <Trophy className="w-4 h-4" />
      case 'Legendary': return <Zap className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const handlePurchase = async (bagId: number) => {
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    setPurchaseLoading(bagId)
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update remaining count
      setBlindBags(prev => prev.map(bag => 
        bag.id === bagId 
          ? { ...bag, remaining: Math.max(0, bag.remaining - 1) }
          : bag
      ))
      
      toast.success('Blind bag purchased successfully! Check your wallet for the NFT.')
    } catch (error) {
      toast.error('Failed to purchase blind bag')
    } finally {
      setPurchaseLoading(null)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gift className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Mystery Blind Bags</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exclusive NFT collectibles and rare event experiences. Each blind bag contains 
            surprise rewards that could unlock VIP access, memorabilia, or legendary items.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">1,750</h3>
            <p className="text-gray-600">Total Bags Available</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">1,182</h3>
            <p className="text-gray-600">Bags Remaining</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">568</h3>
            <p className="text-gray-600">Bags Opened</p>
          </div>
        </div>

        {/* Blind Bags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {blindBags.map((bag) => (
            <div key={bag.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={bag.image} 
                  alt={bag.name}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getRarityColor(bag.rarity)}`}>
                  {getRarityIcon(bag.rarity)}
                  {bag.rarity}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{bag.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{bag.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">{bag.price} ETH</span>
                  <span className="text-sm text-gray-500">{bag.remaining}/{bag.totalSupply} left</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(bag.remaining / bag.totalSupply) * 100}%` }}
                  ></div>
                </div>
                
                <button
                  onClick={() => handlePurchase(bag.id)}
                  disabled={bag.remaining === 0 || purchaseLoading === bag.id || !account}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchaseLoading === bag.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : bag.remaining === 0 ? (
                    'Sold Out'
                  ) : !account ? (
                    'Connect Wallet'
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      Purchase Bag
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Blind Bags Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Choose Your Bag</h3>
              <p className="text-gray-600">Select from different rarity tiers, each with unique rewards and experiences.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Open & Discover</h3>
              <p className="text-gray-600">Reveal your mystery NFT and discover exclusive rewards, from memorabilia to VIP access.</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Enjoy Rewards</h3>
              <p className="text-gray-600">Use your NFTs for event access, trade with others, or keep as collectibles.</p>
            </div>
          </div>
        </div>

        {/* Connect Wallet CTA */}
        {!account && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Collecting?</h2>
              <p className="text-purple-100 mb-6">Connect your wallet to purchase blind bags and start your NFT collection journey.</p>
              <button
                onClick={connectWallet}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlindBags
