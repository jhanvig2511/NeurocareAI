import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const BASE_URL = "https://neurocareai-xxrl.onrender.com";
const socket = io(BASE_URL);

function TherapistChat() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const doctor = JSON.parse(localStorage.getItem("doctor"));
  const user = JSON.parse(localStorage.getItem("user"));
  const sender = doctor ? "doctor" : "user";

  useEffect(() => {
    socket.emit("joinRoom", sessionId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    fetchMessages();

    return () => {
      socket.off("receiveMessage");
    };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/therapist/messages/${sessionId}`);
      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msgData = {
      roomId: sessionId,
      session_id: sessionId,
      sender: sender,
      message: input,
    };

    socket.emit("sendMessage", msgData);

    try {
      await axios.post(`${BASE_URL}/api/therapist/message`, {
        session_id: sessionId,
        sender: sender,
        message: input,
      });
    } catch (err) {
      console.log(err);
    }

    setInput("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>💬 Therapist Chat</h2>
      <p style={{ color: "gray" }}>Session: {sessionId}</p>

      <div style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "15px",
        background: "#f9f9f9",
        marginBottom: "15px"
      }}>
        {messages.map((msg, index) => (
          <div key={msg.id || index} style={{
            display: "flex",
            justifyContent: msg.sender === sender ? "flex-end" : "flex-start",
            marginBottom: "10px"
          }}>
            <div style={{
              background: msg.sender === sender ? "#4CAF50" : "#fff",
              color: msg.sender === sender ? "white" : "black",
              padding: "10px 15px",
              borderRadius: "15px",
              maxWidth: "70%",
              border: "1px solid #ddd"
            }}>
              <small style={{ opacity: 0.7 }}>{msg.sender === "doctor" ? "👩‍⚕️ Doctor" : "🧑 Patient"}</small>
              <p style={{ margin: "5px 0 0 0" }}>{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "16px"
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default TherapistChat;