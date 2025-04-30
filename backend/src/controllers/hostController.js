const Host = require("../models/Host");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// --- Helper Function to Generate JWT --- (remains the same)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// @desc    Register a new Event Host
// @route   POST /api/hosts/register
// @access  Public
const registerHost = async (req, res, next) => {
  // Destructure walletAddress from req.body
  const {
    organizationName,
    orgEmail,
    mobileNumber,
    password,
    confirmPassword, // Receive confirm password
    orgLocation,
    walletAddress, // Get wallet address
  } = req.body;

  // --- Basic Backend Validations ---
  if (
    !organizationName ||
    !orgEmail ||
    !mobileNumber ||
    !password ||
    !confirmPassword ||
    !orgLocation ||
    !walletAddress
  ) {
    return res.status(400).json({
      message: "Please provide all required fields, including wallet address.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." });
  }

  // Validate email format
  if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(orgEmail)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Validate wallet address format (redundant with schema match, but good practice)
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ message: "Invalid wallet address format." });
  }
  // --- End Validations ---

  try {
    // Check if email OR wallet address already exists
    const hostExists = await Host.findOne({
      $or: [
        { orgEmail: orgEmail.toLowerCase() },
        { walletAddress: walletAddress }, // Case-sensitive check is fine for addresses
      ],
    });

    if (hostExists) {
      let message = "Registration failed.";
      if (hostExists.orgEmail === orgEmail.toLowerCase()) {
        message = "An organization with this email already exists.";
      } else if (hostExists.walletAddress === walletAddress) {
        message = "This wallet address is already registered.";
      }
      return res.status(400).json({ message });
    }

    // Create new host instance including walletAddress
    const newHost = new Host({
      organizationName,
      orgEmail: orgEmail.toLowerCase(), // Store email in lowercase
      mobileNumber,
      password, // Password will be hashed by the pre-save hook
      orgLocation,
      walletAddress, // Save the wallet address
    });

    const savedHost = await newHost.save();

    // Respond without sending the password back
    res.status(201).json({
      message: "Host registration successful. You can now log in.",
      host: {
        _id: savedHost._id,
        organizationName: savedHost.organizationName,
        orgEmail: savedHost.orgEmail,
        mobileNumber: savedHost.mobileNumber,
        orgLocation: savedHost.orgLocation,
        walletAddress: savedHost.walletAddress, // Include wallet address in response
        createdAt: savedHost.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      // Check for unique constraint errors (code 11000) which might not be caught by ValidationError directly after findOne check if race condition happens
      if (error.code === 11000) {
        if (error.message.includes("orgEmail")) {
          return res.status(400).json({
            message: "An organization with this email already exists.",
          });
        } else if (error.message.includes("walletAddress")) {
          return res
            .status(400)
            .json({ message: "This wallet address is already registered." });
        }
      }
      return res.status(400).json({ message: messages.join(" ") });
    }
    // Pass other errors to the central error handler
    next(error);
  }
};

// --- Login Host Function --- (remains the same)
const loginHost = async (req, res, next) => {
  // ... login logic ...
  const { email, password } = req.body;

  try {
    const host = await Host.findOne({ orgEmail: email.toLowerCase() });

    if (host && (await host.comparePassword(password))) {
      const token = generateToken(host._id);

      res.status(200).json({
        message: "Login successful",
        token: token,
        host: {
          _id: host._id,
          organizationName: host.organizationName,
          orgEmail: host.orgEmail,
          walletAddress: host.walletAddress, // Include wallet address on login too
        },
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};

module.exports = {
  registerHost,
  loginHost,
};
