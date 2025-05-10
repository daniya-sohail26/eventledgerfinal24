const { check, body, query, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({ message: messages.join(". ") });
  }
  next();
};

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
      .isMobilePhone("any", { strictMode: false })
      .withMessage("Must be a valid mobile number format"),
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
        return true;
      }),
    check("orgLocation")
      .trim()
      .notEmpty()
      .withMessage("Organization location is required"),
  ];
};

const hostLoginValidationRules = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const buyereventQueryValidationRules = () => {
  return [
    query("category")
      .optional()
      .isIn([
        "All",
        "Music & Concerts",
        "Sports",
        "Theater & Performing Arts",
        "Festivals & Fairs",
        "Conferences & Workshops",
        "Family & Kids",
        "Food & Drink",
        "Art & Culture",
        "Nightlife & Parties",
        "Charity & Community",
        "Hobbies & Special Interests",
        "Technology",
      ])
      .withMessage("Invalid category"),
    query("eventType")
      .optional()
      .isIn(["All", "onsite", "virtual", "hybrid"]) // Changed to lowercase to match frontend and database
      .withMessage("Invalid event type"),
    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search query must be less than 100 characters"),
  ];
};

module.exports = {
  handleValidationErrors,
  hostRegistrationValidationRules,
  hostLoginValidationRules,
  buyereventQueryValidationRules,
};