const express = require("express");
const { registerHost, loginHost } = require("../controllers/hostController");
const {
  hostRegistrationValidationRules,
  hostLoginValidationRules,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");
const Host = require("../models/Host"); // Import the Host model

const router = express.Router();

// POST /api/hosts/register
router.post(
  "/register",
  hostRegistrationValidationRules(),
  handleValidationErrors,
  registerHost
);

// POST /api/hosts/login
router.post(
  "/login",
  hostLoginValidationRules(),
  handleValidationErrors,
  loginHost
);

// GET /api/hosts/:hostId - Fetch a host by ID
router.get("/:hostId", async (req, res) => {
  try {
    const { hostId } = req.params;

    // Validate hostId format (MongoDB ObjectId is a 24-character hex string)
    if (!hostId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid host ID format" });
    }

    // Select organizationName and mobileNumber
    const host = await Host.findById(hostId).select(
      "organizationName mobileNumber"
    );
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Return the host data in the format expected by the frontend
    res.status(200).json({
      organizationName: host.organizationName,
      mobileNumber: host.mobileNumber,
    });
  } catch (error) {
    console.error("Error fetching host:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add other routes later
// router.get('/profile', protectRouteMiddleware, getHostProfile);

module.exports = router;

// const express = require("express");
// const { registerHost, loginHost } = require("../controllers/hostController");
// const {
//   hostRegistrationValidationRules,
//   hostLoginValidationRules,
//   handleValidationErrors,
// } = require("../middleware/validationMiddleware");
// const Host = require("../models/Host"); // Import the Host model

// const router = express.Router();

// // POST /api/hosts/register
// router.post(
//   "/register",
//   hostRegistrationValidationRules(),
//   handleValidationErrors,
//   registerHost
// );

// // POST /api/hosts/login
// router.post(
//   "/login",
//   hostLoginValidationRules(),
//   handleValidationErrors,
//   loginHost
// );

// // NEW: GET /api/hosts/:hostId - Fetch a host by ID
// router.get("/:hostId", async (req, res) => {
//   try {
//     const { hostId } = req.params;

//     // Validate hostId format (MongoDB ObjectId is a 24-character hex string)
//     if (!hostId.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid host ID format" });
//     }

//     const host = await Host.findById(hostId).select("name imageUrl"); // Only fetch name and imageUrl
//     if (!host) {
//       return res.status(404).json({ message: "Host not found" });
//     }

//     // Return the host data in the expected format
//     res.status(200).json({
//       user: {
//         name: host.name,
//         imageUrl: host.imageUrl,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Add other routes later
// // router.get('/profile', protectRouteMiddleware, getHostProfile);

// module.exports = router;
