import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const VideoCallStart = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/users").then(res => setUsers(res.data));
  }, []);

  const startCall = async () => {
    const res = await axios.post("/api/calls/create", {
      participants: selectedUsers
    });

    navigate(`/admin/video/${res.data.roomId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Start a Video Call</h2>

      <div className="mb-4">
        {users.map(user => (
          <div key={user._id}>
            <label>
              <input
                type="checkbox"
                value={user._id}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setSelectedUsers((prev) =>
                    isChecked ? [...prev, user._id] : prev.filter(id => id !== user._id)
                  );
                }}
              />{" "}
              {user.name}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={startCall}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Call
      </button>
    </div>
  );
};

export default VideoCallStart;