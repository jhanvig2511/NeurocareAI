import "../styles/chat.css";
import { sendMessageToBot } from "../api/chatApi";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Chat() {
  const navigate = useNavigate();

  const sessionId = "neurocare-session-001";

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("neurocare_chat");

    return saved
      ? JSON.parse(saved)
      : [
          {
            sender: "bot",
            text: "Hello 🌱 I'm here to listen. How are you feeling today?",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);

  /* SAVE CHAT */
  useEffect(() => {
    localStorage.setItem("neurocare_chat", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SEND MESSAGE */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage = {
      sender: "user",
      text: input,
      time,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput("");
    setIsTyping(true);

    try {
      const response = await sendMessageToBot(
        currentInput,
        sessionId
      );

      const botReply = {
        sender: "bot",
        text:
          response.bot ||
          response.response ||
          response.reply ||
          "I'm here with you.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("CHAT API ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ AI backend is not running on port 8000.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-page">

      {/* SIDEBAR */}
      <aside className="chat-sidebar">
        <h2>Chats</h2>

        <div className="chat-history-item active">
          Current Session
        </div>

        {/* THERAPIST BUTTON */}
        <button
          className="therapist-btn"
          onClick={() => navigate("/therapists")}
        >
          🩺 Talk to Therapist
        </button>
      </aside>

      {/* MAIN CHAT */}
      <main className="chat-main">

        {/* HEADER */}
        <header className="chat-header">
          <div>
            <h3>NeuroCare AI</h3>
            <span className="status">Online</span>
          </div>

          <button
            className="clear-chat"
            onClick={() => {
              localStorage.removeItem("neurocare_chat");

              setMessages([
                {
                  sender: "bot",
                  text:
                    "Hello 🌱 I'm here to listen. How are you feeling today?",
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ]);
            }}
          >
            Clear Chat
          </button>
        </header>

        {/* CHAT MESSAGES */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender}`}
            >
              <div className="message-text">
                {msg.text}
              </div>

              <div className="message-time">
                {msg.time}
              </div>
            </div>
          ))}

          {/* TYPING */}
          {isTyping && (
            <div className="message bot typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BOX */}
        <div className="chat-input">
          <input
            type="text"
            value={input}
            placeholder="Type your thoughts here..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
          />

          <button onClick={sendMessage}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

export default Chat;