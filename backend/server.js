require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const chatRoutes = require("./routes/chatRoutes"); // Import chat routes

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "*",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "*", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

// Use the socketHandler (assuming socketHandler.js exists and exports a function)
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes); // Add chat routes

// Static File Handling (for uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => { // Listen on the HTTP server
  console.log(`✅ Server running on port ${PORT}`);
});