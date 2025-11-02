// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json()); // ✅ So Express can read JSON body

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // You can replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

// ===== SOCKET.IO EVENTS =====
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Example: receive message from client
  socket.on("sendMessage", (data) => {
    console.log("Message from client:", data);
    io.emit("receiveMessage", data); // broadcast to all
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ===== HTTP ENDPOINT for PHP =====
app.post("/notify", (req, res) => {
  const data = req.body;
  console.log("Notification from PHP:", data);

  // Emit to all connected Socket.IO clients
  io.emit("creditAlert", data);

  res.json({ success: true, message: "Notification sent to all clients" });
});

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("Socket.IO Server is Running ✅");
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
