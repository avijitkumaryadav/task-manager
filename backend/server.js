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
const server = http.createServer(app);

// ✅ Allow multiple origins for CORS
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(origin => origin.trim());

// ✅ CORS for Express
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Blocked by Express CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Express middleware
app.use(express.json());

// ✅ Initialize Socket.IO with matching CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by Socket.IO CORS:", origin);
        callback(new Error("Not allowed by Socket.IO CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Connect DB
connectDB();

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/calls", callRoutes);

// ✅ Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Register socket handlers
registerSocketHandlers(io);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

// ✅ Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});