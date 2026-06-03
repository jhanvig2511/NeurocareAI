const express = require('express');
const axios = require('axios');
const db = require('../db');

const router = express.Router();

const AI_URL = process.env.AI_URL || "http://localhost:8000";

// Chat endpoint
router.post("/", async (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message)
    return res.status(400).json({ message: "Missing user_id or message" });

  try {
    // Call the Python AI model
    const aiRes = await axios.post(`${AI_URL}/chat`, {
      session_id: String(user_id),
      message: message,
    });

    const { bot: aiResponse, emotion } = aiRes.data;

    const sql =
      "INSERT INTO chat_history (user_id, session_id, message, sender, created_at) VALUES (?, ?, ?, ?, NOW())";

    // Store user message
    db.query(sql, [user_id, 'default-session', message, 'user'], (err) => {
      if (err) console.error("DB insert error:", err);
    });

    // Store bot response
    db.query(sql, [user_id, 'default-session', aiResponse, 'bot'], (err) => {
      if (err) console.error("DB insert error:", err);
    });

    res.json({ reply: aiResponse, emotion });

  } catch (error) {
    console.error("AI service error:", error.message);
    res.json({
      reply: "I'm here for you 💙 It seems I'm having a little trouble right now. Please try again in a moment.",
      emotion: "neutral"
    });
  }
});

// Get chat history
router.get("/history/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT * FROM chat_history
    WHERE user_id = ?
    ORDER BY created_at ASC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;