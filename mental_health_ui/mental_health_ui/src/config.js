// ✅ Central config — reads from Vercel environment variables
// Set these in Vercel → Project Settings → Environment Variables:
//   REACT_APP_BACKEND_URL = https://your-backend.onrender.com
//   REACT_APP_AI_URL      = (only if Python AI is deployed publicly)
const CONFIG = {
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || "https://neurocare-backend-3k89.onrender.com",
  // ✅ FIX: Don't default to localhost — that breaks in production!
  // Leave null so chatApi.js falls back to the Node backend chat route.
  AI_URL: process.env.REACT_APP_AI_URL || null,
};

export default CONFIG;
