import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/therapist.css";

// ✅ FIXED: Use same backend URL as Login & Register
const BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://neurocare-backend-3k89.onrender.com";

// ✅ Socket connection (lazy — only created once)
let socket;
function getSocket() {
  if (!socket) socket = io(BASE_URL);
  return socket;
}

function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/therapist`);
      setTherapists(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load therapists. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = (slot) => {
    if (!slot) return false;
    const now = new Date();
    const currentHour = now.getHours();

    const [start, end] = slot.split("-");

    const convertTo24Hour = (time) => {
      let hour = parseInt(time);
      if (time.includes("PM") && hour !== 12) hour += 12;
      if (time.includes("AM") && hour === 12) hour = 0;
      return hour;
    };

    const startHour = convertTo24Hour(start.trim());
    const endHour   = convertTo24Hour(end.trim());

    return currentHour >= startHour && currentHour < endHour;
  };

  const bookSession = async (therapistId) => {
    try {
      // ✅ Get user_id from localStorage (set during login)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;

      const res = await axios.post(`${BASE_URL}/api/therapist/book`, {
        user_id:      userId,
        therapist_id: therapistId,
      });

      // Real-time notification
      getSocket().emit("bookSession", {
        doctorId: therapistId,
        user:     user.name || "Patient",
      });

      navigate(`/therapistchat/${res.data.sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Booking failed. Please try again.");
    }
  };

  if (loading) return <div className="therapist-page"><p>Loading therapists...</p></div>;
  if (error)   return <div className="therapist-page"><p style={{color:"red"}}>{error}</p></div>;

  return (
    <div className="therapist-page">
      <h1>🩺 Available Therapists</h1>

      {therapists.length === 0 ? (
        <p>No therapists available at the moment.</p>
      ) : (
        <div className="therapist-grid">
          {therapists.map((therapist) => (
            <div className="therapist-card" key={therapist.id}>
              <h2 className="doctor-name">👩‍⚕️ {therapist.name}</h2>

              <p><strong>Specialization:</strong> {therapist.specialization}</p>
              <p><strong>Experience:</strong> {therapist.experience}</p>
              <p className="about-text">{therapist.about}</p>
              <p>🕒 <strong>Available:</strong> {therapist.slots}</p>

              <p className={checkAvailability(therapist.slots) ? "online" : "offline"}>
                {checkAvailability(therapist.slots) ? "🟢 Online" : "🔴 Offline"}
              </p>

              <button
                className="book-btn"
                disabled={!checkAvailability(therapist.slots)}
                onClick={() => bookSession(therapist.id)}
              >
                {checkAvailability(therapist.slots) ? "Book Session" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Therapists;
