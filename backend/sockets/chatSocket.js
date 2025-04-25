const ChatMessage = require('../models/ChatMessage');
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinSession', async ({ sessionId, userId }) => {
      try {
        // Find the chat session by sessionId
        const chatSession = await ChatMessage.findById(sessionId);

        // Check if the user is a member of the chat session
        if (chatSession && chatSession.members.includes(userId)) {
          socket.join(sessionId);
          console.log(`User ${userId} joined session ${sessionId}`);
        } else {
          console.log(`User ${userId} is not a member of session ${sessionId}`);
          socket.emit('joinSessionError', 'You are not a member of this session');
        }
      } catch (error) {
        console.error('Error joining session:', error);
      }
    });

    socket.on('sendMessage', async ({ sessionId, message, sender }) => {
       try {
         const newMessage = new ChatMessage({
           sessionId,
           content: message,
           sender,
           timestamp: new Date()
         });
      await newMessage.save();
      io.to(sessionId).emit('newMessage', { ...newMessage.toObject(), isCurrentUser: false });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};
