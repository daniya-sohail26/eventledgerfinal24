const bcrypt = require("bcrypt");
require("dotenv").config();

// Middleware to hash password before saving
const hashPasswordMiddleware = async function (next) {
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
};

// Method to compare passwords
const comparePasswordMethod = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Function to apply password middleware and methods to a schema
const applyPasswordMiddleware = (schema) => {
  // Apply the pre-save middleware for hashing
  schema.pre("save", hashPasswordMiddleware);

  // Add the comparePassword method to the schema
  schema.methods.comparePassword = comparePasswordMethod;
};

module.exports = { applyPasswordMiddleware };