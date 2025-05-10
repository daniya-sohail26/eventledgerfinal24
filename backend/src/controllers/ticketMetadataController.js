const TicketMetadata = require("../models/ticketMetadata");

// Create a new ticket metadata entry
exports.createTicketMetadata = async (req, res) => {
  try {
    const {
      ticketId,
      eventId,
      ticketType,
      owner,
      nftMetadataUri,
      transactionHash,
      price,
      purchasedAt,
      qrCodeMetadata,
    } = req.body;

    // Validate required fields
    if (
      !ticketId ||
      !eventId ||
      !ticketType ||
      !owner ||
      !nftMetadataUri ||
      !transactionHash ||
      !price ||
      !purchasedAt ||
      !qrCodeMetadata
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check for duplicate ticketId
    const existingTicket = await TicketMetadata.findOne({ ticketId });
    if (existingTicket) {
      return res.status(400).json({ error: "Ticket ID already exists" });
    }

    const ticketMetadata = new TicketMetadata({
      ticketId,
      eventId,
      ticketType,
      owner,
      nftMetadataUri,
      transactionHash,
      price,
      purchasedAt,
      qrCodeMetadata,
    });

    await ticketMetadata.save();
    res.status(201).json({ message: "Ticket metadata saved successfully", ticketMetadata });
  } catch (err) {
    console.error("Error saving ticket metadata:", err);
    res.status(500).json({ error: "Failed to save ticket metadata" });
  }
};

// Get ticket metadata by ticketId
exports.getTicketMetadata = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticketMetadata = await TicketMetadata.findOne({ ticketId });
    if (!ticketMetadata) {
      return res.status(404).json({ error: "Ticket metadata not found" });
    }
    res.status(200).json(ticketMetadata);
  } catch (err) {
    console.error("Error fetching ticket metadata:", err);
    res.status(500).json({ error: "Failed to fetch ticket metadata" });
  }
};

// Get all ticket metadata for an event
exports.getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await TicketMetadata.find({ eventId });
    res.status(200).json(tickets);
  } catch (err) {
    console.error("Error fetching tickets for event:", err);
    res.status(500).json({ error: "Failed to fetch tickets for event" });
  }
};
