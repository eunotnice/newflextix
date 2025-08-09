import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  chainId: number | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        const signer = await provider.getSigner()
        const network = await provider.getNetwork()

        setProvider(provider)
        setSigner(signer)
        setAccount(accounts[0])
        setChainId(Number(network.chainId))

        toast.success('Wallet connected successfully!')
      } else {
        toast.error('Please install MetaMask!')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    toast.success('Wallet disconnected')
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          
          setProvider(provider)
          setSigner(signer)
          setAccount(accounts[0].address)
          setChainId(Number(network.chainId))
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
        }
      })

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16))
      })
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [])

  const value = {
    account,
    provider,
    signer,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    chainId
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}
