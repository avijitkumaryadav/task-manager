import { io } from "socket.io-client";

// Replace with your backend URL
const SOCKET_URL = "http://localhost:8000"; // Or your deployed backend URL

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll manually connect when the user is authenticated
});