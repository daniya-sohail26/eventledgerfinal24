const express = require("express");
const router = express.Router();
const Ticket = require("../models/TicketResale");

router.post("/", async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json({ message: "Ticket saved successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
