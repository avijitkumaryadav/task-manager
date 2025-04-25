const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const members = req.body.members || [];

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newChat = new ChatMessage({
      title: title,
      members: members,
      messages: [],
      createdAt: new Date(),
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res
      .status(500)
      .json({ message: 'Error creating chat', error: error.message });
  }
};

const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await ChatMessage.findByIdAndDelete(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res
      .status(500)
      .json({ message: 'Error deleting chat', error: error.message });
  }
};

const getChat = async (req, res) => {
  const { roomId } = req.params;
  try {
    const chatRoom = await ChatMessage.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    res.json(chatRoom);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
};

const getChatHistory = async (req, res) => {
  const { roomId } = req.params;
  try {
    const chatRoom = await ChatMessage.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    res.json(chatRoom.messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

const getChatList = async (req, res) => {
  try {
    const chatList = await ChatMessage.find({}).populate(
      'members',
      'name email'
    );
    res.json(chatList);
  } catch (error) {
    console.error('Error fetching chat list:', error);
    res.status(500).json({ message: 'Error fetching chat list' });
  }
};

const getAllMessagesFromChat = async (req, res) => {
  // This function is declared but not implemented
};

const listChats = async (req, res) => {
  try {
    const chatSessions = await ChatMessage.find({});
    res.json(chatSessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const saveMessage = async (req, res) => {
  const { roomId } = req.params;
  const { author, content } = req.body;
  const newMessage = { author, content, timestamp: new Date() };

  try {
    const chatRoom = await ChatMessage.findByIdAndUpdate(
      roomId,
      { $push: { messages: newMessage } },
      { new: true }
    );

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Error saving message' });
  }
};

module.exports = {
  createChat,
  getChat,
  getChatList,
  getChatHistory,
  saveMessage,
  listChats,
  deleteChat,
  getAllMessagesFromChat,
};
