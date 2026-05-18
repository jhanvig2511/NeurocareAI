import axios from "axios";

const API_URL = "http://127.0.0.1:8000/chat";

export const sendMessageToBot = async (message, sessionId) => {
  const response = await axios.post(API_URL, {
    session_id: sessionId,
    message: message,
  });

  return response.data;
};