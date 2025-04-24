import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext'; // Import your UserContext

const ChatWindow = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef();
  const { user } = useContext(UserContext); // Get current user from context
  
  useEffect(() => {
    // Initialize socket connection with authentication
    socketRef.current = io(BASE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token') // Or your auth token storage method
      }
    });

    // Join the chat room
    socketRef.current.emit('join-chat', roomId);
    
    // Listen for new messages
    socketRef.current.on('receive-message', (message) => {
      setMessages(prev => [...prev, {
        ...message,
        // Format the message for display
        isCurrentUser: message.sender === user._id
      }]);
    });
    
    // Load chat history
    const loadHistory = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.CHAT.HISTORY(roomId));
        setMessages(res.data.map(msg => ({
          ...msg,
          isCurrentUser: msg.sender._id === user._id // Compare with current user
        })));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    
    loadHistory();
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, user._id]); // Add user._id to dependencies

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      roomId,
      text: message,
      sender: user._id, // Use actual user ID from context
      timestamp: new Date().toISOString()
    };

    try {
      // 1. First save to database
      await axiosInstance.post(API_PATHS.CHAT.MESSAGE, newMessage);
      
      // 2. Then broadcast via socket
      socketRef.current.emit('send-message', {
        ...newMessage,
        sender: { // Include sender details for display
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        }
      });
      
      // 3. Clear input field
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`message ${msg.isCurrentUser ? 'sent' : 'received'}`}
          >
            {!msg.isCurrentUser && (
              <div className="sender-info">
                <img src={msg.sender?.avatar} alt={msg.sender?.name} />
                <span>{msg.sender?.name}</span>
              </div>
            )}
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          autoFocus
        />
        <button type="submit" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;