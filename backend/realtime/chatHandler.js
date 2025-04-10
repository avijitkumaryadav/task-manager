const connectedUsers = new Map();

function chatHandler(io, socket) {
  // When a user joins a room
  socket.on("join-room", ({ room, user }) => {
    const userWithSocketId = { ...user, socketId: socket.id };

    // Check if the user is joining the correct room
    console.log(`${user.name} joined room ${room}`);

    // Ensure that the user joins the room
    socket.join(room);
    connectedUsers.set(socket.id, { userId: user._id, room });

    console.log(`${user.name} joined room ${room}`);

    // Notify the room that a user joined
    io.to(room).emit("user-joined", { user: userWithSocketId });
  });

  // Admin adds a user to an existing video session
  socket.on("admin-add-user-to-session", ({ room, user }) => {
    // Ensure the user can join the session
    if (connectedUsers.has(socket.id)) {
      socket.join(room);
      io.to(room).emit("user-joined", { user: { ...user, socketId: socket.id } });
      console.log(`${user.name} was added to room ${room}`);
    }
  });

  // When a user sends a message
  socket.on("send-message", ({ message, user }) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo?.room) {
      io.to(userInfo.room).emit("receive-message", {
        message,
        user,
        timestamp: new Date(),
      });
    }
  });

  // WebRTC signaling
  socket.on("offer", ({ offer, to }) => {
    socket.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    socket.to(to).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    socket.to(to).emit("ice-candidate", { candidate });
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      const { room, userId } = userInfo;
      io.to(room).emit("user-left", { userId });
      connectedUsers.delete(socket.id);
      console.log(`${userId} left room ${room}`);
    }
  });
}

module.exports = chatHandler;