// controllers/eventController.js
const Event = require("../models/Event");
const cloudinary = require("../config/cloudinaryConfig");
const { Readable } = require("stream");

// ... uploadToCloudinary helper (remains the same) ...
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "event_images" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      }
    );
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

const createEvent = async (req, res, next) => {
  console.log("createEvent: Controller starting execution.");
  console.log(
    "createEvent: Value of req.authenticatedHost at START:",
    req.authenticatedHost
  );
  // --- Log the received req.body AFTER Multer processing ---
  console.log(
    "createEvent: Value of req.body RECEIVED:",
    JSON.stringify(req.body, null, 2)
  );

  try {
    // --- 1. Check Host Authentication ---
    if (!req.authenticatedHost || !req.authenticatedHost._id) {
      console.error(
        "createEvent Error: req.authenticatedHost is missing or invalid:",
        req.authenticatedHost,
        "- Sending 401."
      );
      return res
        .status(401)
        .json({ message: "Not authorized, host information missing" });
    }
    const hostId = req.authenticatedHost._id;
    console.log(`createEvent: Host ID confirmed: ${hostId}.`);

    // --- 2. Destructure ALL expected fields from req.body ---
    // Multer puts text fields from FormData into req.body
    const {
      eventTitle,
      eventCategory,
      eventType,
      startDate, // Received as string 'YYYY-MM-DD'
      startTime, // Received as string 'HH:MM'
      endTime, // Received as string 'HH:MM'
      location,
      eventDescription,
      ticketPrice, // Received as string
    } = req.body;

    // --- 3. Perform Backend Validation ---
    // (Even though frontend validates, backend validation is crucial)
    console.log("createEvent: Performing backend validation...");
    const errors = [];
    if (!eventTitle) errors.push("Event title is required");
    if (!eventCategory) errors.push("Event category is required");
    if (!eventType) errors.push("Event type is required");
    if (!startDate) errors.push("Start date is required");
    if (!startTime) errors.push("Start time is required");
    if (!endTime) errors.push("End time is required");
    if (
      ticketPrice === undefined ||
      ticketPrice === null ||
      ticketPrice === ""
    ) {
      errors.push("Ticket price is required");
    }
    // Check location based on type AFTER checking eventType exists
    if (
      eventType &&
      (eventType === "onsite" || eventType === "hybrid") &&
      !location
    ) {
      errors.push("Location is required for onsite or hybrid events");
    }
    // Validate ticket price format AFTER checking it exists
    let parsedTicketPrice;
    if (
      ticketPrice !== undefined &&
      ticketPrice !== null &&
      ticketPrice !== ""
    ) {
      parsedTicketPrice = parseFloat(ticketPrice);
      if (isNaN(parsedTicketPrice) || parsedTicketPrice < 0) {
        errors.push("Invalid ticket price format or value");
      }
    }
    // Validate time formats if needed (Mongoose schema does this too)
    // if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) errors.push("Invalid start time format (HH:MM)");
    // if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) errors.push("Invalid end time format (HH:MM)");

    if (errors.length > 0) {
      console.error("createEvent Backend Validation Error:", errors);
      // Return 400 Bad Request with specific validation errors
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
        uploadedImages = await Promise.all(
          req.files.map((file) => uploadToCloudinary(file.buffer))
        );
        console.log("createEvent: Cloudinary upload successful.");
      } catch (uploadError) {
        console.error(
          "createEvent Error: Cloudinary upload failed.",
          uploadError
        );
        return res.status(500).json({
          message: "Failed to upload one or more images",
          error: uploadError.message,
        });
      }
    } else {
      console.log("createEvent: No images provided for upload.");
    }

    // --- 5. Create New Event Document ---
    // Ensure data types match the schema (especially Date)
    console.log("createEvent: Creating new Event document...");
    const newEvent = new Event({
      host: hostId,
      eventTitle,
      eventCategory,
      eventType,
      startDate: new Date(startDate), // Convert string to Date object
      startTime, // Keep as string HH:MM
      endTime, // Keep as string HH:MM
      location: location || null, // Handle potential empty string
      eventDescription: eventDescription || "",
      images: uploadedImages,
      ticketPrice: parsedTicketPrice, // Use the validated, parsed number
    });

    // --- 6. Save Event to Database ---
    console.log("createEvent: Attempting to save event to DB...");
    // Mongoose validation runs automatically on save()
    const savedEvent = await newEvent.save();
    console.log("createEvent: Event saved successfully! ID:", savedEvent._id);

    // --- 7. Send Success Response ---
    res.status(201).json({
      message: "Event created successfully!",
      event: savedEvent,
    });
  } catch (error) {
    // --- Catch unexpected errors (including Mongoose validation) ---
    console.error(
      "createEvent Error (catch block): An unexpected error occurred:",
      error
    );
    // Handle Mongoose Validation Errors specifically
    if (error.name === "ValidationError") {
      // Extract messages from Mongoose error
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    // Pass other types of errors to the main error handler
    next(error);
  }
};

module.exports = { createEvent };
