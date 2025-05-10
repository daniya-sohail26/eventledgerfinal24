const Event = require("../models/buyerEvent");
const Host = require("../models/Host");

const getEvents = async (req, res, next) => {
  try {
    const { category, eventType, search } = req.query;
    const query = {};
    if (category && category !== "All") query.category = category;
    if (eventType && eventType !== "All") query.eventType = eventType;
    if (search) {
      query.eventTitle = { $regex: search, $options: "i" }; // Updated to eventTitle
    }
    const events = await Event.find(query);
    res.status(200).json({
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
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
};

module.exports = { getEvents, getEventById };