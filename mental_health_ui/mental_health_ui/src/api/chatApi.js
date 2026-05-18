import axios from "axios";

// ✅ FIX: In production, AI (Python FastAPI) is not publicly accessible.
// Route chat through the Node.js backend which has a built-in fallback response.
// If you deploy the Python AI separately, set REACT_APP_AI_URL in Vercel.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://neurocare-backend-3k89.onrender.com";
const AI_URL = process.env.REACT_APP_AI_URL || null;

export const sendMessageToBot = async (message, sessionId) => {
  // If a public AI URL is configured, use it directly
  if (AI_URL) {
    const response = await axios.post(`${AI_URL}/chat`, {
      session_id: sessionId,
      message: message,
    });
    return response.data;
  }

  // Otherwise, use the Node.js backend chat route (has built-in keyword responses)
  const response = await axios.post(`${BACKEND_URL}/api/chat`, {
    user_id: JSON.parse(localStorage.getItem("user") || "{}").id || "guest",
    message: message,
  });
  return response.data;
};
