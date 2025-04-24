const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/room', authMiddleware, videoController.getRoomId);

module.exports = router;