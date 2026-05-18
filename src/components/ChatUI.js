import React, { useState } from "react";
import "./ChatUI.css";

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 🔴 THIS IS WHERE fetch() GOES
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session_id: "user_1",
          message: userMessage.text
        })
      });

      const data = await response.json();

      // Add bot message to UI
      const botMessage = { sender: "bot", text: data.bot };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Fetch error:", error);
      alert("Backend not running or CORS error");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Mental Health Assistant</div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatUI;
