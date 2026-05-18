import { useState } from "react";

export default function ChatLayout() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello, I’m here to listen 💚" }
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input) return;
    setMessages([
      ...messages,
      { role: "user", text: input },
      { role: "assistant", text: "Thank you for sharing. Tell me more." }
    ]);
    setInput("");
  };

  return (
    <div className="chatgpt">
      <aside className="history">Chat History</aside>

      <main className="chat-area">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={m.role}>{m.text}</div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={send}>Send</button>
        </div>
      </main>
    </div>
  );
}