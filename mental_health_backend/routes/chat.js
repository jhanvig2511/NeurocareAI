const express = require('express');
const axios = require('axios');
const db = require('../db');

const router = express.Router();

// Chat endpoint
router.post("/", async (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message)
    return res.status(400).json({ message: "Missing user_id or message" });

  try {
    // Send message to AI model API (for now, simulated response)
    const aiResponse = await getAIResponse(message);

    // Store in DB (optional)
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

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Chat error" });
  }
});

// Get chat history
router.get("/history/:userId", (req, res) => {
  const { userId } = req.params;

  try {
    const sql = `
      SELECT * FROM chat_history
      WHERE user_id = ?
      ORDER BY created_at ASC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getAIResponse(userMessage) {
  // TEMP SIMULATION — later we'll integrate Python AI model
  if (userMessage.toLowerCase().includes("sad"))
    return "I'm sorry you're feeling down. Try some deep breathing exercises.";
  if (userMessage.toLowerCase().includes("happy"))
    return "That's great! Keep up the positive energy.";
  if (userMessage.toLowerCase().includes("stress"))
    return "Stress can be overwhelming. Would you like to try a 5-minute meditation?";
  if (userMessage.toLowerCase().includes("anxious") || userMessage.toLowerCase().includes("anxiety"))
    return "Anxiety is challenging. Let's focus on grounding techniques. Can you name 5 things you can see right now?";
  
  return "I understand. Would you like me to suggest some self-care tips?";
}

module.exports = router;