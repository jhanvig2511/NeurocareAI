import React from "react";

function MessageBubble({ sender, text }) {
  return (
    <div className={`bubble ${sender}`}>
      {text}
    </div>
  );
}

export default MessageBubble;
