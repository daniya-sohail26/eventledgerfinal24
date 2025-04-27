// Host.js -- model

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config(); // For BCRYPT_SALT_ROUNDS

const hostSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    orgEmail: {
      type: String,
      required: [true, "Organization email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    orgLocation: {
      type: String,
      required: [true, "Organization location is required"],
      trim: true,
    },
    // REMOVED isApproved field
    // isApproved: {
    //   type: Boolean,
    //   default: false,
    // },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// --- Password Hashing Middleware ---
hostSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Method to compare passwords ---
hostSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Host = mongoose.model("Host", hostSchema);

module.exports = Host;
