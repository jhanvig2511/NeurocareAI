const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   GET ALL THERAPISTS
========================= */
router.get("/", (req, res) => {
  db.query("SELECT * FROM therapists", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

/* =========================
   DOCTOR LOGIN
========================= */
router.post("/doctor-login", async (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM therapists WHERE email=? AND password=?`;
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    if (result.length > 0) {
      res.json({ success: true, doctor: result[0] });
    } else {
      res.json({ success: false, message: "Invalid email or password" });
    }
  });
});

/* =========================
   BOOK SESSION
========================= */
router.post("/book", (req, res) => {
  const { user_id, therapist_id } = req.body;
  const sql = `
    INSERT INTO therapist_sessions (user_id, therapist_id, status)
    VALUES (?, ?, 'pending')
  `;
  db.query(sql, [user_id, therapist_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ success: true, sessionId: result.insertId });
  });
});

/* =========================
   PENDING SESSIONS FOR DOCTOR  ← YEH NAYA HAI
========================= */
router.get("/pending/:therapistId", (req, res) => {
  const sql = `
    SELECT 
      ts.id,
      ts.user_id,
      ts.therapist_id,
      ts.status,
      u.name AS user_name,
      u.email AS user_email
    FROM therapist_sessions ts
    LEFT JOIN users u ON ts.user_id = u.id
    WHERE ts.therapist_id = ? AND ts.status = 'pending'
    ORDER BY ts.id DESC
  `;
  db.query(sql, [req.params.therapistId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

/* =========================
   ACCEPT SESSION
========================= */
router.put("/accept/:id", (req, res) => {
  const sql = `UPDATE therapist_sessions SET status='accepted' WHERE id=?`;
  db.query(sql, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ success: true });
  });
});

/* =========================
   SEND MESSAGE
========================= */
router.post("/message", (req, res) => {
  const { session_id, sender, message } = req.body;
  const sql = `
    INSERT INTO therapist_messages (session_id, sender, message)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [session_id, sender, message], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ success: true });
  });
});

/* =========================
   GET CHAT MESSAGES
========================= */
router.get("/messages/:sessionId", (req, res) => {
  const sql = `
    SELECT * FROM therapist_messages
    WHERE session_id = ?
    ORDER BY created_at ASC
  `;
  db.query(sql, [req.params.sessionId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

module.exports = router;