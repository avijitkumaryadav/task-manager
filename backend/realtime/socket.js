const chatHandler = require("./chatHandler");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Listen for users joining specific rooms (call sessions)
    socket.on("join-room", (roomId) => {
      socket.join(roomId);  // Users join a room based on the roomId
      console.log(`User joined room: ${roomId}`);

      // Emit to others in the room that this user has joined
      socket.to(roomId).emit("user-joined", { user: socket.id });
    });

    // Initialize the chatHandler to handle chat-related socket events
    chatHandler(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      // Emit to all rooms that the user has left
      socket.rooms.forEach((roomId) => {
        socket.to(roomId).emit("user-left", { user: socket.id });
      });
    });
  });
};