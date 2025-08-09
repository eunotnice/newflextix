import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

const CONTRACT_ADDRESS = import.meta.env.VITE_EVENT_TICKETING_CONTRACT

// Contract ABI embedded directly to avoid build issues
const EVENT_TICKETING_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "EventCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      }
    ],
    "name": "EventEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      }
    ],
    "name": "TierCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "quantity",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalPrice",
        "type": "uint256"
      }
    ],
    "name": "TicketPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "TicketUsed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "imageUri",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "createEvent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxPerWallet",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "metadataUri",
        "type": "string"
      }
    ],
    "name": "createTicketTier",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "endEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "events",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "imageUri",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasEnded",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "getEventTiers",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "getUserTickets",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "purchaseTicket",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ticketTiers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxPerWallet",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "metadataUri",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tickets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isUsed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "purchaseTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "useTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export interface Event {
  eventId: number
  name: string
  description: string
  imageUri: string
  organizer: string
  startTime: number
  endTime: number
  isActive: boolean
  hasEnded: boolean
}

export interface TicketTier {
  tierId: number
  eventId: number
  name: string
  price: bigint
  maxSupply: number
  currentSupply: number
  maxPerWallet: number
  metadataUri: string
  isActive: boolean
}

export interface Ticket {
  tokenId: number
  eventId: number
  tierId: number
  owner: string
  isUsed: boolean
  purchaseTime: number
}

