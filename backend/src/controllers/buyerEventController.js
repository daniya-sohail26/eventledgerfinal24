const Event = require("../models/buyerEvent");

// Mapping for eventCategory to category values
const categoryMapping = {
  conferences: "Conferences & Workshops",
  theater: "Theater & Performing Arts",
  festivals: "Festivals & Fairs",
  sports: "Sports",
  family: "Family & Kids",
  food: "Food & Drink",
  art: "Art & Culture",
  nightlife: "Nightlife & Parties",
  charity: "Charity & Community",
  hobbies: "Hobbies & Special Interests",
  technology: "Technology",
  music: "Music & Concerts",
};

const getEvents = async (req, res, next) => {
  try {
    const { category, eventType, search } = req.query;
    const query = {};

    // Handle category filter
    if (category && category !== "All") {
      // Map the frontend category to possible eventCategory values
      const eventCategoryValue = Object.keys(categoryMapping).find(
        (key) => categoryMapping[key] === category
      );

      if (eventCategoryValue) {
        // Search both category and eventCategory fields
        query.$or = [
          { category },
          { eventCategory: eventCategoryValue },
        ];
      } else {
        query.category = category;
      }
    }

    // Handle eventType filter
    if (eventType && eventType !== "All") {
      query.eventType = eventType;
    }

    // Handle search filter
    if (search) {
      query.$or = query.$or || [];
      query.$or.push(
        { name: { $regex: search, $options: "i" } },
        { eventTitle: { $regex: search, $options: "i" } }
      );
    }

    const events = await Event.find(query);
    console.log("Fetched events:", events);
    res.status(200).json({
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    next(error);
  }
};

exports.incrementTicketsSold = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { increment } = req.body;

    if (!increment || !Number.isInteger(increment) || increment <= 0) {
      return res.status(400).json({ error: "Invalid increment value. Must be a positive integer." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.ticketsSold + increment > event.ticketSupply) {
      return res.status(400).json({ error: `Cannot sell ${increment} more tickets. Only ${event.ticketSupply - event.ticketsSold} tickets available.` });
    }

    event.ticketsSold += increment;
    await event.save();

    console.log(`Updated ticketsSold for event ${eventId}: ${event.ticketsSold}`);
    res.status(200).json({ event });
  } catch (error) {
    console.error(`Error incrementing ticketsSold for event ${req.params.eventId}:`, error);
    next(error);
  }
};

// Increase ticketSupply (e.g., for resell)
exports.increaseTicketSupply = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    console.log(eventId)
    const { increment } = req.body;

    if (!increment || !Number.isInteger(increment) || increment <= 0) {
      return res.status(400).json({ error: "Invalid increment value. Must be a positive integer." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.ticketSupply += increment;
    await event.save();

    console.log(`Updated ticketSupply for event ${eventId}: ${event.ticketSupply}`);
    res.status(200).json({ event });
  } catch (error) {
    console.error(`Error increasing ticketSupply for event ${req.params.eventId}:`, error);
    next(error);
  }
};

exports.deleteEvent = async (req, res) => {
  try {
      const { eventId } = req.params;
      const { walletAddress } = req.body;

      // Find the event
      const event = await Event.findOne({ eventId });
      if (!event) {
          return res.status(404).json({ error: 'Event not found' });
      }

      // Check if user is authorized to delete (event creator or admin)
      if (event.createdBy !== walletAddress && walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
          return res.status(403).json({ error: 'Unauthorized: Only the event creator or admin can delete this event' });
      }

      // Check if event has started
      const currentTime = new Date();
      if (new Date(event.startDate) <= currentTime) {
          return res.status(400).json({ error: 'Cannot delete an event that has started or passed' });
      }

      // Check if there are active tickets
      const activeTickets = await Ticket.find({ 
          eventId, 
          isResold: false, 
          isUsed: false 
      });
      if (activeTickets.length > 0) {
          return res.status(400).json({ error: 'Cannot delete event with active tickets' });
      }

      // Delete the event
      await Event.deleteOne({ eventId });

      // Delete any remaining tickets (should be none due to previous check)
      await Ticket.deleteMany({ eventId });

      res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
  }
};

module.exports = { getEvents };