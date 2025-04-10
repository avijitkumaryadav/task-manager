require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const callRoutes = require("./routes/callRoutes");

// Import Socket Handlers
const registerSocketHandlers = require("./realtime/socket");

const app = express();

// Create HTTP Server (required for Socket.IO)
const server = http.createServer(app);

// Initialize Socket.IO with proper CORS for production
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", // e.g., "https://your-frontend.netlify.app"
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Connect MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*", // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/calls", callRoutes);

// Static File Handling (for uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register Socket.IO Event Handlers
registerSocketHandlers(io);

// Default Route
app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});