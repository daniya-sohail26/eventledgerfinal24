// controllers/eventController.js
const Event = require("../models/buyerEvent"); // Ensure this path points to your Event model
const cloudinary = require("../config/cloudinaryConfig");
const { Readable } = require("stream");

// --- Upload to Cloudinary Helper Function ---
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "event_images" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          // Ensure result and its properties exist before accessing
          if (result && result.secure_url && result.public_id) {
            resolve({ url: result.secure_url, public_id: result.public_id });
          } else {
            console.error(
              "Cloudinary Upload Error: Invalid result object",
              result
            );
            reject(new Error("Cloudinary returned an invalid result object."));
          }
        }
      }
    );

    // Handle stream errors
    uploadStream.on("error", (streamError) => {
      console.error("Cloudinary Upload Stream Error:", streamError);
      reject(streamError);
    });

    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// --- Create Event Controller Function ---
const createEvent = async (req, res, next) => {
  console.log("createEvent: Controller starting execution.");
  console.log(
    "createEvent: Value of req.authenticatedHost at START:",
    req.authenticatedHost // Make sure your auth middleware sets this correctly
  );
  console.log(
    "createEvent: Value of req.body RECEIVED:",
    JSON.stringify(req.body, null, 2)
  );
  console.log(
    "createEvent: Value of req.files RECEIVED:",
    req.files ? req.files.length : 0
  );

  try {
    // --- 1. Check Host Authentication ---
    if (!req.authenticatedHost || !req.authenticatedHost._id) {
      console.error(
        "createEvent Error: req.authenticatedHost is missing or invalid:",
        req.authenticatedHost
      );
      // Send 401 Unauthorized
      return res
        .status(401)
        .json({ message: "Not authorized, host information missing" });
    }
    const hostId = req.authenticatedHost._id;
    console.log(`createEvent: Host ID confirmed: ${hostId}.`);

    // --- 2. Destructure ALL expected fields from req.body ---
    // These names MUST match the 'name' attributes in your FormData keys
    const {
      eventTitle,
      eventCategory, // Received from frontend form
      eventType,
      startDate, // Received as string 'YYYY-MM-DD'
      endDate, // Received as string 'YYYY-MM-DD' <--- ADDED
      startTime, // Received as string 'HH:MM'
      endTime, // Received as string 'HH:MM'
      location,
      eventDescription, // Received from frontend form
      ticketPrice, // Received as string (ETH value)
      ticketSupply, // Received as string <--- ADDED
    } = req.body;

    // --- 3. Perform Backend Validation ---
    console.log("createEvent: Performing backend validation...");
    const errors = [];

    // Required field checks
    if (!eventTitle) errors.push("Event title is required");
    if (!eventCategory) errors.push("Event category is required");
    if (!eventType) errors.push("Event type is required");
    if (!startDate) errors.push("Start date is required");
    if (!endDate) errors.push("End date is required"); // <--- ADDED check
    if (!startTime) errors.push("Start time is required");
    if (!endTime) errors.push("End time is required");
    if (
      ticketPrice === undefined ||
      ticketPrice === null ||
      ticketPrice === ""
    ) {
      errors.push("Ticket price (ETH) is required");
    }
    if (
      ticketSupply === undefined ||
      ticketSupply === null ||
      ticketSupply === ""
    ) {
      errors.push("Ticket supply is required"); // <--- ADDED check
    }

    // Conditional location check
    if (
      eventType &&
      (eventType === "onsite" || eventType === "hybrid") &&
      !location
    ) {
      errors.push("Location is required for onsite or hybrid events");
    }

    // Format/Value Validations (only if fields exist)
    let parsedTicketPrice;
    if (
      ticketPrice !== undefined &&
      ticketPrice !== null &&
      ticketPrice !== ""
    ) {
      parsedTicketPrice = parseFloat(ticketPrice);
      if (isNaN(parsedTicketPrice) || parsedTicketPrice < 0) {
        errors.push(
          "Invalid ticket price format or value (must be 0 or greater)"
        );
      }
    }

    let parsedTicketSupply;
    if (
      ticketSupply !== undefined &&
      ticketSupply !== null &&
      ticketSupply !== ""
    ) {
      parsedTicketSupply = parseInt(ticketSupply, 10); // Use parseInt for whole numbers
      if (isNaN(parsedTicketSupply) || parsedTicketSupply < 1) {
        errors.push(
          "Invalid ticket supply format or value (must be at least 1)"
        ); // <--- ADDED validation
      }
    }

    // Date comparison validation
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push("Invalid start or end date format.");
      } else if (end < start) {
        errors.push("End date must be on or after start date"); // <--- ADDED validation
      }
    }

    // Time format validation (optional, as schema handles it too)
    if (startTime && !/^\d{2}:\d{2}$/.test(startTime))
      errors.push("Invalid start time format (HH:MM)");
    if (endTime && !/^\d{2}:\d{2}$/.test(endTime))
      errors.push("Invalid end time format (HH:MM)");

    // If validation errors exist, return 400 Bad Request
    if (errors.length > 0) {
      console.error("createEvent Backend Validation Errors:", errors);
      return res.status(400).json({ message: errors.join(". ") });
    }
    console.log("createEvent: Backend validation passed.");

    // --- 4. Handle Image Uploads ---
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      console.log(
        `createEvent: Uploading ${req.files.length} image(s) to Cloudinary...`
      );
      try {
        // Use Promise.allSettled if you want to try uploading all even if some fail
        uploadedImages = await Promise.all(
          req.files.map((file) => uploadToCloudinary(file.buffer))
        );
        console.log(
          "createEvent: Cloudinary upload successful:",
          uploadedImages
        );
      } catch (uploadError) {
        // This catch block might be less likely to be hit if uploadToCloudinary rejects properly
        console.error(
          "createEvent Error: Cloudinary upload failed (Promise.all catch).",
          uploadError
        );
        // It's often better to let the specific upload error bubble up if needed,
        // but returning a generic message is also common.
        return res.status(500).json({
          message: "Failed to upload one or more images",
          error: uploadError.message || "Unknown upload error",
        });
      }
    } else {
      console.log("createEvent: No images provided for upload.");
      // Decide if images are required. If so, add validation above.
      // errors.push("At least one image is required");
    }

    // --- 5. Create New Event Document ---
    // Use the CORRECT field names from your eventSchema
    console.log("createEvent: Creating new Event document...");
    const newEvent = new Event({
      hostId: hostId, // CORRECT schema field name
      eventTitle,
      category: eventCategory, // CORRECT schema field name
      description: eventDescription, // CORRECT schema field name
      eventType,
      location: location || null, // Handle potentially empty string
      startDate: new Date(startDate), // Convert string to Date object
      endDate: new Date(endDate), // Convert string to Date object <--- ADDED
      startTime, // Keep as string HH:MM
      endTime, // Keep as string HH:MM
      ticketPriceETH: parsedTicketPrice, // CORRECT schema field name
      ticketSupply: parsedTicketSupply, // CORRECT schema field name <--- ADDED
      images: uploadedImages,
      // ticketsSold defaults to 0 in schema
      // isResellEnabled defaults to true in schema
      // registrationOpen defaults to true in schema
    });

    // --- 6. Save Event to Database ---
    console.log("createEvent: Attempting to save event to DB...", newEvent);
    // Mongoose validation runs automatically on save() AGAIN
    const savedEvent = await newEvent.save(); // This is where the Mongoose error was happening
    console.log("createEvent: Event saved successfully! ID:", savedEvent._id);

    // --- 7. Send Success Response ---
    res.status(201).json({
      message: "Event created successfully!",
      event: savedEvent, // Send back the saved event data
    });
  } catch (error) {
    // --- Catch unexpected errors (including Mongoose validation) ---
    console.error(
      "createEvent Error (Outer Catch Block): An unexpected error occurred:",
      error // Log the full error for debugging
    );

    // Handle Mongoose Validation Errors specifically
    if (error.name === "ValidationError") {
      // Extract messages from Mongoose error more robustly
      const messages = Object.values(error.errors || {}).map(
        (val) => val.message
      );
      console.error("Mongoose Validation Failed:", messages);
      return res.status(400).json({
        message: "Validation failed. Please check your input.",
        errors: messages, // Optionally send specific field errors
      });
    }

    // Handle potential Cloudinary errors if not caught earlier or other issues
    if (error.message && error.message.includes("Cloudinary")) {
      return res
        .status(500)
        .json({ message: "Image upload failed.", error: error.message });
    }

    // Pass other types of errors to the main error handler (if you have one)
    // or send a generic 500 Internal Server Error
    // next(error); // Use this if you have a dedicated error handling middleware
    return res.status(500).json({
      message: "An unexpected error occurred on the server.",
      error: error.message, // Provide error message in development/staging
    });
  }
};
// Debug to ensure Event is a Mongoose model
console.log('Event model:', Event);

const getEventsByHost = async (req, res, next) => {
  try {
    const hostId = req.params.hostId;
    console.log('Host ID:', hostId); // Debug hostId
    const events = await Event.find({ hostId }).sort({ date: -1 });
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No events found for this host' });
    }
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    next(error);
  }
};


module.exports = { createEvent,getEventsByHost };
