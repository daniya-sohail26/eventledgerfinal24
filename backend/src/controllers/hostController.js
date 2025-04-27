// hostController.js

const Host = require("../models/Host");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure JWT_SECRET is loaded

// --- Helper Function to Generate JWT ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h", // Use expiry from .env or default
  });
};

// @desc    Register a new Event Host
// @route   POST /api/hosts/register
// @access  Public
const registerHost = async (req, res, next) => {
  const { organizationName, orgEmail, mobileNumber, password, orgLocation } =
    req.body;

  try {
    const hostExists = await Host.findOne({ orgEmail });

    if (hostExists) {
      return res
        .status(400)
        .json({ message: "An organization with this email already exists" });
    }

    const newHost = new Host({
      organizationName,
      orgEmail,
      mobileNumber,
      password,
      orgLocation,
      // isApproved is no longer explicitly set here, will use model default (or be absent if removed from model)
    });

    const savedHost = await newHost.save();

    res.status(201).json({
      // Updated message slightly
      message: "Host registration successful. You can now log in.",
      host: {
        _id: savedHost._id,
        organizationName: savedHost.organizationName,
        orgEmail: savedHost.orgEmail,
        mobileNumber: savedHost.mobileNumber,
        orgLocation: savedHost.orgLocation,
        // Removed isApproved from response
        createdAt: savedHost.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    next(error);
  }
};

// --- Login Host Function ---
// @desc    Authenticate Event Host & Get Token
// @route   POST /api/hosts/login
// @access  Public
const loginHost = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const host = await Host.findOne({ orgEmail: email.toLowerCase() });

    // Check if host exists AND if password matches
    if (host && (await host.comparePassword(password))) {
      // !!!!! REMOVED THE isApproved CHECK !!!!!
      // if (!host.isApproved) { // <-- This block is deleted
      //   return res.status(403).json({
      //     message:
      //       "Account not approved. Please wait for administrator approval.",
      //   });
      // } // <-- End of deleted block

      // Generate JWT
      const token = generateToken(host._id);

      // Send response with token and user info
      res.status(200).json({
        message: "Login successful",
        token: token,
        host: {
          _id: host._id,
          organizationName: host.organizationName,
          orgEmail: host.orgEmail,
        },
      });
    } else {
      // Generic error message for security
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    next(error); // Pass error to the central error handler
  }
};

module.exports = {
  registerHost,
  loginHost,
};
