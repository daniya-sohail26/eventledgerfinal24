// Basic error handler middleware
// Place this AFTER all your routes in server.js
const errorHandler = (err, req, res, next) => {
  console.error("Error Handler:", err.stack); // Log the stack trace for debugging

  // Default to 500 Internal Server Error if status code not already set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message, // Send the error message
    // Optionally include stack trace in development environment only
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};

// Middleware for handling routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the errorHandler
};

module.exports = { errorHandler, notFound };
