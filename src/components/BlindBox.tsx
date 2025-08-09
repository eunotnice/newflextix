import React, { useState, useEffect } from 'react'
import { Gift, Sparkles, Star, Zap, Heart, Crown } from 'lucide-react'
import { StickerNFT } from '../hooks/useBlindBagNFT'

interface BlindBoxProps {
  isOpen: boolean
  onClose: () => void
  sticker?: StickerNFT
  onOpenComplete?: () => void
}

const BlindBox: React.FC<BlindBoxProps> = ({ isOpen, onClose, sticker, onOpenComplete }) => {
  const [animationStage, setAnimationStage] = useState<'closed' | 'shaking' | 'opening' | 'revealed' | 'complete'>('closed')
  const [showSparkles, setShowSparkles] = useState(false)

  useEffect(() => {
    if (isOpen && sticker) {
      startOpeningAnimation()
    }
  }, [isOpen, sticker])

  const startOpeningAnimation = () => {
    setAnimationStage('shaking')
    
    // Shaking animation
    setTimeout(() => {
      setAnimationStage('opening')
      setShowSparkles(true)
    }, 1500)
    
    // Reveal sticker
    setTimeout(() => {
      setAnimationStage('revealed')
    }, 3000)
    
    // Complete animation
    setTimeout(() => {
      setAnimationStage('complete')
      onOpenComplete?.()
    }, 5000)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100'
      case 'Uncommon': return 'text-blue-600 bg-blue-100'
      case 'Rare': return 'text-purple-600 bg-purple-100'
      case 'Epic': return 'text-pink-600 bg-pink-100'
      case 'Legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Common': return <Star className="w-4 h-4" />
      case 'Uncommon': return <Zap className="w-4 h-4" />
      case 'Rare': return <Heart className="w-4 h-4" />
      case 'Epic': return <Sparkles className="w-4 h-4" />
      case 'Legendary': return <Crown className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        {/* Background sparkles */}
        {showSparkles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </div>
            ))}
          </div>
        )}

        {/* Blind Box Content */}
        <div className="text-center relative z-10">
          {animationStage === 'closed' && (
            <div className="animate-bounce">
              <Gift className="w-24 h-24 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Blind Box</h2>
              <p className="text-gray-600">Click to open your surprise!</p>
            </div>
          )}

          {animationStage === 'shaking' && (
            <div className="animate-pulse">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-bounce">
                <Gift className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Shaking...</h2>
              <p className="text-gray-600">Something special is inside!</p>
            </div>
          )}

          {animationStage === 'opening' && (
            <div className="animate-pulse">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-spin">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Opening...</h2>
              <p className="text-gray-600">Revealing your sticker!</p>
            </div>
          )}

          {animationStage === 'revealed' && sticker && (
            <div className="animate-fade-in">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-sm font-semibold">{sticker.name}</div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${getRarityColor(sticker.rarity)} mb-4`}>
                {getRarityIcon(sticker.rarity)}
                <span>{sticker.rarity} Sticker</span>
              </div>
              <p className="text-gray-600">You got a {sticker.rarity.toLowerCase()} sticker!</p>
            </div>
          )}

          {animationStage === 'complete' && (
            <div className="animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sticker Added!</h2>
              <p className="text-gray-600">Check your collection to see it!</p>
            </div>
          )}

          {/* Close button */}
          {animationStage === 'complete' && (
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlindBox
