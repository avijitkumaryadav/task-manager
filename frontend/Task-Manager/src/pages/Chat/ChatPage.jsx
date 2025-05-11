import React, {
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
  } from 'react';
  import DashboardLayout from '../../components/layouts/DashboardLayout';
  import { UserContext } from '../../context/userContext';
  import { socket } from '../../utils/socket';
  import axiosInstance from '../../utils/axiosInstance';
  import { API_PATHS } from '../../utils/apiPaths';
  import { HiOutlineTrash, HiOutlineShare } from 'react-icons/hi2';
  
  const ChatPage = () => {
    const { user } = useContext(UserContext);
    const [shareLink, setShareLink] = useState('');
    const [chatSessions, setChatSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsersForSession, setSelectedUsersForSession] = useState([]);
    const messagesEndRef = useRef(null);
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    const fetchAllUsers = useCallback(async () => {
      if (user?.role !== 'admin') return;
      try {
        const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
        setAllUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    }, [user]);
  
    const fetchChatSessions = useCallback(async () => {
      if (!user) return;
      try {
        const res = await axiosInstance.get(API_PATHS.CHAT.GET_CHAT_SESSIONS);
        setChatSessions(res.data);
      } catch (err) {
        console.error('Error fetching chat sessions:', err);
      }
    }, [user]);
  
    const fetchMessages = useCallback(async (sessionId) => {
      if (!sessionId) return setMessages([]);
      try {
        const res = await axiosInstance.get(API_PATHS.CHAT.GET_CHAT_MESSAGES(sessionId));
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
      }
    }, []);
  
    useEffect(() => {
      setShareLink('');
      if (!user) return;
  
      fetchChatSessions();
      fetchAllUsers();
  
      socket.on('receiveMessage', (msg) => {
        if (selectedSession && msg.chatSession === selectedSession._id) {
          setMessages((prev) => [...prev, msg]);
        }
      });
  
      socket.on('activeUsers', (users) => {
        setActiveUsers(users);
      });
  
      socket.on('sessionDeleted', ({ sessionId }) => {
        if (selectedSession?._id === sessionId) {
          setSelectedSession(null);
        }
        setChatSessions(prev => prev.filter(session => session._id !== sessionId));
      });
  
      return () => {
        socket.off('receiveMessage');
        socket.off('activeUsers');
        socket.off('sessionDeleted');
      };
    }, [user, fetchChatSessions, fetchAllUsers, selectedSession]);
  
    useEffect(() => {
      if (selectedSession) {
        fetchMessages(selectedSession._id);
        socket.emit('joinSession', selectedSession._id);
      }
    }, [selectedSession, fetchMessages]);
  
    const sendMessage = (e) => {
      e.preventDefault();
      if (!inputMessage.trim() || !user || !selectedSession) return;
  
      const messageData = {
        chatSessionId: selectedSession._id,
        text: inputMessage,
        sender: {
          id: user._id,
          name: user.name,
          profileImageUrl: user.profileImageUrl || '',
        },
      };
  
      socket.emit('sendMessage', messageData);
      setInputMessage('');
    };
  
    const handleSessionSelect = (session) => {
      setSelectedSession(session);
    };
  
    const handleCreateSession = async () => {
      if (!user || user.role !== 'admin' || selectedUsersForSession.length === 0) return;
  
      try {
        const participantIds = selectedUsersForSession.map((u) => u._id);
        if (!participantIds.includes(user._id)) participantIds.push(user._id);
  
        const res = await axiosInstance.post(API_PATHS.CHAT.CREATE_CHAT_SESSION, { participantIds });
        if (res.data.session) {
          await fetchChatSessions();
          setSelectedSession(res.data.session);
        }
        setSelectedUsersForSession([]);
      } catch (err) {
        console.error('Error creating session:', err);
      }
    };
  
    const handleGetShareLink = async () => {
      if (!user || user.role !== 'admin' || !selectedSession) return;
  
      try {
        const res = await axiosInstance.get(API_PATHS.CHAT.GET_CHAT_SESSION_LINK(selectedSession._id));
        setShareLink(res.data.link);
      } catch (err) {
        console.error('Error getting share link:', err);
        setShareLink('Error generating link');
      }
    };
  
    const handleDeleteSession = async () => {
      if (!user || user.role !== 'admin' || !selectedSession) return;
  
      if (window.confirm('Are you sure you want to delete this chat session?')) {
        try {
          socket.emit('deleteSession', selectedSession._id);
          await axiosInstance.delete(API_PATHS.CHAT.DELETE_CHAT_SESSION(selectedSession._id));
        } catch (err) {
          console.error('Error deleting session:', err);
        }
      }
    };
  
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
  
    return (
      <DashboardLayout activeMenu="Messages">
        <div className="chat-page-container flex h-[calc(100vh-100px)]">
          {/* Sidebar */}
          <div className="chat-sessions-sidebar w-1/4 border-r overflow-y-auto">
            <h3 className="font-bold p-4 border-b">Chat Sessions</h3>
            {user?.role === 'admin' && (
              <div className="p-4 border-b">
                <h4 className="font-semibold mb-2">Create New Session</h4>
                <select
                  multiple
                  className="border rounded p-2 w-full mb-2"
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map((o) => ({
                      _id: o.value,
                      name: o.text,
                    }));
                    setSelectedUsersForSession(selected);
                  }}
                  value={selectedUsersForSession.map((u) => u._id)}
                >
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-green-500 text-white p-2 rounded w-full"
                  onClick={handleCreateSession}
                >
                  Create Session
                </button>
              </div>
            )}
            <ul>
              {chatSessions.map((session) => (
                <li
                  key={session._id}
                  className={`p-4 cursor-pointer hover:bg-gray-100 ${
                    selectedSession?._id === session._id ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => handleSessionSelect(session)}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {session.participants
                        .filter((p) => p._id !== user._id)
                        .map((p) => p.name)
                        .join(', ')}
                    </span>
                    {activeUsers.some(u => 
                      session.participants.some(p => p._id === u.userId)
                    ) && (
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
  
          {/* Main Chat Area */}
          <div className="chat-area flex-1 flex flex-col">
            <div className="chat-header p-4 border-b flex justify-between items-center">
              {selectedSession ? (
                <>
                  <h3 className="font-bold">
                    {selectedSession.participants
                      .filter((p) => p._id !== user._id)
                      .map((p) => p.name)
                      .join(', ')}
                  </h3>
                  <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                      <>
                        <button
                          className="text-gray-600 hover:text-blue-600 p-1 rounded"
                          onClick={handleGetShareLink}
                          title="Share Session"
                        >
                          <HiOutlineShare size={20} />
                        </button>
                        <button
                          className="text-gray-600 hover:text-red-600 p-1 rounded"
                          onClick={handleDeleteSession}
                          title="Delete Session"
                        >
                          <HiOutlineTrash size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <h3 className="font-bold">Select a Chat Session</h3>
              )}
            </div>
  
            {user?.role === 'admin' && shareLink && (
              <div className="p-4 bg-yellow-100 text-sm border-b border-yellow-300">
                Share this link:{' '}
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {shareLink}
                </a>
              </div>
            )}
  
            <div className="messages-box flex-1 overflow-y-auto p-4">
              {selectedSession ? (
                messages.length > 0 ? (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-3 flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender._id !== user._id && (
                        <img
                          src={msg.sender.profileImageUrl || '/default-avatar.png'}
                          alt="avatar"
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div
                        className={`p-3 rounded-lg max-w-xs ${
                          msg.sender._id === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        <div className="font-semibold">{msg.sender.name}</div>
                        <div>{msg.text}</div>
                        <div className="text-xs text-right opacity-80">
                          {formatTime(msg.createdAt || msg.timestamp)}
                        </div>
                      </div>
                      {msg.sender._id === user._id && (
                        <img
                          src={user.profileImageUrl || '/default-avatar.png'}
                          alt="avatar"
                          className="w-8 h-8 rounded-full ml-2"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 mt-10">No messages yet</p>
                )
              ) : (
                <p className="text-center text-gray-500 mt-10">No session selected.</p>
              )}
              <div ref={messagesEndRef} />
            </div>
  
            {/* Message Input */}
            {selectedSession && (
              <form onSubmit={sendMessage} className="flex p-4 border-t">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 border rounded p-2 mr-2"
                  placeholder="Type your message..."
                />
                <button type="submit" className="bg-blue-500 text-white px-4 rounded">
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  };
  
  export default ChatPage;