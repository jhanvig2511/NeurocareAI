import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-call";
import axios from "axios";

const BASE_URL = "https://neurocareai-xxrl.onrender.com";

function DoctorPanel() {
  const doctor = JSON.parse(localStorage.getItem("doctor"));
  const [bookings, setBookings] = useState([]);
  const [notification, setNotification] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const addBooking = (data) => {
    setBookings((prev) => {
      const exists = prev.find((b) => String(b.sessionId) === String(data.sessionId));
      if (exists) return prev;
      return [...prev, data];
    });
  };

  useEffect(() => {
    if (!doctor) return;
    const pollPendingSessions = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/therapist/pending/${doctor.id}`);
        if (res.data && Array.isArray(res.data)) {
          res.data.forEach((session) => {
            addBooking({
              user: session.user_name || session.user_email || "Patient",
              sessionId: session.id,
              doctorId: String(doctor.id),
            });
          });
        }
      } catch (err) {
        console.log("Polling error:", err.message);
      }
    };
    pollPendingSessions();
    const interval = setInterval(pollPendingSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!doctor) return;
    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setSocketStatus("connected");
      socket.emit("doctorOnline", String(doctor.id));
    });
    socket.on("connect_error", () => setSocketStatus("error"));
    socket.on("disconnect", () => setSocketStatus("disconnected"));
    socket.on("newBooking", (data) => {
      addBooking(data);
      setNotification(`${data.user} ne session book kiya!`);
      setTimeout(() => setNotification(null), 5000);
    });
    return () => {
      socket.off("newBooking");
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  const acceptBooking = async (sessionId) => {
    try {
      await axios.put(`${BASE_URL}/api/therapist/accept/${sessionId}`);
    } catch (err) {
      console.log(err);
    }
    navigate(`/therapistchat/${sessionId}`);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>👩‍⚕️ {doctor?.name}</h1>
      <h3>Welcome to Doctor Dashboard</h3>

      <div style={{ marginBottom: "10px" }}>
        <span style={{
          background: socketStatus === "connected" ? "#4CAF50" : socketStatus === "connecting" ? "#FF9800" : "#f44336",
          color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px",
        }}>
          {socketStatus === "connected" ? "🟢 Live Connected" : socketStatus === "connecting" ? "🟡 Connecting..." : "🔴 Reconnecting..."}
        </span>
      </div>

      {notification && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "#4CAF50", color: "white", padding: "15px 25px",
          borderRadius: "10px", fontSize: "16px", fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 9999,
        }}>
          🔔 {notification}
        </div>
      )}

      <div style={{ marginTop: "20px", padding: "20px", borderRadius: "10px", background: "#f4f4f4" }}>
        <h3>Doctor Info</h3>
        <p><strong>Specialization:</strong> {doctor?.specialization}</p>
        <p><strong>Experience:</strong> {doctor?.experience}</p>
        <p><strong>Available Time:</strong> {doctor?.slots}</p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📋 Incoming Bookings {bookings.length > 0 && (
          <span style={{
            background: "#f44336", color: "white", borderRadius: "50%",
            padding: "2px 8px", fontSize: "14px", marginLeft: "8px",
          }}>{bookings.length}</span>
        )}</h3>

        {bookings.length === 0 ? (
          <div style={{
            color: "gray", padding: "30px", textAlign: "center",
            background: "#f9f9f9", borderRadius: "10px", border: "2px dashed #ddd",
          }}>
            <p style={{ fontSize: "18px" }}>⏳ Waiting for patient bookings...</p>
          </div>
        ) : (
          bookings.map((booking, index) => (
            <div key={booking.sessionId || index} style={{
              background: "#fff", border: "2px solid #4CAF50", borderRadius: "10px",
              padding: "20px", marginBottom: "15px", display: "flex",
              justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 2px 8px rgba(76,175,80,0.15)",
            }}>
              <div>
                <p style={{ margin: "5px 0" }}>🧑 <strong>Patient:</strong> {booking.user}</p>
                <p style={{ margin: "5px 0" }}>📅 <strong>Session ID:</strong> {booking.sessionId}</p>
                <p style={{ margin: "5px 0", color: "#4CAF50", fontWeight: "bold" }}>🟢 Waiting for you to join...</p>
              </div>
              <button
                onClick={() => acceptBooking(booking.sessionId)}
                style={{
                  background: "linear-gradient(135deg, #4CAF50, #2e7d32)",
                  color: "white", border: "none", padding: "12px 24px",
                  borderRadius: "8px", cursor: "pointer", fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                ✅ Accept & Chat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DoctorPanel;