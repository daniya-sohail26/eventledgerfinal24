const express = require("express");
const { registerBuyer, loginBuyer } = require("../controllers/buyerController");
const router = express.Router();

// POST /api/buyers/register
router.post("/register", registerBuyer);

// POST /api/buyers/login
router.post("/login", loginBuyer);

module.exports = router;