const sessionController = require('./sessionController');

const createSession = (req, res) => {
  const { title } = req.body;
  const newSession = sessionController.createSession(title, 'video', 'video');
  res.status(201).json(newSession);
};

const getSessions = (req, res) => {
    const videoSessions = sessionController.getSessionsByType('video');
  res.json(videoSessions);
};

module.exports = {
  createSession,
  getSessions,
};