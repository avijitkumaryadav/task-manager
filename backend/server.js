require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const http = require('http'); // Add this
const socketio = require('socket.io'); // Add this
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "*",
    "http://localhost:5173",
    "http://192.168.1.35:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// Create HTTP server

// Socket.io configuration
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);

// Static File Handling (for uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Default Route
app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

// Socket.io connection handling
require('./sockets/videoSocket')(io);
require('./sockets/chatSocket')(io);


// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});