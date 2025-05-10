const ChatMessage = require("./models/ChatMessage"); // Import ChatMessage model
const ChatSession = require("./models/ChatSession"); // Import ChatSession model

let activeUsers = []; // To keep track of active users and their socket IDs

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining and joining chat session rooms
    socket.on("join", async (userId) => {
      const existingUser = activeUsers.find((user) => user.userId === userId);

      if (!existingUser) {
        activeUsers.push({ userId, socketId: socket.id });
        console.log(`User ${userId} joined, active users:`, activeUsers);
        io.emit("activeUsers", activeUsers); // Emit updated active users list
      } else {
        // Update socketId if user already exists (e.g., new tab/window)
        existingUser.socketId = socket.id;
        console.log(`User ${userId} re-joined, active users:`, activeUsers);
        io.emit("activeUsers", activeUsers);
      }

      // Join the user to rooms for their chat sessions
      try {
        const userSessions = await ChatSession.find({ participants: userId });
        userSessions.forEach((session) => {
          socket.join(session._id.toString());
          console.log(`User ${userId} joined room ${session._id}`);
        });
      } catch (error) {
        console.error("Error joining user to sessions:", error);
      }
    });

    // Handle sending a message
    socket.on("sendMessage", async (messageData) => {
      console.log("messageData:", messageData);

      try {
        const newMessage = await ChatMessage.create({
          chatSession: messageData.chatSessionId,
          sender: messageData.sender.id,
          text: messageData.text,
        });

        io.to(messageData.chatSessionId).emit("receiveMessage", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle disconnecting
    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log("User disconnected, active users:", activeUsers);
      io.emit("activeUsers", activeUsers);
    });
  });
};

module.exports = socketHandler;
