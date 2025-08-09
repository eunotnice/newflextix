// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EventTicketing
 * @dev NFT-based event ticketing system with multiple tiers and blind bag rewards
 */
contract EventTicketing is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _eventIdCounter;
    
    struct Event {
        uint256 eventId;
        string name;
        string description;
        string imageUri;
        address organizer;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool hasEnded;
    }
    
    struct TicketTier {
        uint256 tierId;
        uint256 eventId;
        string name;
        uint256 price;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 maxPerWallet;
        string metadataUri;
        bool isActive;
    }
    
    struct Ticket {
        uint256 tokenId;
        uint256 eventId;
        uint256 tierId;
        address owner;
        bool isUsed;
        uint256 purchaseTime;
    }
    
    struct BlindBagReward {
        uint256 rewardId;
        uint256 eventId;
        string name;
        string metadataUri;
        uint256 rarity; // 1-100, lower is rarer
        bool isActive;
    }
    
    // Mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => TicketTier) public ticketTiers;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => BlindBagReward) public blindBagRewards;
    mapping(uint256 => uint256[]) public eventTiers; // eventId => tierIds[]
    mapping(uint256 => uint256[]) public eventRewards; // eventId => rewardIds[]
    mapping(address => mapping(uint256 => uint256)) public walletTierPurchases; // wallet => tierId => count
    mapping(address => mapping(uint256 => bool)) public hasClaimedBlindBag; // wallet => eventId => claimed
    
    // Events
    event EventCreated(uint256 indexed eventId, string name, address indexed organizer);
    event TierCreated(uint256 indexed tierId, uint256 indexed eventId, string name, uint256 price);
    event TicketPurchased(uint256 indexed tokenId, uint256 indexed eventId, uint256 indexed tierId, address buyer);
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId);
    event BlindBagClaimed(uint256 indexed eventId, address indexed claimer, uint256 indexed rewardId);
    event EventEnded(uint256 indexed eventId);
    
    constructor() ERC721("EventTicket", "ETKT") {}
    
    /**
     * @dev Create a new event
     */
    function createEvent(
        string memory _name,
        string memory _description,
        string memory _imageUri,
        uint256 _startTime,
        uint256 _endTime
    ) external returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        
        uint256 eventId = _eventIdCounter.current();
        _eventIdCounter.increment();
        
        events[eventId] = Event({
            eventId: eventId,
            name: _name,
            description: _description,
            imageUri: _imageUri,
            organizer: msg.sender,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            hasEnded: false
        });
        
        emit EventCreated(eventId, _name, msg.sender);
        return eventId;
    }
    
    /**
     * @dev Create a ticket tier for an event
     */
    function createTicketTier(
        uint256 _eventId,
        string memory _name,
        uint256 _price,
        uint256 _maxSupply,
        uint256 _maxPerWallet,
        string memory _metadataUri
    ) external returns (uint256) {
        require(events[_eventId].organizer == msg.sender, "Only event organizer can create tiers");
        require(events[_eventId].isActive, "Event is not active");
        require(_maxSupply > 0, "Max supply must be greater than 0");
        
        uint256 tierId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        ticketTiers[tierId] = TicketTier({
            tierId: tierId,
            eventId: _eventId,
            name: _name,
            price: _price,
            maxSupply: _maxSupply,
            currentSupply: 0,
            maxPerWallet: _maxPerWallet,
            metadataUri: _metadataUri,
            isActive: true
        });
        
        eventTiers[_eventId].push(tierId);
        
        emit TierCreated(tierId, _eventId, _name, _price);
        return tierId;
    }
    
    /**
     * @dev Purchase tickets for a specific tier
     */
    function purchaseTicket(uint256 _tierId, uint256 _quantity) external payable nonReentrant {
        TicketTier storage tier = ticketTiers[_tierId];
        Event storage eventData = events[tier.eventId];
        
        require(tier.isActive, "Tier is not active");
        require(eventData.isActive, "Event is not active");
        require(block.timestamp < eventData.startTime, "Event has already started");
        require(tier.currentSupply + _quantity <= tier.maxSupply, "Not enough tickets available");
        require(walletTierPurchases[msg.sender][_tierId] + _quantity <= tier.maxPerWallet, "Exceeds max per wallet");
        require(msg.value >= tier.price * _quantity, "Insufficient payment");
        
        // Mint tickets
        for (uint256 i = 0; i < _quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, tier.metadataUri);
            
            tickets[tokenId] = Ticket({
                tokenId: tokenId,
                eventId: tier.eventId,
                tierId: _tierId,
                owner: msg.sender,
                isUsed: false,
                purchaseTime: block.timestamp
            });
            
            emit TicketPurchased(tokenId, tier.eventId, _tierId, msg.sender);
        }
        
        tier.currentSupply += _quantity;
        walletTierPurchases[msg.sender][_tierId] += _quantity;
        
        // Transfer payment to organizer
        payable(eventData.organizer).transfer(msg.value);
    }
    
    /**
     * @dev Use a ticket for event entry (only organizer can call)
     */
    function useTicket(uint256 _tokenId) external {
        Ticket storage ticket = tickets[_tokenId];
        Event storage eventData = events[ticket.eventId];
        
        require(eventData.organizer == msg.sender, "Only event organizer can use tickets");
        require(!ticket.isUsed, "Ticket already used");
        require(block.timestamp >= eventData.startTime, "Event has not started yet");
        require(block.timestamp <= eventData.endTime, "Event has ended");
        
        ticket.isUsed = true;
        emit TicketUsed(_tokenId, ticket.eventId);
    }
    
    /**
     * @dev Create blind bag rewards for an event
     */
    function createBlindBagReward(
        uint256 _eventId,
        string memory _name,
        string memory _metadataUri,
        uint256 _rarity
    ) external returns (uint256) {
        require(events[_eventId].organizer == msg.sender, "Only event organizer can create rewards");
        require(_rarity >= 1 && _rarity <= 100, "Rarity must be between 1-100");
        
        uint256 rewardId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        blindBagRewards[rewardId] = BlindBagReward({
            rewardId: rewardId,
            eventId: _eventId,
            name: _name,
            metadataUri: _metadataUri,
            rarity: _rarity,
            isActive: true
        });
        
        eventRewards[_eventId].push(rewardId);
        return rewardId;
    }
    
    /**
     * @dev Claim blind bag reward after event ends
     */
    function claimBlindBag(uint256 _eventId) external nonReentrant {
        Event storage eventData = events[_eventId];
        require(eventData.hasEnded, "Event has not ended yet");
        require(!hasClaimedBlindBag[msg.sender][_eventId], "Already claimed blind bag for this event");
        require(hasAttendedEvent(msg.sender, _eventId), "Must have attended event to claim");
        
        hasClaimedBlindBag[msg.sender][_eventId] = true;
        
        // Generate pseudo-random reward
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _eventId
        ))) % 100 + 1;
        
        uint256[] memory rewards = eventRewards[_eventId];
        uint256 selectedRewardId = 0;
        
        // Select reward based on rarity
        for (uint256 i = 0; i < rewards.length; i++) {
            BlindBagReward memory reward = blindBagRewards[rewards[i]];
            if (reward.isActive && randomSeed <= reward.rarity) {
                selectedRewardId = rewards[i];
                break;
            }
        }
        
        if (selectedRewardId > 0) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, blindBagRewards[selectedRewardId].metadataUri);
            
            emit BlindBagClaimed(_eventId, msg.sender, selectedRewardId);
        }
    }
    
    /**
     * @dev End an event (only organizer)
     */
    function endEvent(uint256 _eventId) external {
        Event storage eventData = events[_eventId];
        require(eventData.organizer == msg.sender, "Only event organizer can end event");
        require(block.timestamp >= eventData.endTime, "Event end time not reached");
        
        eventData.hasEnded = true;
        emit EventEnded(_eventId);
    }
    
    /**
     * @dev Check if user has attended an event
     */
    function hasAttendedEvent(address _user, uint256 _eventId) public view returns (bool) {
        uint256 totalSupply = _tokenIdCounter.current();
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i)) {
                Ticket memory ticket = tickets[i];
                if (ticket.eventId == _eventId && ticket.owner == _user && ticket.isUsed) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * @dev Get event tiers
     */
    function getEventTiers(uint256 _eventId) external view returns (uint256[] memory) {
        return eventTiers[_eventId];
    }
    
    /**
     * @dev Get event rewards
     */
    function getEventRewards(uint256 _eventId) external view returns (uint256[] memory) {
        return eventRewards[_eventId];
    }
    
    /**
     * @dev Get user's tickets for an event
     */
    function getUserTickets(address _user, uint256 _eventId) external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory userTickets = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == _user && tickets[i].eventId == _eventId) {
                userTickets[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userTickets[i];
        }
        
        return result;
    }
    
    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}