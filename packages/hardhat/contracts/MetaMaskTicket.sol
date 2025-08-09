// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MetaMaskTicket
 * @dev A simple ERC721-based NFT contract for MetaMask-compatible, non-transferable tickets with check-in functionality
 */
contract EventTicketing is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;

    mapping(uint256 => address) public ticketOwner;
    mapping(uint256 => bool) public isCheckedIn;

    event TicketMinted(uint256 indexed tokenId, address indexed to, string tokenUri);
    event TicketCheckedIn(uint256 indexed tokenId, address indexed owner);

    constructor() ERC721("MetaMask Ticket", "MMTIX") {
        transferOwnership(msg.sender);
    }

    function mintTo(address to, string memory tokenUri) external onlyOwner returns (uint256 tokenId) {
        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        ticketOwner[tokenId] = to;

        emit TicketMinted(tokenId, to, tokenUri);
    }

    function checkIn(uint256 tokenId) external {
        require(_exists(tokenId), "Ticket does not exist");
        require(ticketOwner[tokenId] == msg.sender, "Not authorized to check in");
        require(!isCheckedIn[tokenId], "Ticket already checked in");

        isCheckedIn[tokenId] = true;

        emit TicketCheckedIn(tokenId, msg.sender);
    }

    // Override transfer functions to make the ticket soulbound (non-transferable)
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        
        if (from != address(0)) {
            revert("Ticket is non-transferable");
        }
    }

    // SupportsInterface implementation for OpenZeppelin 4.9.3
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}