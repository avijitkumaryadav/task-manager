// backend/controllers/chatController.js
const ChatMessage = require('../models/ChatMessage'); // You'll need to create this model

exports.saveMessage = async (req, res) => {
  try {
    const { roomId, text, sender } = req.body;
    
    const message = new ChatMessage({
      roomId,
      text,
      sender: req.user._id, // From auth middleware
      timestamp: new Date()
    });
    
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId 
    }).populate('sender', 'name email', 'name profileImageUrl');
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};