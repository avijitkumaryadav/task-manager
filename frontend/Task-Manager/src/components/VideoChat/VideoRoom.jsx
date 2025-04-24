import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { UserContext } from '../../context/userContext';

const VideoRoom = () => {
  const { roomId } = useParams();
  const { user } = useContext(UserContext);
  const [peers, setPeers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const userVideoRef = useRef();
  const peersRef = useRef([]);
  const socketRef = useRef();
  const userStreamRef = useRef();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('/video', {
      auth: {
        token: localStorage.getItem('token'),
        userId: user._id,
        userName: user.name
      }
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        userVideoRef.current.srcObject = stream;
        userStreamRef.current = stream;

        socketRef.current.emit('join-room', roomId);

        socketRef.current.on('user-connected', (userId, userName) => {
          const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: userStreamRef.current
          });

          peer.on('signal', signal => {
            socketRef.current.emit('signal', { userId, signal });
          });

          peersRef.current.push({
            peerId: userId,
            peer,
            userName
          });
          setPeers(prev => [...prev, { id: userId, name: userName }]);
        });

        socketRef.current.on('signal', ({ userId, signal }) => {
          const peerObj = peersRef.current.find(p => p.peerId === userId);
          if (peerObj) peerObj.peer.signal(signal);
        });

        socketRef.current.on('user-disconnected', userId => {
          const peerObj = peersRef.current.find(p => p.peerId === userId);
          if (peerObj) peerObj.peer.destroy();
          setPeers(prev => prev.filter(peer => peer.id !== userId));
          peersRef.current = peersRef.current.filter(p => p.peerId !== userId);
        });

        socketRef.current.on('participants-update', (users) => {
          setParticipants(users);
        });
      });

    return () => {
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(track => track.stop());
      }
      socketRef.current.disconnect();
    };
  }, [roomId, user]);

  return (
    <DashboardLayout activeMenu="Video Call">
      <div className="video-container">
        <div className="local-video">
          <video ref={userVideoRef} autoPlay playsInline muted />
          <div className="user-name">You ({user.name})</div>
        </div>
        
        {peers.map(peer => (
          <div key={peer.id} className="remote-video">
            <Video peer={peer} />
            <div className="user-name">{peer.name}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.peer.on('stream', stream => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <video ref={ref} autoPlay playsInline />;
};

export default VideoRoom;