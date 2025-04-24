const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/message', authMiddleware, chatController.saveMessage);
router.get('/history/:roomId', authMiddleware, chatController.getChatHistory);

module.exports = router;