const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const hostRoutes = require("./src/routes/hostRoutes");
const { errorHandler, notFound } = require("./src/middleware/errorMiddleware"); // Import error handlers

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// --- Middleware ---
// Enable CORS for all origins (adjust for production)
app.use(cors());

// Body parser middleware to accept JSON data
app.use(express.json());
// If you need to handle URL-encoded data (form submissions not using JSON)
// app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.get("/", (req, res) => {
  res.send("API is running..."); // Simple check route
});

// Mount host routes
app.use("/api/hosts", hostRoutes); // All host routes will be prefixed with /api/hosts

// --- Error Handling Middleware ---
// Use notFound middleware for 404 errors (should be after all other routes)
app.use(notFound);

// Use the central error handler (should be the last piece of middleware)
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
