const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// =============================================
// COMPLETE REGISTRATION (multi-step with profile)
// =============================================
router.post('/register-complete', async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    location,
    occupation,
    education,
    priorSupport,
    therapyHistory,
    challenges = [],
    stressLevel = 5,
    goals,
    preferences = [],
    emergencyName,
    emergencyPhone
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    db.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ message: err.message });

        if (results.length > 0) {
          return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userSql = `
          INSERT INTO users
          (name, email, password, age, gender, location)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          userSql,
          [name, email, hashedPassword, age || null, gender || null, location || null],
          (err, userResult) => {
            if (err) return res.status(500).json({ message: err.message });

            const userId = userResult.insertId;

            // INSERT PROFILE — wait for callback before responding
            const profileSql = `
              INSERT INTO user_profiles
              (user_id, occupation, education, prior_support, therapy_history, stress_level, goals, emergency_name, emergency_phone)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(profileSql, [
              userId,
              occupation || null,
              education || null,
              priorSupport || null,
              therapyHistory || null,
              parseInt(stressLevel),
              goals || null,
              emergencyName || null,
              emergencyPhone || null
            ], (profileErr) => {
              if (profileErr) {
                console.error('Profile insert error:', profileErr);
                // Still continue — profile is optional
              }

              // INSERT CHALLENGES (fire & forget is fine here)
              if (challenges.length > 0) {
                const challengeValues = challenges.map(c => [userId, c]);
                db.query(
                  'INSERT INTO user_challenges (user_id, challenge) VALUES ?',
                  [challengeValues],
                  (e) => { if (e) console.error('Challenges insert error:', e); }
                );
              }

              // INSERT PREFERENCES (fire & forget is fine here)
              if (preferences.length > 0) {
                const prefValues = preferences.map(p => [userId, p]);
                db.query(
                  'INSERT INTO user_preferences (user_id, preference) VALUES ?',
                  [prefValues],
                  (e) => { if (e) console.error('Preferences insert error:', e); }
                );
              }

              // JWT TOKEN
              const token = jwt.sign(
                { id: userId, email },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '7d' }
              );

              return res.status(201).json({
                message: 'Registration completed successfully',
                token,
                user: {
                  id: userId,
                  name,
                  email
                }
              });
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// =============================================
// SIMPLE REGISTER
// =============================================
router.post('/register', async (req, res) => {
  const { name, email, password, age, gender, location } = req.body;

  try {
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = 'INSERT INTO users (name, email, password, age, gender, location) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sql, [name, email, hashedPassword, age, gender, location], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// LOGIN  — FIX: use user_id (not id)
// =============================================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // FIX: primary key column is user_id, not id
    db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      }
    });
  });
});

// =============================================
// GET PROFILE — FIX: use user_id column
// =============================================
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      u.*,
      up.occupation,
      up.education,
      up.prior_support,
      up.therapy_history,
      up.stress_level,
      up.goals,
      up.emergency_name,
      up.emergency_phone
    FROM users u
    LEFT JOIN user_profiles up ON u.user_id = up.user_id
    WHERE u.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    db.query('SELECT challenge FROM user_challenges WHERE user_id = ?', [userId], (err, challenges) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.query('SELECT preference FROM user_preferences WHERE user_id = ?', [userId], (err, preferences) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          ...user,
          challenges: challenges.map(c => c.challenge),
          preferences: preferences.map(p => p.preference)
        });
      });
    });
  });
});

module.exports = router;