export const useEventContract = () => {
  const { signer, provider, isConnected } = useWeb3()
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (provider && CONTRACT_ADDRESS) {
      const eventContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EVENT_TICKETING_ABI,
        provider
      )
      setContract(eventContract)
    }
  }, [provider])

  const getContractWithSigner = () => {
    if (!contract || !signer) {
      throw new Error('Contract or signer not available')
    }
    return contract.connect(signer)
  }

  const createEvent = async (
    name: string,
    description: string,
    imageUri: string,
    startTime: Date,
    endTime: Date
  ) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const startTimestamp = Math.floor(startTime.getTime() / 1000)
      const endTimestamp = Math.floor(endTime.getTime() / 1000)

      const tx = await contractWithSigner.createEvent(
        name,
        description,
        imageUri,
        startTimestamp,
        endTimestamp
      )

      toast.loading('Creating event...', { id: 'create-event' })
      const receipt = await tx.wait()
      
      // Find the EventCreated event in the logs
      const eventCreatedLog = receipt.logs.find((log: any) => {
        try {
          const parsed = contract?.interface.parseLog(log)
          return parsed?.name === 'EventCreated'
        } catch {
          return false
        }
      })

      let eventId = 0
      if (eventCreatedLog) {
        const parsed = contract?.interface.parseLog(eventCreatedLog)
        eventId = Number(parsed?.args.eventId)
      }

      toast.success('Event created successfully!', { id: 'create-event' })
      return { eventId, txHash: tx.hash }
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error.reason || 'Failed to create event', { id: 'create-event' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createTicketTier = async (
    eventId: number,
    name: string,
    price: string,
    maxSupply: number,
    maxPerWallet: number,
    metadataUri: string
  ) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const priceInWei = ethers.parseEther(price)

      const tx = await contractWithSigner.createTicketTier(
        eventId,
        name,
        priceInWei,
        maxSupply,
        maxPerWallet,
        metadataUri
      )

      toast.loading('Creating ticket tier...', { id: 'create-tier' })
      const receipt = await tx.wait()

      // Find the TierCreated event in the logs
      const tierCreatedLog = receipt.logs.find((log: any) => {
        try {
          const parsed = contract?.interface.parseLog(log)
          return parsed?.name === 'TierCreated'
        } catch {
          return false
        }
      })

      let tierId = 0
      if (tierCreatedLog) {
        const parsed = contract?.interface.parseLog(tierCreatedLog)
        tierId = Number(parsed?.args.tierId)
      }

      toast.success('Ticket tier created successfully!', { id: 'create-tier' })
      return { tierId, txHash: tx.hash }
    } catch (error: any) {
      console.error('Error creating ticket tier:', error)
      toast.error(error.reason || 'Failed to create ticket tier', { id: 'create-tier' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const purchaseTicket = async (tierId: number, quantity: number, totalPrice: string) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const priceInWei = ethers.parseEther(totalPrice)

      const tx = await contractWithSigner.purchaseTicket(tierId, quantity, {
        value: priceInWei
      })

      toast.loading('Purchasing tickets...', { id: 'purchase-ticket' })
      await tx.wait()

      toast.success(`Successfully purchased ${quantity} ticket(s)!`, { id: 'purchase-ticket' })
      return tx.hash
    } catch (error: any) {
      console.error('Error purchasing ticket:', error)
      toast.error(error.reason || 'Failed to purchase ticket', { id: 'purchase-ticket' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getEvent = async (eventId: number): Promise<Event | null> => {
    try {
      if (!contract) return null
      
      const eventData = await contract.events(eventId)
      return {
        eventId: Number(eventData.eventId),
        name: eventData.name,
        description: eventData.description,
        imageUri: eventData.imageUri,
        organizer: eventData.organizer,
        startTime: Number(eventData.startTime),
        endTime: Number(eventData.endTime),
        isActive: eventData.isActive,
        hasEnded: eventData.hasEnded
      }
    } catch (error) {
      console.error('Error getting event:', error)
      return null
    }
  }

  const getTicketTier = async (tierId: number): Promise<TicketTier | null> => {
    try {
      if (!contract) return null
      
      const tierData = await contract.ticketTiers(tierId)
      return {
        tierId: Number(tierData.tierId),
        eventId: Number(tierData.eventId),
        name: tierData.name,
        price: tierData.price,
        maxSupply: Number(tierData.maxSupply),
        currentSupply: Number(tierData.currentSupply),
        maxPerWallet: Number(tierData.maxPerWallet),
        metadataUri: tierData.metadataUri,
        isActive: tierData.isActive
      }
    } catch (error) {
      console.error('Error getting ticket tier:', error)
      return null
    }
  }

  const getEventTiers = async (eventId: number): Promise<number[]> => {
    try {
      if (!contract) return []
      
      const tierIds = await contract.getEventTiers(eventId)
      return tierIds.map((id: bigint) => Number(id))
    } catch (error) {
      console.error('Error getting event tiers:', error)
      return []
    }
  }

  const getUserTickets = async (userAddress: string, eventId: number): Promise<number[]> => {
    try {
      if (!contract) return []
      
      const ticketIds = await contract.getUserTickets(userAddress, eventId)
      return ticketIds.map((id: bigint) => Number(id))
    } catch (error) {
      console.error('Error getting user tickets:', error)
      return []
    }
  }

  const getTicket = async (tokenId: number): Promise<Ticket | null> => {
    try {
      if (!contract) return null
      
      const ticketData = await contract.tickets(tokenId)
      return {
        tokenId: Number(ticketData.tokenId),
        eventId: Number(ticketData.eventId),
        tierId: Number(ticketData.tierId),
        owner: ticketData.owner,
        isUsed: ticketData.isUsed,
        purchaseTime: Number(ticketData.purchaseTime)
      }
    } catch (error) {
      console.error('Error getting ticket:', error)
      return null
    }
  }

  const useTicket = async (tokenId: number) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const tx = await contractWithSigner.useTicket(tokenId)
      
      toast.loading('Using ticket...', { id: 'use-ticket' })
      await tx.wait()

      toast.success('Ticket used successfully!', { id: 'use-ticket' })
      return tx.hash
    } catch (error: any) {
      console.error('Error using ticket:', error)
      toast.error(error.reason || 'Failed to use ticket', { id: 'use-ticket' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const endEvent = async (eventId: number) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const tx = await contractWithSigner.endEvent(eventId)
      
      toast.loading('Ending event...', { id: 'end-event' })
      await tx.wait()

      toast.success('Event ended successfully!', { id: 'end-event' })
      return tx.hash
    } catch (error: any) {
      console.error('Error ending event:', error)
      toast.error(error.reason || 'Failed to end event', { id: 'end-event' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    contract,
    loading,
    isConnected,
    createEvent,
    createTicketTier,
    purchaseTicket,
    getEvent,
    getTicketTier,
    getEventTiers,
    getUserTickets,
    getTicket,
    useTicket,
    endEvent
  }
}
