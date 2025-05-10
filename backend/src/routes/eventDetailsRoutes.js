const express = require("express");
const { getEvents, getEventById } = require("../controllers/eventDetailsController");
const router = express.Router();

// Fetch all events with optional filters
router.get("/", getEvents);

// Fetch a single event by ID
router.get("/:eventId", getEventById);

// Existing route for fetching multiple events by IDs (from ticketRoutes.js)
router.post("/multiple", async (req, res) => {
  try {
    const { eventIds } = req.body;
    const events = await Event.find({ _id: { $in: eventIds } });
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;