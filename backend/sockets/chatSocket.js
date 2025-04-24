module.exports = (io) => {
    io.of('/chat').on('connection', (socket) => {
      socket.on('join-chat', (roomId) => {
        socket.join(roomId);
      });
      
      socket.on('send-message', (message) => {
        socket.to(message.roomId).emit('receive-message', message);
      });
    });
  };