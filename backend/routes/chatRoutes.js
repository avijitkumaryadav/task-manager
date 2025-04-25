const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to save a new message in a chat room

router.get('/list', authMiddleware.protect, chatController.getChatList); 

router.post('/create', authMiddleware.protect, chatController.createChat);
router.delete('/:chatId', authMiddleware.protect, chatController.deleteChat);


module.exports = router;