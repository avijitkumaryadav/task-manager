const ChatMessage = require("./models/ChatMessage");
const ChatSession = require("./models/ChatSession");

let activeUsers = [];

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on("join", async (userId) => {
      const existingUser = activeUsers.find((user) => user.userId === userId);

      if (!existingUser) {
        activeUsers.push({ userId, socketId: socket.id });
      } else {
        existingUser.socketId = socket.id;
      }

      io.emit("activeUsers", activeUsers);

      try {
        const userSessions = await ChatSession.find({ participants: userId });
        userSessions.forEach((session) => {
          socket.join(session._id.toString());
        });
      } catch (error) {
        console.error("Error joining user to sessions:", error);
      }
    });

    // Handle joining a specific chat session
    socket.on("joinSession", (sessionId) => {
      socket.join(sessionId);
    });

    // Handle sending a message
    socket.on("sendMessage", async (messageData) => {
      try {
        const newMessage = await ChatMessage.create({
          chatSession: messageData.chatSessionId,
          sender: messageData.sender.id,
          text: messageData.text,
        });

        // Populate sender details before emitting
        const populatedMessage = await ChatMessage.findById(newMessage._id)
          .populate('sender', 'name profileImageUrl');

        io.to(messageData.chatSessionId).emit("receiveMessage", {
          ...populatedMessage.toObject(),
          chatSession: messageData.chatSessionId
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle disconnecting
    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      io.emit("activeUsers", activeUsers);
    });
  });
};

module.exports = socketHandler;