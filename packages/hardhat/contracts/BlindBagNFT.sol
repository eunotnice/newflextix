// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BlindBagNFT
 * @dev Decorative NFT stickers/effects with random rarity system
 */
contract BlindBagNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }
    
    struct StickerNFT {
        uint256 tokenId;
        string name;
        Rarity rarity;
        uint256 eventId;
        string category; // "sticker", "effect", "badge"
        uint256 mintTime;
    }
    
    mapping(uint256 => StickerNFT) public stickerNFTs;
    mapping(uint256 => string[]) public eventStickerTemplates; // eventId => template URIs
    mapping(Rarity => uint256) public rarityWeights;
    
    event StickerMinted(uint256 indexed tokenId, address indexed to, Rarity rarity, uint256 indexed eventId);
    event TemplateAdded(uint256 indexed eventId, string templateUri, Rarity rarity);
    
    constructor() ERC721("EventSticker", "ESTK") {
        // Set rarity weights (out of 1000)
        rarityWeights[Rarity.COMMON] = 500;     // 50%
        rarityWeights[Rarity.UNCOMMON] = 300;   // 30%
        rarityWeights[Rarity.RARE] = 150;       // 15%
        rarityWeights[Rarity.EPIC] = 40;        // 4%
        rarityWeights[Rarity.LEGENDARY] = 10;   // 1%
    }
    
    /**
     * @dev Add sticker templates for an event
     */
    function addStickerTemplate(
        uint256 _eventId,
        string memory _templateUri,
        Rarity _rarity
    ) external onlyOwner {
        eventStickerTemplates[_eventId].push(_templateUri);
        emit TemplateAdded(_eventId, _templateUri, _rarity);
    }
    
    /**
     * @dev Mint a random sticker NFT
     */
    function mintRandomSticker(
        address _to,
        uint256 _eventId,
        string memory _name,
        string memory _category
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Generate random rarity
        Rarity rarity = _generateRandomRarity();
        
        // Select random template URI (simplified - in production would be more sophisticated)
        string[] memory templates = eventStickerTemplates[_eventId];
        require(templates.length > 0, "No templates available for this event");
        
        uint256 templateIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            _to,
            tokenId
        ))) % templates.length;
        
        string memory tokenUri = templates[templateIndex];
        
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        
        stickerNFTs[tokenId] = StickerNFT({
            tokenId: tokenId,
            name: _name,
            rarity: rarity,
            eventId: _eventId,
            category: _category,
            mintTime: block.timestamp
        });
        
        emit StickerMinted(tokenId, _to, rarity, _eventId);
        return tokenId;
    }
    
    /**
     * @dev Generate random rarity based on weights
     */
    function _generateRandomRarity() internal view returns (Rarity) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        ))) % 1000;
        
        uint256 cumulativeWeight = 0;
        
        for (uint256 i = 0; i < 5; i++) {
            cumulativeWeight += rarityWeights[Rarity(i)];
            if (randomNum < cumulativeWeight) {
                return Rarity(i);
            }
        }
        
        return Rarity.COMMON; // Fallback
    }
    
    /**
     * @dev Get rarity string
     */
    function getRarityString(Rarity _rarity) external pure returns (string memory) {
        if (_rarity == Rarity.COMMON) return "Common";
        if (_rarity == Rarity.UNCOMMON) return "Uncommon";
        if (_rarity == Rarity.RARE) return "Rare";
        if (_rarity == Rarity.EPIC) return "Epic";
        if (_rarity == Rarity.LEGENDARY) return "Legendary";
        return "Unknown";
    }
    
    /**
     * @dev Get user's stickers for an event
     */
    function getUserStickers(address _user, uint256 _eventId) external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory userStickers = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == _user && stickerNFTs[i].eventId == _eventId) {
                userStickers[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userStickers[i];
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
