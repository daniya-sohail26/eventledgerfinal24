// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketResale is ERC721, Ownable {
    struct Ticket {
        uint256 eventId; // Links to event in MongoDB
        address host; // Host's wallet address
        uint256 originalPrice; // In wei
        uint256 eventDate; // Unix timestamp
        bool isResold; // Tracks if ticket is resold
    }

    mapping(uint256 => Ticket) public tickets; // tokenId => Ticket
    uint256 public ticketCounter; // Tracks token IDs

    event TicketMinted(uint256 indexed tokenId, uint256 eventId, address buyer, address host);
    event TicketResold(uint256 indexed tokenId, address seller, address host, uint256 resalePrice);

    constructor() ERC721("EventLedgerTicket", "ELT") Ownable(msg.sender) {}

    // Mint a ticket (called during initial purchase)
    function mintTicket(
        address buyer,
        uint256 eventId,
        address host,
        uint256 originalPrice,
        uint256 eventDate
    ) external onlyOwner returns (uint256) {
        ticketCounter++;
        uint256 tokenId = ticketCounter;

        tickets[tokenId] = Ticket({
            eventId: eventId,
            host: host,
            originalPrice: originalPrice,
            eventDate: eventDate,
            isResold: false
        });

        _mint(buyer, tokenId);
        emit TicketMinted(tokenId, eventId, buyer, host);
        return tokenId;
    }

    // Resell ticket to host at 20% less price
    function resellTicket(uint256 tokenId) external payable {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        Ticket storage ticket = tickets[tokenId];
        require(!ticket.isResold, "Ticket already resold");
        require(block.timestamp < ticket.eventDate, "Event has occurred");

        uint256 resalePrice = (ticket.originalPrice * 80) / 100; // 20% less
        require(msg.value == resalePrice, "Must send exact resale price");

        ticket.isResold = true;
        _transfer(msg.sender, ticket.host, tokenId);

        // Transfer resale price to host (not seller)
        payable(ticket.host).transfer(resalePrice);

        emit TicketResold(tokenId, msg.sender, ticket.host, resalePrice);
    }

    // Withdraw contract balance (for owner, if needed)
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}