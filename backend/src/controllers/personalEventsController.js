const Ticket = require("../models/TicketResale");
const Event = require("../models/buyerEvent");

const getPersonalEvents = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    // Fetch tickets for the user
    const tickets = await Ticket.find({ ownerId: walletAddress });
    if (!tickets.length) {
      return res.status(200).json({ tickets: [], events: {} });
    }

    // Fetch event details for each ticket
    const eventIds = [...new Set(tickets.map((t) => t.eventId))];
    const events = await Event.find({ _id: { $in: eventIds } });
    const eventMap = events.reduce((acc, event) => {
      acc[event._id] = event;
      return acc;
    }, {});

    res.status(200).json({
      message: "Personal events fetched successfully",
      tickets,
      events: eventMap,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPersonalEvents };