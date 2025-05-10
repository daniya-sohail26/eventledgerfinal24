// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTicketing {

    event TicketPurchased(address indexed buyer, uint256 ticketId, string ticketType, uint256 price, uint256 eventId, string nftMetadataUri, string qrCodeMetadata);
    event TicketVerified(uint256 ticketId, bool isValid);

    struct Ticket {
        uint256 ticketId;
        uint256 eventId;
        string ticketType;
        address owner;
        string nftMetadataUri;
        string transactionHash;
        uint256 price;
        bool isVerified;
        uint256 purchasedAt;
        string qrCodeMetadata; // Metadata related to QR code (could be IPFS URI or string for frontend generation)
    }

    mapping(uint256 => Ticket) public tickets;
    uint256 public ticketCounter;
    
    address public admin;
    
    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function buyTicket(uint256 _eventId, string memory _ticketType, string memory _nftMetadataUri) external payable {
        uint256 price = getTicketPrice(_ticketType); 
        require(msg.value >= price, "Insufficient funds");

        ticketCounter++;
        
        // Generate QR Code Metadata (link or string, for example IPFS URI)
        string memory qrCodeMetadata = string(abi.encodePacked("https://example.com/qr/", uint2str(ticketCounter)));

        tickets[ticketCounter] = Ticket({
            ticketId: ticketCounter,
            eventId: _eventId,
            ticketType: _ticketType,
            owner: msg.sender,
            nftMetadataUri: _nftMetadataUri,
            transactionHash: "", 
            price: price,
            isVerified: false,
            purchasedAt: block.timestamp,
            qrCodeMetadata: qrCodeMetadata
        });

        emit TicketPurchased(msg.sender, ticketCounter, _ticketType, price, _eventId, _nftMetadataUri, qrCodeMetadata);
    }

    function verifyTicket(uint256 _ticketId) external onlyAdmin {
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.ticketId != 0, "Ticket does not exist");

        ticket.isVerified = true;
        emit TicketVerified(_ticketId, true);
    }

    function setTransactionHash(uint256 _ticketId, string memory _transactionHash) external onlyAdmin {
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.ticketId != 0, "Ticket does not exist");
        ticket.transactionHash = _transactionHash;
    }

    function getTicketPrice(string memory _ticketType) public pure returns (uint256) {
        if (keccak256(bytes(_ticketType)) == keccak256(bytes("General Admission"))) {
            return 0.05 ether; 
        }
        return 0.1 ether; 
    }

    function withdraw() external onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }
    function uint2str(uint _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
}