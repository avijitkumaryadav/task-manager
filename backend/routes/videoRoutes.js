const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');


router.post('/sessions', videoController.createSession);
router.get('/sessions', videoController.getSessions);

module.exports = router;