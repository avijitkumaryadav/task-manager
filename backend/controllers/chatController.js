const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const createChatSession = async (req, res) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ message: 'Participant IDs are required' });
    }

    // Add current user if not included
    if (!participantIds.includes(req.user._id.toString())) {
      participantIds.push(req.user._id);
    }

    // Check for existing session
    const existingSession = await ChatSession.findOne({
      participants: { $all: participantIds, $size: participantIds.length }
    }).populate('participants', 'name profileImageUrl');

    if (existingSession) {
      return res.status(200).json({ 
        message: 'Existing chat session found', 
        session: existingSession 
      });
    }

    const newSession = await ChatSession.create({ participants: participantIds });
    const populatedSession = await ChatSession.findById(newSession._id)
      .populate('participants', 'name profileImageUrl');

    res.status(201).json({ 
      message: 'Chat session created successfully', 
      session: populatedSession 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ participants: req.user._id })
      .populate('participants', 'name profileImageUrl');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findById(sessionId);
    if (!session || !session.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await ChatMessage.find({ chatSession: sessionId })
      .populate('sender', 'name profileImageUrl')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMessageToChat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;

    const session = await ChatSession.findById(sessionId);
    if (!session || !session.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await ChatMessage.create({
      chatSession: sessionId,
      sender: req.user._id,
      text,
    });

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('sender', 'name profileImageUrl');

    res.status(201).json({ message: 'Message added', message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getChatSessionLink = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);

    if (!session || !session.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const chatLink = `${process.env.CLIENT_URL}/chat?sessionId=${sessionId}`;
    res.json({ link: chatLink });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createChatSession,
  getChatSessions,
  getChatMessages,
  addMessageToChat,
  getChatSessionLink,
};