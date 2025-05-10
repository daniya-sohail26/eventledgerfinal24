const Buyer = require("../models/buyer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register a new buyer
const registerBuyer = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(400).json({ message: "Buyer with this email already exists" });
    }

    // Create new buyer
    const buyer = new Buyer({
      fullName,
      email,
      password, // Password will be hashed by the schema middleware
    });

    await buyer.save();

    // Log the newly created buyer
    console.log("New Buyer Added to Database:", {
      id: buyer._id,
      fullName: buyer.fullName,
      email: buyer.email,
      createdAt: buyer.createdAt,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: buyer._id, email: buyer.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Buyer registered successfully", token });
  } catch (error) {
    // Log any errors during registration
    console.error("Error Adding Buyer to Database:", error.message);
    next(error);
  }
};

// Login a buyer
const loginBuyer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if buyer exists
    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await buyer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: buyer._id, email: buyer.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Buyer logged in successfully", token });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerBuyer, loginBuyer };