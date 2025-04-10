const Session = require("../models/CallSession");
const { v4: uuidv4 } = require("uuid");

// Create a new call or chat session
exports.createSession = async (req, res) => {
  const { sessionType, participants } = req.body;
  const roomId = `room-${uuidv4()}`;  // Unique room ID using UUID
  
  // Ensure the creator is part of the participants
  const allParticipants = [req.user._id, ...participants];

  try {
    const session = new Session({
      sessionType,
      participants: allParticipants,
      createdBy: req.user._id,
      roomId,
      isActive: true,  // Mark session as active
    });

    await session.save();

    // Emit event to notify participants
    const io = req.app.get("io");
    io.emit("call-session-created", {
      room: roomId,
      participants: allParticipants,
    });

    res.status(201).json({ message: "Session created", session });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
};