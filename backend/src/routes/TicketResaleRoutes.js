const express = require("express");
const Ticket = require("../models/TicketResale");
const Event = require("../models/buyerEvent");
const Host = require("../models/Host"); // Assumes a Host model exists
const { ethers } = require("ethers");
const { getPersonalEvents } = require("../controllers/personalEventsController");
const router = express.Router();

// Dynamically import ABI
const TICKET_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "host",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "originalPrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "eventDate",
          "type": "uint256"
        }
      ],
      "name": "mintTicket",
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "host",
          "type": "address"
        }
      ],
      "name": "TicketMinted",
      "type": "event"
    }
  ];
  
// Contract address from environment variable
const TICKET_CONTRACT_ADDRESS = "0xdE24cda7d6D63bed90f022c9e82482B103dE2715";

// Get tickets owned by a Host
router.get("/Host/:walletAddress", async (req, res) => {
  try {
    const tickets = await Ticket.find({ ownerId: req.params.walletAddress });
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket status (e.g., mark as resold)
router.patch("/:tokenId", async (req, res) => {
  try {
    const { isResold, resaleStatus, soldAt, ownerId } = req.body;
    const ticket = await Ticket.findOneAndUpdate(
      { tokenId: req.params.tokenId },
      { isResold, resaleStatus, soldAt, ownerId },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch multiple events by IDs
router.post("/multiple", async (req, res) => {
  try {
    const { eventIds } = req.body;
    const events = await Event.find({ _id: { $in: eventIds } });
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mint ticket (called after purchase)
router.post("/mint", async (req, res) => {
  const { eventId, buyer, originalPrice } = req.body;
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const host = await Host.findById(event.hostId);
    if (!host) return res.status(404).json({ error: "Host not found" });
    const hostWalletAddress = host.walletAddress;

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(TICKET_CONTRACT_ADDRESS, TICKET_CONTRACT_ABI, wallet);

    const tx = await contract.mintTicket(
      buyer,
      eventId,
      hostWalletAddress,
      ethers.parseEther(event.ticketPriceETH.toString()),
      Math.floor(new Date(event.startDate).getTime() / 1000)
    );
    const receipt = await tx.wait();
    const tokenId = receipt.logs[0].args.tokenId.toString();

    const ticket = new Ticket({
      tokenId,
      eventId,
      ownerId: buyer,
      originalOwnerId: hostWalletAddress,
      nftMetadataUri: "ipfs://QmNFTMetadataExampleHash",
      transactionHash: receipt.transactionHash,
      originalPrice: ethers.parseEther(event.ticketPriceETH.toString()),
      eventDate: event.startDate,
    });
    await ticket.save();

    res.status(200).json({ tokenId, txHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get personal events and tickets for a Host
router.get("/personal/:walletAddress", getPersonalEvents);

module.exports = router;