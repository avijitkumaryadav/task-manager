import React, { useEffect, useRef, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:8000"); // Update if deployed

const VideoCall = () => {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [otherSocketId, setOtherSocketId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (loading) return; // If loading, don't proceed

    // If no user, handle error and navigate back
    if (!user) {
      console.error("User not found.");
      navigate("/login"); // Navigate to login page if no user
      return;
    }

    const roomName = "task-room"; // Ensure both admin and user use the same room

    const initMediaAndSocket = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localVideoRef.current.srcObject = localStream;

        peerConnectionRef.current = new RTCPeerConnection();

        localStream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, localStream);
        });

        peerConnectionRef.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        // Emit socket event to join room with user data
        socket.emit("join-room", roomName); // Only send roomName, not an object

        socket.on("user-joined", async ({ user: otherUser }) => {
          setOtherSocketId(otherUser.socketId);
          console.log("User joined:", otherUser);

          // If the current user is an admin, send an offer
          if (user && user.role === "admin") {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit("offer", { offer, to: otherUser.socketId });
          }
        });

        socket.on("offer", async ({ offer, from }) => {
          setOtherSocketId(from);
          await peerConnectionRef.current.setRemoteDescription(offer);
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit("answer", { answer, to: from });
        });

        socket.on("answer", async ({ answer }) => {
          await peerConnectionRef.current.setRemoteDescription(answer);
        });

        socket.on("ice-candidate", async ({ candidate }) => {
          try {
            await peerConnectionRef.current.addIceCandidate(candidate);
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        });

        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate && otherSocketId) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: otherSocketId,
            });
          }
        };

        // Listen for chat messages from other users
        socket.on("receive-message", ({ message, user }) => {
          console.log("📩 Message received:", message, "from", user.name);
          setMessages((prev) => [...prev, { user, message }]);
        });
      } catch (err) {
        console.error("Error in setting up media:", err);
      }
    };

    initMediaAndSocket();

    return () => {
      const tracks = localVideoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
      peerConnectionRef.current?.close();
      socket.disconnect();
    };
  }, [loading, user]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send-message", { message, user });
    setMessages((prev) => [...prev, { user, message }]);
    setMessage("");
  };

  const handleEndCall = () => {
    const tracks = localVideoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    socket.disconnect();
    navigate("/admin/dashboard");
  };

  // If loading, show loading spinner or message
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Video Call & Chat</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-full h-64 rounded-md border"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-full h-64 rounded-md border"
        />
      </div>

      <div className="bg-white rounded-lg border p-4 max-w-xl mb-4">
        <div className="h-40 overflow-y-auto border-b pb-2 mb-2">
          {messages.map((msg, i) => (
            <div key={i} className="mb-1 text-sm">
              <strong>{msg.user?.name || "Anonymous"}:</strong> {msg.message}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>

      <button
        onClick={handleEndCall}
        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCall;