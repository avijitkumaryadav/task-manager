// backend/routes/callRoutes.js

const express = require("express");
const router = express.Router();
const CallSession = require("../models/CallSession");

// ✅ Middleware
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// @route   POST /api/calls/create
// @desc    Create a new call session (Admin only)
// @access  Private (Admin)
router.post("/create", protect, adminOnly, async (req, res) => {
  try {
    const { participants } = req.body;
    const roomId = `room-${Date.now()}`;

    const session = await CallSession.create({
      roomId,
      createdBy: req.user._id,
      participants,
    });

    // ✅ Emit to invited users (Socket.IO)
    const io = req.app.get("io");
    if (io && Array.isArray(participants)) {
      io.to("global").emit("call-session-created", {
        room: session.roomId,
        participants,
      });
    }

    res.status(201).json({ roomId: session.roomId, participants });
  } catch (err) {
    console.error("Failed to create call session:", err);
    res.status(500).json({ message: "Failed to create call session" });
  }
});

// @route   GET /api/calls/my-sessions
// @desc    Get active call sessions for the logged-in user
// @access  Private
router.get("/my-sessions", protect, async (req, res) => {
  try {
    const sessions = await CallSession.find({
      participants: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (sessions.length === 0) {
      return res.status(204).send(); // No content
    }

    res.json(sessions);
  } catch (err) {
    console.error("Failed to fetch sessions:", err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

module.exports = router;