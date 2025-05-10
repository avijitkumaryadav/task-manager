const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User'); // Assuming you have a User model

// @desc    Create a new chat session (Admin only)
// @route   POST /api/chat
// @access  Private (Admin)
const createChatSession = async (req, res) => {
  try {
    const { participantIds } = req.body; // Array of user IDs to include

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'Participant IDs are required' });
    }

    // Add the admin user to the participants if not already included
    if (!participantIds.includes(req.user._id.toString())) {
        participantIds.push(req.user._id);
    }


    // Check if a session with the same participants already exists
    // (This is a basic check, you might need more sophisticated logic for groups)
     const existingSession = await ChatSession.findOne({
        participants: { $all: participantIds, $size: participantIds.length }
      });

      if(existingSession) {
          return res.status(200).json({ message: 'Existing chat session found', session: existingSession });
      }


    const newSession = await ChatSession.create({
      participants: participantIds,
    });

    res.status(201).json({ message: 'Chat session created successfully', session: newSession });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get chat sessions for the logged-in user
// @route   GET /api/chat
// @access  Private
const getChatSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await ChatSession.find({ participants: userId })
      .populate('participants', 'name profileImageUrl'); // Populate participant details

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get messages for a chat session
// @route   GET /api/chat/:sessionId/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Verify if the user is a participant in the session
    const session = await ChatSession.findById(sessionId);
    if (!session || !session.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to access this chat session' });
    }

    const messages = await ChatMessage.find({ chatSession: sessionId })
      .populate('sender', 'name profileImageUrl') // Populate sender details
      .sort({ timestamp: 1 }); // Sort by timestamp

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a message to a chat session
// @route   POST /api/chat/:sessionId/messages
// @access  Private
const addMessageToChat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

     // Verify if the user is a participant in the session
     const session = await ChatSession.findById(sessionId);
     if (!session || !session.participants.includes(userId)) {
       return res.status(403).json({ message: 'Not authorized to post to this chat session' });
     }


    const message = await ChatMessage.create({
      chatSession: sessionId,
      sender: userId,
      text,
    });

    // You might want to emit a socket event here to notify other participants
    // We'll integrate this with Socket.io in the next step

    res.status(201).json({ message: 'Message added successfully', message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a shareable link for a chat session (Admin only)
// @route   GET /api/chat/:sessionId/link
// @access  Private (Admin)
const getChatSessionLink = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        // Verify if the user is the admin who created the session or a participant
        const session = await ChatSession.findById(sessionId);
        if (!session || (!session.participants.includes(userId) && req.user.role !== 'admin')) {
             return res.status(403).json({ message: 'Not authorized to get link for this chat session' });
        }


        // For simplicity, we'll just return the session ID in the link
        // In a real application, you might generate a unique token for security
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