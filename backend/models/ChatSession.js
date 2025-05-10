const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // You could add other fields here, like a name for group chats
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);