import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const VideoCallPage = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();
  
  const createRoom = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.VIDEO.ROOM);
      navigate(`/video/${res.data.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };
  
  const joinRoom = () => {
    if (roomId.trim()) {
      navigate(`/video/${roomId}`);
    }
  };
  
  return (
    <DashboardLayout activeMenu="video">
      <div>
        <button onClick={createRoom}>Create New Room</button>
        <div>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoCallPage;