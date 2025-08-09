import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

const CONTRACT_ADDRESS = import.meta.env.VITE_BLIND_BAG_NFT_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

// Import the actual ABI from the JSON file
import contractData from '../contracts/BlindBagNFT.json'

const BLIND_BAG_NFT_ABI = JSON.parse(contractData.abi)

export interface StickerNFT {
  tokenId: number
  name: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
  eventId: number
  category: string
  mintTime: number
  tokenUri: string
}

export const useBlindBagNFT = () => {
  const { signer, provider, isConnected } = useWeb3()
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (provider && CONTRACT_ADDRESS) {
      try {
        const blindBagContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          BLIND_BAG_NFT_ABI,
          provider
        )
        setContract(blindBagContract)
      } catch (error) {
        console.error('Error creating BlindBagNFT contract instance:', error)
        setContract(null)
      }
    }
  }, [provider, signer])

  const getContractWithSigner = () => {
    if (!signer) {
      throw new Error('No signer available')
    }
    return new ethers.Contract(CONTRACT_ADDRESS, BLIND_BAG_NFT_ABI, signer)
  }

  // Mint a random sticker NFT for a user after ticket purchase
  const mintRandomSticker = async (
    to: string,
    eventId: number,
    name: string,
    category: string = 'sticker'
  ): Promise<{ tokenId: number; rarity: string }> => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()

      const tx = await contractWithSigner.mintRandomSticker(to, eventId, name, category)
      toast.loading('Opening blind bag...', { id: 'mint-sticker' })
      
      const receipt = await tx.wait()
      
      // Find the StickerMinted event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contractWithSigner.interface.parseLog(log)
          return parsed?.name === 'StickerMinted'
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = contractWithSigner.interface.parseLog(event)
        const tokenId = Number(parsed.args.tokenId)
        const rarity = await contractWithSigner.getRarityString(parsed.args.rarity)
        
        toast.success(`🎉 You got a ${rarity} sticker!`, { id: 'mint-sticker' })
        return { tokenId, rarity }
      }

      toast.success('Sticker minted successfully!', { id: 'mint-sticker' })
      return { tokenId: 0, rarity: 'Unknown' }
    } catch (error: any) {
      console.error('Error minting sticker:', error)
      toast.error(error.reason || 'Failed to mint sticker', { id: 'mint-sticker' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get user's stickers for a specific event
  const getUserStickers = async (user: string, eventId: number): Promise<StickerNFT[]> => {
    try {
      if (!contract) return []
      
      const tokenIds = await contract.getUserStickers(user, eventId)
      const stickers: StickerNFT[] = []
      
      for (const tokenId of tokenIds) {
        try {
          const stickerData = await contract.stickerNFTs(tokenId)
          const tokenUri = await contract.tokenURI(tokenId)
          const rarityString = await contract.getRarityString(stickerData.rarity)
          
          stickers.push({
            tokenId: Number(tokenId),
            name: stickerData.name,
            rarity: rarityString as any,
            eventId: Number(stickerData.eventId),
            category: stickerData.category,
            mintTime: Number(stickerData.mintTime),
            tokenUri
          })
        } catch (error) {
          console.error(`Error getting sticker ${tokenId}:`, error)
        }
      }
      
      return stickers
    } catch (error) {
      console.error('Error getting user stickers:', error)
      return []
    }
  }

  // Get all user's stickers across all events
  const getAllUserStickers = async (user: string): Promise<StickerNFT[]> => {
    try {
      if (!contract) return []
      
      // This is a simplified approach - in production you might want to track events differently
      const totalSupply = await contract._tokenIdCounter()
      const stickers: StickerNFT[] = []
      
      for (let i = 0; i < totalSupply; i++) {
        try {
          if (await contract._exists(i)) {
            const owner = await contract.ownerOf(i)
            if (owner.toLowerCase() === user.toLowerCase()) {
              const stickerData = await contract.stickerNFTs(i)
              const tokenUri = await contract.tokenURI(i)
              const rarityString = await contract.getRarityString(stickerData.rarity)
              
              stickers.push({
                tokenId: i,
                name: stickerData.name,
                rarity: rarityString as any,
                eventId: Number(stickerData.eventId),
                category: stickerData.category,
                mintTime: Number(stickerData.mintTime),
                tokenUri
              })
            }
          }
        } catch (error) {
          // Skip invalid tokens
          continue
        }
      }
      
      return stickers
    } catch (error) {
      console.error('Error getting all user stickers:', error)
      return []
    }
  }

  // Add sticker template (only owner/organizer can call)
  const addStickerTemplate = async (
    eventId: number,
    templateUri: string,
    rarity: number
  ): Promise<void> => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const tx = await contractWithSigner.addStickerTemplate(eventId, templateUri, rarity)
      toast.loading('Adding sticker template...', { id: 'add-template' })
      
      await tx.wait()
      toast.success('Sticker template added successfully!', { id: 'add-template' })
    } catch (error: any) {
      console.error('Error adding sticker template:', error)
      toast.error(error.reason || 'Failed to add sticker template', { id: 'add-template' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    contract,
    loading,
    mintRandomSticker,
    getUserStickers,
    getAllUserStickers,
    addStickerTemplate
  }
}
