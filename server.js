// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store connected users (user_id → socket.id)
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Client (React Native) identifies itself
  socket.on("joinUser", (userId) => {
    console.log(`👤 User ${userId} joined`);
    connectedUsers.set(userId, socket.id);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    connectedUsers.forEach((value, key) => {
      if (value === socket.id) connectedUsers.delete(key);
    });
  });
});

// ✅ Endpoint called from PHP after successful payment
app.post("/notify", (req, res) => {
  const { receiver_id, sender, amount } = req.body;
  console.log("💰 Notify request received:", req.body);

  if (!receiver_id || !amount || !sender) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Find connected user
  const receiverSocket = connectedUsers.get(receiver_id);
  if (receiverSocket) {
    io.to(receiverSocket).emit("creditAlert", { sender, amount });
    console.log(`✅ Credit alert sent to user ${receiver_id}`);
    return res.json({ message: "Credit alert sent successfully" });
  } else {
    console.log(`⚠️ User ${receiver_id} not connected`);
    return res.status(404).json({ message: "User not connected" });
  }
});

server.listen(3000, () => {
  console.log("✅ Socket.IO server running on port 3000");
});
