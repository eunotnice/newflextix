// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MetaMaskTicket
 * @dev NFT-based ticketing system with check-in functionality and non-transferable tickets
 */
contract MetaMaskTicket is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct Ticket {
        uint256 tokenId;
        address owner;
        string metadataUri;
        bool isCheckedIn;
        uint256 mintTime;
    }
    
    // Mappings
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;
    
    // Events
    event TicketMinted(uint256 indexed tokenId, address indexed to, string metadataUri);
    event TicketCheckedIn(uint256 indexed tokenId, address indexed owner);
    
    constructor() ERC721("MetaMask Ticket", "MMTIX") {
        transferOwnership(msg.sender);
    }
    
    /**
     * @dev Mint a new ticket to specified address
     */
    function mintTo(address to, string memory metadataUri) external onlyOwner nonReentrant returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataUri);
        
        tickets[tokenId] = Ticket({
            tokenId: tokenId,
            owner: to,
            metadataUri: metadataUri,
            isCheckedIn: false,
            mintTime: block.timestamp
        });
        
        userTickets[to].push(tokenId);
        
        emit TicketMinted(tokenId, to, metadataUri);
        return tokenId;
    }
    
    /**
     * @dev Check in with a ticket
     */
    function checkIn(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "Ticket does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(!tickets[tokenId].isCheckedIn, "Ticket already checked in");
        
        tickets[tokenId].isCheckedIn = true;
        emit TicketCheckedIn(tokenId, msg.sender);
    }
    
    /**
     * @dev Get all tickets owned by an address
     */
    function getTicketsByOwner(address owner) external view returns (uint256[] memory) {
        return userTickets[owner];
    }
    
    /**
     * @dev Get ticket details
     */
    function getTicketDetails(uint256 tokenId) external view returns (Ticket memory) {
        require(_exists(tokenId), "Ticket does not exist");
        return tickets[tokenId];
    }
    
    /**
     * @dev Make tickets non-transferable (soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0)) {
            revert("Tickets are non-transferable");
        }
    }
    
    // The following functions are overrides required by Solidity.
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