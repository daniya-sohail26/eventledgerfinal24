const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db"); // Assuming db.js is in src/config

// --- Import Routes ---
const hostRoutes = require("./src/routes/hostRoutes");
const eventRoutes = require("./src/routes/eventRoutes"); // <-- ADDED: Import event routes

// --- Import Middleware ---
const { errorHandler, notFound } = require("./src/middleware/errorMiddleware"); // Import error handlers

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// --- Middleware ---
// Enable CORS for all origins (adjust for production with specific origins)
app.use(cors());

// Body parser middleware to accept JSON data
app.use(express.json());
// Middleware to handle URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true })); // <-- ADDED: Useful for form data

// --- API Routes ---
app.get("/", (req, res) => {
  res.send("API is running..."); // Simple check route
});

// Mount host routes
app.use("/api/hosts", hostRoutes); // All host routes will be prefixed with /api/hosts

// Mount event routes
app.use("/api/events", eventRoutes); // <-- ADDED: Mount event routes

// --- Error Handling Middleware ---
// Use notFound middleware for 404 errors (should be after all other routes)
app.use(notFound);

// Use the central error handler (should be the last piece of middleware)
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000; // Using 5000 as per your original file

app.listen(PORT, () => {
  console.log(
    // Added NODE_ENV for better context
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});
