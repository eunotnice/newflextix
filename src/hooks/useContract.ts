import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Inline ABI to avoid build issues
const EVENT_TICKETING_ABI = [
  "function createEvent(string memory _name, string memory _description, uint256 _startTime, uint256 _endTime, string memory _location, string memory _imageUrl, tuple(string name, uint256 price, uint256 maxSupply)[] memory _tiers) external",
  "function purchaseTicket(uint256 _eventId, uint256 _tierId) external payable",
  "function getEvent(uint256 _eventId) external view returns (tuple(uint256 id, string name, string description, uint256 startTime, uint256 endTime, string location, string imageUrl, address organizer, bool isActive, uint256 totalTicketsSold))",
  "function getEventTiers(uint256 _eventId) external view returns (tuple(uint256 id, string name, uint256 price, uint256 maxSupply, uint256 currentSupply)[])",
  "function getUserTickets(address _user) external view returns (tuple(uint256 tokenId, uint256 eventId, uint256 tierId, address owner, bool isUsed)[])",
  "function getAllEvents() external view returns (tuple(uint256 id, string name, string description, uint256 startTime, uint256 endTime, string location, string imageUrl, address organizer, bool isActive, uint256 totalTicketsSold)[])",
  "function eventCount() external view returns (uint256)",
  "event EventCreated(uint256 indexed eventId, string name, address indexed organizer)",
  "event TicketPurchased(uint256 indexed eventId, uint256 indexed tierId, address indexed buyer, uint256 tokenId)"
];

const BLIND_BAG_ABI = [
  "function mintBlindBag(address to) external returns (uint256)",
  "function getTokenMetadata(uint256 tokenId) external view returns (tuple(string name, string description, string imageUrl, uint8 rarity))",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)"
];

export function useContract() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [eventContract, setEventContract] = useState<ethers.Contract | null>(null);
  const [blindBagContract, setBlindBagContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initContracts = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        try {
          const web3Signer = await web3Provider.getSigner();
          setSigner(web3Signer);

          // Use environment variables for contract addresses
          const eventAddress = import.meta.env.VITE_EVENT_TICKETING_CONTRACT;
          const blindBagAddress = import.meta.env.VITE_BLIND_BAG_CONTRACT;

          if (eventAddress) {
            const eventContractInstance = new ethers.Contract(
              eventAddress,
              EVENT_TICKETING_ABI,
              web3Signer
            );
            setEventContract(eventContractInstance);
          }

          if (blindBagAddress) {
            const blindBagContractInstance = new ethers.Contract(
              blindBagAddress,
              BLIND_BAG_ABI,
              web3Signer
            );
            setBlindBagContract(blindBagContractInstance);
          }
        } catch (error) {
          console.error('Error initializing contracts:', error);
        }
      }
    };

    initContracts();
  }, []);

  return {
    provider,
    signer,
    eventContract,
    blindBagContract
  };
}
