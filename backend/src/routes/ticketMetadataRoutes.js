const express = require("express");
const router = express.Router();
const ticketMetadataController = require("../controllers/ticketMetadataController");

// Create ticket metadata
router.post("/", ticketMetadataController.createTicketMetadata);

// Get ticket metadata by ticketId
router.get("/:ticketId", ticketMetadataController.getTicketMetadata);

// Get all tickets for an event
router.get("/event/:eventId", ticketMetadataController.getTicketsByEvent);

module.exports = router;