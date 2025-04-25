// backend/models/ChatMessage.js
const mongoose = require('mongoose');

// Define the schema for individual messages within a chat session
const messageSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Define the schema for a chat session
const chatMessageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  members: [{ type: String }], // Array of user IDs
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

// Create the ChatMessage model using the defined schema
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;