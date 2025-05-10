// routes/eventRoutes.js
const express = require("express");
const { createEvent } = require("../controllers/eventController");
const { protectRoute } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protectRoute,
  upload.array("images", 10),

  // --- Logging Middleware AFTER Multer (Update to check req.authenticatedHost) ---
  (req, res, next) => {
    console.log("--- Logging Middleware (After Multer) ---");
    // *** Check the NEW property name ***
    console.log("Value of req.authenticatedHost:", req.authenticatedHost);
    console.log("--- End Logging Middleware ---");
    next();
  },
  // -------------------------------------------

  createEvent
);
const { getEventsByHost } = require("../controllers/eventController");

router.get('/:hostId', getEventsByHost);

module.exports = router;
