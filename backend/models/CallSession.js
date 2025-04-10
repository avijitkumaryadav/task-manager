const mongoose = require("mongoose");

const CallSessionSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },  // Unique room ID
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin or creator
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Users in the session
    sessionType: { type: String, enum: ['video', 'chat'], required: true },  // Type of session (video or chat)
    isActive: { type: Boolean, default: true },  // Track if session is active
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const CallSession = mongoose.model("CallSession", CallSessionSchema);

module.exports = CallSession;