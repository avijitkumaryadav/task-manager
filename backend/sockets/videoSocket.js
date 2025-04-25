module.exports = (io) => {
  const videoNamespace = io.of('/video');
  const activeRooms = new Map(); // roomId -> Set of users

  videoNamespace.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    // Verify token (using your existing JWT logic)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      
      // Attach user info to socket
      socket.user = {
        id: decoded._id,
        name: decoded.name,
        avatar: decoded.profileImageUrl
      };
      next();
    });
  });

  videoNamespace.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected to video namespace`);

    socket.on('join-room', (roomId) => {
      const { id, name, avatar } = socket.user;
      
      // Initialize room if it doesn't exist
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Map());
      }
      
      const room = activeRooms.get(roomId);
      
      // Add user to room
      room.set(id, { id, name, avatar });
      socket.join(roomId);
      
      // Notify others in the room
      socket.to(roomId).emit('user-connected', { id, name, avatar });
      
      // Send current participants to the new user
      const participants = Array.from(room.values());
      socket.emit('participants-update', participants);
      
      // Update all participants
      videoNamespace.to(roomId).emit('participants-update', participants);
      
      console.log(`User ${name} joined room ${roomId}`);
    });

    socket.on('signal', ({ userId, signal }) => {
      // Forward signaling data to specific user
      socket.to(userId).emit('signal', { 
        userId: socket.user.id,
        userName: socket.user.name,
        signal 
      });
    });

    socket.on('disconnect', () => {
      // Remove user from all rooms they joined
      Array.from(activeRooms.entries()).forEach(([roomId, users]) => {
        if (users.has(socket.user.id)) {
          users.delete(socket.user.id);
          
          // Notify remaining users
          socket.to(roomId).emit('user-disconnected', socket.user.id);
          videoNamespace.to(roomId).emit('participants-update', 
            Array.from(users.values()));
            
          console.log(`User ${socket.user.name} left room ${roomId}`);
          
          // Clean up empty rooms
          if (users.size === 0) {
            activeRooms.delete(roomId);
          }
        }
      });
    });

    // Error handling
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  // Logging for debugging
  setInterval(() => {
    console.log('Active video rooms:', 
      Array.from(activeRooms.entries()).map(([roomId, users]) => ({
        roomId,
        users: Array.from(users.values()).map(u => u.name)
      }))
    );
  }, 30000); // Log every 30 seconds
};