// middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// Configure storage - using memory storage is good for direct upload to cloud services
const storage = multer.memoryStorage();

// File filter to allow only image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true); // Accept file
  } else {
    cb(new Error("Error: Images Only! (jpeg, jpg, png, gif, webp)"), false); // Reject file
  }
};

// Configure multer upload options
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size (e.g., 5MB)
  fileFilter: fileFilter,
});

module.exports = upload;
