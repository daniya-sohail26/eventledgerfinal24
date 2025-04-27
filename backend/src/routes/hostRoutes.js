const express = require("express");
const { registerHost, loginHost } = require("../controllers/hostController"); // Import loginHost
const {
  hostRegistrationValidationRules,
  hostLoginValidationRules, // Import login validation rules
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// POST /api/hosts/register
router.post(
  "/register",
  hostRegistrationValidationRules(),
  handleValidationErrors,
  registerHost
);

// --- NEW: Add Login Route ---
// POST /api/hosts/login
router.post(
  "/login",
  hostLoginValidationRules(), // Apply login validation rules
  handleValidationErrors, // Handle potential validation errors
  loginHost // Proceed to the login controller function
);

// --- Add other routes later ---
// router.get('/profile', protectRouteMiddleware, getHostProfile); // Example with auth middleware

module.exports = router;
