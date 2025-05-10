const express = require("express");
const { getEvents } = require("../controllers/buyerEventController");
const {
  buyereventQueryValidationRules,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// GET /api/events - Fetch all events with filters
router.get("/", buyereventQueryValidationRules(), handleValidationErrors, getEvents);

// GET /api/events/:id - Fetch event by ID
router.get("/:id", async (req, res, next) => {
  try {
    const event = await require("../models/buyerEvent").findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;