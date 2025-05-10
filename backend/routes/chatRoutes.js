const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  createChatSession,
  getChatSessions,
  getChatMessages,
  addMessageToChat,
  getChatSessionLink,
} = require('../controllers/chatController');

const router = express.Router();

// Chat Session Routes
router.post('/', protect, adminOnly, createChatSession); // Admin creates a session
router.get('/', protect, getChatSessions); // Get user's chat sessions
router.get('/:sessionId/messages', protect, getChatMessages); // Get messages for a session
router.post('/:sessionId/messages', protect, addMessageToChat); // Add message to a session
router.get('/:sessionId/link', protect, adminOnly, getChatSessionLink); // Get shareable link (Admin only)

module.exports = router;