import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // 🔹 SEND MESSAGE FUNCTION
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session_id: "user_1",
          message: userMsg.text
        })
      });

      const data = await response.json();

      const botMsg = {
        sender: "bot",
        text: data.bot,
        emotion: data.emotion,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMsg]);
        setTyping(false);
      }, 800);

    } catch (err) {
      setTyping(false);
      alert("❌ Backend not reachable");
    }
  };

  return (
  <div className="chat-container">
    
    {/* HEADER */}
    <div className="chat-header">
      <div className="header-title">Mental Health Assistant</div>
      <div className="header-status">Online • Listening</div>
    </div>

    {/* MESSAGES */}
    <div className="chat-messages">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.sender}`}>
          <div className="message-text">{msg.text}</div>
          <div className="timestamp">{msg.time}</div>
        </div>
      ))}

      {typing && (
        <div className="message bot typing">
          Typing<span className="dots">...</span>
        </div>
      )}
    </div>

    {/* INPUT */}
    <div className="chat-input">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type how you're feeling..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>

  </div>
);

}

export default ChatWindow;
