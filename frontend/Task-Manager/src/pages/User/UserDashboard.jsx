import React, { useEffect, useState, useContext } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import { io } from "socket.io-client"; // ✅ Socket.IO

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const UserDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [activeCall, setActiveCall] = useState(null);

  // Chart Data
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || {};
    const taskPriorityLevels = data?.taskPriorityLevels || {};

    setPieChartData([
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ]);

    setBarChartData([
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ]);
  };

  // Fetch Dashboard
  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_USER_DASHBOARD_DATA);
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || {});
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // HTTP fallback for active call
  const fetchActiveCall = async () => {
    try {
      const res = await axiosInstance.get("/api/calls/my-sessions");
      if (res.status === 200 && res.data.length > 0) {
        setActiveCall(res.data[0]);
      }
    } catch (err) {
      if (err.response?.status !== 204) {
        console.error("Error checking active call:", err);
      }
    }
  };

  const onSeeMore = () => {
    navigate("/user/tasks");
  };

  useEffect(() => {
    if (!user) return;
    
    getDashboardData();
    fetchActiveCall();

    // ✅ Socket.io connection for real-time updates
    const socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    if (user?._id) {
      socket.emit("join-room", {
        room: "global",
        user,
      });

      // ✅ Listen for call session created by admin
      socket.on("call-session-created", ({ room, participants }) => {
        if (participants.includes(user._id)) {
          setActiveCall({ roomId: room, participants });
        }
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div className="col-span-3">
          <h2 className="text-xl md:text-2xl">Good Morning! {user?.name}</h2>
          <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
            {moment().format("dddd Do MMM YYYY")}
          </p>
        </div>

        {/* ✅ Video Call Banner */}
        {activeCall && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-indigo-700">
                You're invited to a video call
              </h3>
              <p className="text-sm text-indigo-500">
                Click below to join the live session.
              </p>
            </div>
            <button
              onClick={() => navigate(`/user/video-room/${activeCall.roomId}`)}
              className="btn btn-primary px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              Join Now
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
        <InfoCard
          label="Total Tasks"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
          color="bg-primary"
        />
        <InfoCard
          label="Pending Tasks"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
          color="bg-violet-500"
        />
        <InfoCard
          label="In Progress Tasks"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
          color="bg-cyan-500"
        />
        <InfoCard
          label="Completed Tasks"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
          color="bg-lime-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Task Distribution</h5>
          </div>
          <CustomPieChart data={pieChartData} colors={COLORS} />
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Task Priority Levels</h5>
          </div>
          <CustomBarChart data={barChartData} />
        </div>

        <div className="card md:col-span-2">
          <div className="flex items-center justify-between">
            <h5 className="text-lg">Recent Tasks</h5>
            <button className="card-btn" onClick={onSeeMore}>
              See All <LuArrowRight className="text-base" />
            </button>
          </div>
          <TaskListTable tableData={dashboardData?.recentTasks || []} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;