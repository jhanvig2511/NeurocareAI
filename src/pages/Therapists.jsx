import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/therapist.css";

const BASE_URL = "https://neurocareai-xxrl.onrender.com";
const socket = io(BASE_URL);

function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/therapist`);
      setTherapists(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const checkAvailability = (slot) => {
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
    const endHour = convertTo24Hour(end.trim());
    return currentHour >= startHour && currentHour < endHour;
  };

  const bookSession = async (therapistId, therapistName) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.name || user?.email || "Patient";

    try {
      const res = await axios.post(`${BASE_URL}/api/therapist/book`, {
        user_id: user?.id || 1,
        therapist_id: therapistId,
      });

      /* REAL-TIME NOTIFICATION TO DOCTOR */
      socket.emit("bookSession", {
        doctorId: String(therapistId),
        user: userName,
        therapistName: therapistName,
      });

      alert(`✅ Session booked with ${therapistName}! Redirecting to chat...`);
      navigate(`/therapistchat/${res.data.sessionId}`);
    } catch (err) {
      console.log(err);
      alert("Booking failed ❌");
    }
  };

  return (
    <div className="therapist-page">
      <h1>🩺 Available Therapists</h1>

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
              onClick={() => bookSession(therapist.id, therapist.name)}
            >
              {checkAvailability(therapist.slots) ? "Book Session" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Therapists;