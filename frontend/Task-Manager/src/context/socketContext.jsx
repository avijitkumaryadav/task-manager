const express = require("express");
const router = express.Router();
const { getActiveCallForUser } = require("../controllers/callController");
const { protect } = require("../middlewares/authMiddleware");

// Get active video call for the logged-in user
router.get("/active-call", protect, getActiveCallForUser);

module.exports = router;