import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const BASE_URL = "https://neurocareai-xxrl.onrender.com";

function TherapistChat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const seenIds = useRef(new Set());

  const doctor = JSON.parse(localStorage.getItem("doctor") || "null");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const sender = doctor ? "doctor" : "user";
  const displayName = doctor
    ? `👩‍⚕️ Dr. ${doctor.name}`
    : `🧑 ${user?.name || user?.email || "Patient"}`;

  const addMessage = (msg) => {
    const key = msg.id
      ? `db-${msg.id}`
      : `live-${msg.sender}-${msg.message}-${msg.created_at || Date.now()}`;
    if (seenIds.current.has(key)) return;
    seenIds.current.add(key);
    setMessages((prev) => [...prev, msg]);
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/therapist/messages/${sessionId}`);
      if (Array.isArray(res.data)) {
        res.data.forEach((msg) => addMessage(msg));
      }
    } catch (err) {
      console.error("Fetch messages error:", err.message);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("joinRoom", String(sessionId));
    });

    socket.on("connect_error", () => setConnected(false));
    socket.on("disconnect", () => setConnected(false));

    socket.on("receiveMessage", (data) => {
      addMessage({
        sender: data.sender,
        message: data.message,
        created_at: new Date().toISOString(),
      });
    });

    fetchMessages();

    return () => {
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    addMessage({
      sender: sender,
      message: text,
      created_at: new Date().toISOString(),
    });

    if (socketRef.current?.connected) {
      socketRef.current.emit("sendMessage", {
        roomId: String(sessionId),
        session_id: sessionId,
        sender: sender,
        message: text,
      });
    }

    try {
      await axios.post(`${BASE_URL}/api/therapist/message`, {
        session_id: sessionId,
        sender: sender,
        message: text,
      });
    } catch (err) {
      console.error("Save message error:", err.message);
    }
  };

  return (
    <div style={{ maxWidth: "650px", margin: "30px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div>
          <h2 style={{ margin: 0 }}>💬 Therapist Chat</h2>
          <p style={{ color: "gray", margin: "4px 0 0", fontSize: "13px" }}>
            Session #{sessionId} &nbsp;|&nbsp; You: <strong>{displayName}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            background: connected ? "#4CAF50" : "#f44336",
            color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
          }}>
            {connected ? "🟢 Connected" : "🔴 Reconnecting..."}
          </span>
          <button onClick={() => navigate(-1)}
            style={{ background: "#eee", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer" }}>
            ← Back
          </button>
        </div>
      </div>

      <div style={{
        height: "450px", overflowY: "auto", border: "1px solid #ddd",
        borderRadius: "12px", padding: "16px", background: "#f9f9f9",
        marginBottom: "14px", display: "flex", flexDirection: "column", gap: "10px",
      }}>
        {messages.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center", margin: "auto" }}>
            No messages yet. Say hello! 👋
          </p>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.sender === sender;
          return (
            <div key={index} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                background: isMe ? "#4CAF50" : "#fff",
                color: isMe ? "white" : "#222",
                padding: "10px 15px",
                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                maxWidth: "72%",
                border: isMe ? "none" : "1px solid #ddd",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}>
                <small style={{ opacity: 0.6, fontSize: "11px", display: "block", marginBottom: "4px" }}>
                  {msg.sender === "doctor" ? "👩‍⚕️ Doctor" : "🧑 Patient"}
                </small>
                <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.4" }}>{msg.message}</p>
                {msg.created_at && (
                  <small style={{ opacity: 0.45, fontSize: "10px", display: "block", marginTop: "5px", textAlign: "right" }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </small>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: "13px 16px", borderRadius: "10px",
            border: "1px solid #ccc", fontSize: "15px", outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            background: input.trim() ? "#4CAF50" : "#ccc",
            color: "white", border: "none", padding: "13px 22px",
            borderRadius: "10px", cursor: input.trim() ? "pointer" : "default",
            fontSize: "15px", fontWeight: "bold",
          }}
        >
          Send ➤
        </button>
      </div>
    </div>
  );
}

export default TherapistChat;