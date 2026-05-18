const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query('SELECT * FROM admin_users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const admin = results[0];

      // For development, accept plain password "admin123"
      const isMatch = password === 'admin123' || await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      res.json({
        success: true,
        token: 'admin-token-' + Date.now(),
        message: 'Login successful'
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/stats', (req, res) => {
  console.log('Stats endpoint called'); // Debug log
  
  try {
    // Get total users
    db.query("SELECT COUNT(*) as total FROM users", (err, userCount) => {
      if (err) {
        console.error('Users count error:', err);
        return res.status(500).json({ error: err.message });
      }

      // Get total questionnaire responses
      db.query(
        "SELECT COUNT(*) as total FROM questionnaire_responses",
        (err, responseCount) => {
          if (err) {
            console.error('Responses count error:', err);
            // Return zeros if table doesn't exist yet
            responseCount = [{ total: 0 }];
          }

          // Get active chats (last 24 hours)
          db.query(
            `SELECT COUNT(DISTINCT user_id) as total 
             FROM chat_history 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
            (err, activeChats) => {
              if (err) {
                console.error('Active chats error:', err);
                // Return zeros if table doesn't exist yet
                activeChats = [{ total: 0 }];
              }

              const stats = {
                totalUsers: userCount[0].total,
                completedQuestionnaires: responseCount[0]?.total || 0,
                activeChats: activeChats[0]?.total || 0,
                pendingReviews: 0
              };

              console.log('Returning stats:', stats); // Debug log
              res.json(stats);
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', (req, res) => {
  console.log('Users endpoint called'); // Debug log
  
  try {
    const sql = `
      SELECT id, name, email, created_at, 
             IF(last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY), true, false) as active
      FROM users
      ORDER BY created_at DESC
    `;

    db.query(sql, (err, users) => {
      if (err) {
        console.error('Users fetch error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('Returning users:', users.length); // Debug log
      res.json(users);
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all questionnaire responses
router.get('/responses', (req, res) => {
  console.log('Responses endpoint called'); // Debug log
  
  try {
    const sql = `
      SELECT 
        qr.id,
        u.name as userName,
        qr.submitted_at as submittedAt,
        qr.total_score as score,
        qr.risk_level as riskLevel
      FROM questionnaire_responses qr
      JOIN users u ON qr.user_id = u.id
      ORDER BY qr.submitted_at DESC
    `;

    db.query(sql, (err, responses) => {
      if (err) {
        console.error('Responses fetch error:', err);
        // Return empty array if table doesn't exist
        return res.json([]);
      }
      
      console.log('Returning responses:', responses.length); // Debug log
      res.json(responses);
    });
  } catch (error) {
    console.error('Responses error:', error);
    res.json([]);
  }
});

// Get chat sessions
router.get('/chat-sessions', (req, res) => {
  console.log('Chat sessions endpoint called'); // Debug log
  
  try {
    const sql = `
      SELECT 
        ch.session_id,
        u.name as userName,
        u.email as userEmail,
        COUNT(*) as messageCount,
        MAX(ch.created_at) as lastMessage,
        MIN(ch.created_at) as firstMessage
      FROM chat_history ch
      JOIN users u ON ch.user_id = u.id
      GROUP BY ch.session_id, u.name, u.email
      ORDER BY lastMessage DESC
    `;

    db.query(sql, (err, sessions) => {
      if (err) {
        console.error('Chat sessions error:', err);
        return res.json([]);
      }
      
      console.log('Returning sessions:', sessions.length); // Debug log
      res.json(sessions);
    });
  } catch (error) {
    console.error('Sessions error:', error);
    res.json([]);
  }
});

module.exports = router;