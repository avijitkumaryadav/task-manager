import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { UserContext } from '../context/userContext';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const ChatPage = () => {
  const { roomId } = useParams();
  const { user } = useContext(UserContext);
  const [activeChat, setActiveChat] = useState(roomId || null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [availableChats, setAvailableChats] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    if (!activeChat) return;

    // Initialize socket connection
    socketRef.current = io('/chat', {
      auth: {
        token: localStorage.getItem('token'),
        userId: user._id,
        userName: user.name
      }
    });

    socketRef.current.emit('join-chat', activeChat, user._id);

    // Load chat history
    const loadHistory = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.CHAT.HISTORY(activeChat));
        setMessages(res.data);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    // Load available chats
    const loadChats = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.CHAT.LIST);
        setAvailableChats(res.data);
      } catch (error) {
        console.error('Error loading chat list:', error);
      }
    };

    loadHistory();
    loadChats();

    // Socket event handlers
    socketRef.current.on('receive-message', (message) => {
      if (message.roomId === activeChat) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketRef.current.on('participants-update', (users) => {
      setParticipants(users);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [activeChat, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      roomId: activeChat,
      text: message,
      sender: {
        _id: user._id,
        name: user.name,
        avatar: user.profileImageUrl
      },
      timestamp: new Date().toISOString()
    };

    try {
      await axiosInstance.post(API_PATHS.CHAT.MESSAGE, newMessage);
      socketRef.current.emit('send-message', newMessage);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    setMessages([]);
    setParticipants([]);
  };

  return (
    <DashboardLayout activeMenu="Messages">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Chat List Section - col-span-1 */}
          <div className="form-card">
            <h2 className="text-xl font-medium mb-4">Conversations</h2>
            <div className="space-y-2">
              {availableChats.map(chat => (
                <div 
                  key={chat._id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    activeChat === chat._id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => handleChatSelect(chat._id)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      {chat.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{chat.name}</p>
                      <p className="text-xs text-gray-500">
                        {chat.lastMessage?.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window Section - col-span-3 */}
          {activeChat ? (
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">Chat Room</h2>
                <div className="text-sm text-gray-500">
                  Room ID: {activeChat}
                </div>
              </div>

              <div className="border rounded-lg p-4 h-[500px] overflow-y-auto">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`mb-4 ${msg.sender._id === user._id ? 'text-right' : 'text-left'}`}
                  >
                    {msg.sender._id !== user._id && (
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
                          {msg.sender.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{msg.sender.name}</span>
                      </div>
                    )}
                    <div 
                      className={`inline-block px-4 py-2 rounded-lg ${
                        msg.sender._id === user._id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`text-xs ${msg.sender._id === user._id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="mt-4 flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="form-card col-span-3 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No chat selected</h3>
                <p className="text-gray-500">Select a conversation from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;