// --- IMPORT 'body' HERE ---
const { check, body, validationResult } = require("express-validator");

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return only the first error message for simplicity, or customize as needed
    // Consider joining messages for better feedback:
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({ message: messages.join(". ") });
    // Original: return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Validation rules for host registration (using check - this is fine)
const hostRegistrationValidationRules = () => {
  return [
    check("organizationName")
      .trim()
      .notEmpty()
      .withMessage("Organization name is required"),

    check("orgEmail")
      .trim()
      .notEmpty()
      .withMessage("Organization email is required")
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),

    check("mobileNumber")
      .trim()
      .notEmpty()
      .withMessage("Mobile number is required")
      // Optional: Keep or remove isMobilePhone based on how strict you need it
      .isMobilePhone("any", { strictMode: false })
      .withMessage("Must be a valid mobile number format"), // 'any' checks common formats

    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    check("confirmPassword")
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true; // Indicates the success of this synchronous custom validator
      }),

    check("orgLocation")
      .trim()
      .notEmpty()
      .withMessage("Organization location is required"),

    // No validation for businessDoc here as requested
  ];
};

// --- Validation rules for host login (using body) ---
const hostLoginValidationRules = () => {
  return [
    // Now `body` is defined because we imported it
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(), // Good practice to normalize email for comparison

    body("password").notEmpty().withMessage("Password is required"), // No need for length check here, just existence
  ];
};

module.exports = {
  handleValidationErrors,
  hostRegistrationValidationRules,
  hostLoginValidationRules,
};
