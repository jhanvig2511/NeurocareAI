const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://neurocare-ai-theta.vercel.app",
  "https://neurocare-git-main-jhanvi-gupta-s-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error("CORS not allowed for: " + origin));
  },
  credentials: true,
}));

app.use(bodyParser.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("doctorOnline", (doctorId) => {
    socket.join(doctorId);
    console.log(`Doctor ${doctorId} Online`);
  });

  socket.on("bookSession", ({ doctorId, user, sessionId, therapistName }) => {
    console.log("bookSession received:", { doctorId, user, sessionId });
    io.to(doctorId).emit("newBooking", {
      message: `${user} booked a session`,
      doctorId,
      user,
      sessionId,
      therapistName,
    });
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // ✅ Forward fromSocketId so sender can skip their own echo
  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", {
      sender: data.sender,
      message: data.message,
      fromSocketId: data.fromSocketId,
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const adminRoutes = require("./routes/admin");
const therapistRoutes = require("./routes/therapist");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/therapist", therapistRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Mental Health Backend Running 🚀" });
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ message: "Error fetching users" });
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});