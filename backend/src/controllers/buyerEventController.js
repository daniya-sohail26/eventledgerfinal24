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

module.exports = { getEvents };