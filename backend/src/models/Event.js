// models/Event.js
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  // We only store price here as per the frontend state.
  // If you had 'name' on the frontend ticket object, add it here too.
  price: {
    type: Number,
    required: [true, "Ticket price is required"],
    min: [0, "Price cannot be negative"],
  },
  // You might want to add ticket type name, quantity, etc. later
  // name: { type: String, required: true },
  // quantity: { type: Number, required: true },
});

const eventSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Host", // Reference to the Host model
    },
    eventTitle: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    eventCategory: {
      type: String,
      required: [true, "Event category is required"],
      enum: [
        // Restrict to valid categories from frontend
        "music",
        "sports",
        "theater",
        "festivals",
        "conferences",
        "family",
        "food",
        "art",
        "nightlife",
        "charity",
        "hobbies",
      ],
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: ["onsite", "virtual", "hybrid"], // Match frontend options
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    startTime: {
      type: String, // Store as string HH:MM
      required: [true, "Start time is required"],
      match: [/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type: String, // Store as string HH:MM
      required: [true, "End time is required"],
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
    },
    location: {
      // Optional if event is purely virtual? Add validation if needed.
      type: String,
      trim: true,
      // Consider making this required based on eventType if needed
      required: function () {
        return this.eventType === "onsite" || this.eventType === "hybrid";
      },
    },
    eventDescription: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true }, // URL from Cloudinary
        public_id: { type: String, required: true }, // Public ID from Cloudinary (for deletion/updates)
      },
    ],
    // The frontend sends tickets: [{ name: "", price: "" }]
    // We'll simplify and just store the price based on the frontend code provided.
    // If you need different ticket types, adjust the schema and frontend accordingly.
    ticketPrice: {
      // Renamed from 'tickets' for clarity since it's just one price level in the FE code
      type: Number,
      required: [true, "Ticket price is required"],
      min: [0, "Price cannot be negative"],
    },
    // If you later implement multiple ticket types:
    // tickets: [ticketSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// --- Optional Indexing for better query performance ---
eventSchema.index({ host: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ eventCategory: 1 });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
