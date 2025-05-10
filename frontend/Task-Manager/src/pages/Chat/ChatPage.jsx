import React, { useContext, useEffect, useState, useCallback } from 'react'; // Add useCallback
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { UserContext } from '../../context/userContext';
import { socket } from '../../utils/socket';
import axiosInstance from '../../utils/axiosInstance'; // Import axiosInstance
import { API_PATHS } from '../../utils/apiPaths'; // Import API_PATHS


const ChatPage = () => {
  const { user } = useContext(UserContext);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
   const [allUsers, setAllUsers] = useState([]); // To fetch all users for admin to create sessions
   const [selectedUsersForSession, setSelectedUsersForSession] = useState([]); // For admin to select users


  // Fetch all users (for admin to create sessions)
    const fetchAllUsers = useCallback(async () => {
        if (user?.role !== 'admin') return; // Only fetch for admin
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS); // Assuming you have this API
            setAllUsers(response.data);
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    }, [user]);


  // Fetch chat sessions for the logged-in user
  const fetchChatSessions = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get(API_PATHS.CHAT.GET_CHAT_SESSIONS); // Assuming you add this API_PATH
      setChatSessions(response.data);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  }, [user]);

    // Fetch messages for a selected session
    const fetchMessages = useCallback(async (sessionId) => {
        if (!sessionId) {
            setMessages([]);
            return;
        }
        try {
            const response = await axiosInstance.get(`${API_PATHS.CHAT.GET_CHAT_MESSAGES}/${sessionId}/messages`); // Assuming you add this API_PATH
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
             setMessages([]); // Clear messages on error
        }
    }, []);


  useEffect(() => {
    if (!user) return;

    fetchChatSessions();
    fetchAllUsers(); // Fetch all users on component mount if admin

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
        // Only add message if it belongs to the currently selected session
        if (selectedSession && message.chatSession === selectedSession._id) {
            setMessages((prevMessages) => [...prevMessages, message]);
        }
    });

    // Listen for active users list
    socket.on('activeUsers', (users) => {
        setActiveUsers(users);
    });

    // Listen for new sessions being created (optional, you might refetch sessions instead)
    // socket.on('newChatSession', (session) => {
    //     setChatSessions((prevSessions) => [session, ...prevSessions]);
    // });

    // Clean up socket listeners on component unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('activeUsers');
    //   socket.off('newChatSession'); // Clean up if implemented
    };
  }, [user, fetchChatSessions, fetchAllUsers, selectedSession]); // Add dependencies


    // Effect to fetch messages when selectedSession changes
    useEffect(() => {
        fetchMessages(selectedSession?._id);
    }, [selectedSession, fetchMessages]);


  const sendMessage = async (e) => { // Made async to handle potential errors or future async operations
    e.preventDefault();
    if (inputMessage.trim() && user && selectedSession) { // Ensure a session is selected
      const messageData = {
        chatSessionId: selectedSession._id, // Include the session ID
        text: inputMessage,
        sender: {
            id: user._id,
            name: user.name,
            // Add other user details you want to send, e.g., profile image
        },
        timestamp: new Date(),
      };
      socket.emit('sendMessage', messageData);
      setInputMessage('');
    }
  };

    // Handle selecting a chat session
    const handleSessionSelect = (session) => {
        setSelectedSession(session);
        // Join the session room on the backend when selecting a session
        socket.emit('joinSession', session._id); // We'll add this event to backend later
    };


    // Handle creating a new chat session (Admin only)
    const handleCreateSession = async () => {
        if (!user || user.role !== 'admin' || selectedUsersForSession.length === 0) return;

        try {
            const participantIds = selectedUsersForSession.map(user => user._id);
            // Include the admin user's ID in the participants
             if (!participantIds.includes(user._id)) {
                 participantIds.push(user._id);
             }


            const response = await axiosInstance.post(API_PATHS.CHAT.CREATE_CHAT_SESSION, { participantIds }); // Assuming you add this API_PATH
             // If an existing session is returned, select it
             if (response.data.session) {
                await fetchChatSessions(); // Refresh sessions list
                setSelectedSession(response.data.session);
             }
            setSelectedUsersForSession([]); // Clear selected users after creating session
        } catch (error) {
            console.error('Error creating chat session:', error);
        }
    };


  return (
    <DashboardLayout activeMenu="Messages">
      <div className="chat-page-container flex h-[calc(100vh-100px)]"> {/* Adjust height as needed */}
        {/* Chat Sessions List */}
        <div className="chat-sessions-sidebar w-1/4 border-r overflow-y-auto">
            <h3 className="font-bold p-4 border-b">Chat Sessions</h3>
             {/* Admin: Create New Session */}
            {user?.role === 'admin' && (
                <div className="p-4 border-b">
                    <h4 className="font-semibold mb-2">Create New Session</h4>
                    <select
                        multiple
                        className="border rounded p-2 w-full mb-2"
                         onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions);
                            const selectedUsers = selectedOptions.map(option => ({
                                _id: option.value,
                                name: option.text,
                            }));
                            setSelectedUsersForSession(selectedUsers);
                        }}
                        value={selectedUsersForSession.map(user => user._id)} // Set selected values
                    >
                        {allUsers.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>
                    <button
                        className="bg-green-500 text-white p-2 rounded w-full"
                        onClick={handleCreateSession}
                         disabled={selectedUsersForSession.length === 0}
                    >
                        Create Session
                    </button>
                </div>
            )}
            <ul>
                {chatSessions.map(session => (
                    <li
                        key={session._id}
                        className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedSession?._id === session._id ? 'bg-gray-200' : ''}`}
                        onClick={() => handleSessionSelect(session)}
                    >
                         {/* Display participants (excluding current user) */}
                        {session.participants
                            .filter(participant => participant._id !== user._id)
                            .map(participant => participant.name).join(', ')}
                    </li>
                ))}
            </ul>
        </div>

        {/* Chat Area */}
        <div className="chat-area flex-1 flex flex-col">
            <div className="messages-box flex-1 overflow-y-auto p-4">
                {selectedSession ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`message mb-2 ${msg.sender._id === user._id ? 'text-right' : ''}`}>
                            <span className="font-bold">{msg.sender.name}:</span> {msg.text}
                            <div className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500">Select a chat session to start messaging</div>
                )}
            </div>

            {selectedSession && (
                <form onSubmit={sendMessage} className="flex p-4 border-t">
                <input
                    type="text"
                    className="flex-grow border rounded-l p-2"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Enter your message"
                    disabled={!selectedSession} // Disable input if no session is selected
                />
                <button
                    type="submit"
                    className="bg-primary text-white p-2 rounded-r"
                    disabled={!inputMessage.trim() || !selectedSession} // Disable button if no input or session
                >
                    Send
                </button>
                </form>
            )}
        </div>
        {/* Simple display of active users (Optional - you can integrate this elsewhere) */}
        {/* <div className="w-1/4 border-l overflow-y-auto">
            <h3 className="font-bold p-4 border-b">Active Users</h3>
            <ul>
                {activeUsers.map(activeUser => (
                    <li key={activeUser.socketId} className="p-4 border-b">{activeUser.userId}</li>
                ))}
            </ul>
        </div> */}
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;