const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// Enable CORS for all origins
app.use(cors());

// Default route for testing
app.get("/", (req, res) => {
  res.send("Socket.IO server is running 🚀");
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend URL if needed
    methods: ["GET", "POST"]
  }
});

// Handle new client connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for events from client (React Native app)
  socket.on("sendMessage", (data) => {
    console.log("Message from client:", data);

    // Broadcast message to all connected clients
    io.emit("receiveMessage", data);
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Use Render's PORT or default to 3000 locally
const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
