import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("https://neurocareai-xxrl.onrender.com");

function DoctorPanel() {
  const doctor = JSON.parse(localStorage.getItem("doctor"));
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctor) {
      console.log("Doctor ID:", doctor.id);
      console.log("Doctor ID type:", typeof doctor.id);

      socket.emit("doctorOnline", String(doctor.id));

      socket.on("newBooking", (data) => {
        console.log("Booking received:", data);
        setBookings((prev) => [...prev, data]);
      });
    }

    return () => {
      socket.off("newBooking");
    };
  }, []);

  const acceptBooking = (sessionId) => {
    navigate(`/therapistchat/${sessionId}`);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>👩‍⚕️ {doctor?.name}</h1>
      <h3>Welcome to Doctor Dashboard</h3>

      <div style={{ marginTop: "20px", padding: "20px", borderRadius: "10px", background: "#f4f4f4" }}>
        <h3>Doctor Info</h3>
        <p><strong>Specialization:</strong> {doctor?.specialization}</p>
        <p><strong>Experience:</strong> {doctor?.experience}</p>
        <p><strong>Available Time:</strong> {doctor?.slots}</p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📋 Incoming Bookings</h3>

        {bookings.length === 0 ? (
          <p style={{ color: "gray" }}>Waiting for patient bookings...</p>
        ) : (
          bookings.map((booking, index) => (
            <div key={index} style={{
              background: "#fff",
              border: "2px solid #4CAF50",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <p>🧑 <strong>Patient:</strong> {booking.user}</p>
                <p>📅 <strong>Session ID:</strong> {booking.sessionId}</p>
              </div>
              <button
                onClick={() => acceptBooking(booking.sessionId)}
                style={{
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px"
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