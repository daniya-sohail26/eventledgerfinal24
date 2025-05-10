// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Host = require("../models/Host");
require("dotenv").config();

const protectRoute = async (req, res, next) => {
  let token;
  console.log(`ProtectRoute: Executing for ${req.method} ${req.originalUrl}`);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id) {
        console.error(
          "ProtectRoute Error: Decoded token invalid/missing ID. Payload:",
          decoded
        );
        return res
          .status(401)
          .json({ message: "Not authorized, invalid token payload" });
      }
      console.log(`ProtectRoute: Token valid, finding host with ID: ${decoded.id}`);

      let foundHost = null;
      try {
        foundHost = await Host.findById(decoded.id).select("-password");
        console.log(
          "ProtectRoute: Result DIRECTLY from Host.findById():",
          foundHost
        );
      } catch (dbError) {
        console.error(
          `ProtectRoute Error: DB error Host.findById ID ${decoded.id}:`,
          dbError
        );
        return next(dbError);
      }

      if (!foundHost) {
        console.warn(
          `ProtectRoute Warning: Host not found in DB for token ID: ${decoded.id}. Sending 401.`);
        return res
          .status(401)
          .json({ message: "Not authorized, host not found" });
      }

      // --- Assign to req.authenticatedHost INSTEAD of req.host ---
      req.authenticatedHost = foundHost;
      console.log(
        `ProtectRoute: Host object assigned to req.authenticatedHost. ID: ${req.authenticatedHost._id}. Calling next().`);
      next(); // Proceed
    } catch (error) {
      // JWT verification errors
      console.error(
        "ProtectRoute Error: Token verification failed.",
        error.name,
        error.message
      );
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Not authorized, token signature invalid" });
      }
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Not authorized, token expired" });
      }
      console.error(
        "ProtectRoute: Unexpected error during token processing:",
        error
      );
      return res
        .status(401)
        .json({ message: "Not authorized, token processing error" });
    }
  } else {
    console.log("ProtectRoute: No 'Authorization: Bearer' header found.");
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protectRoute };