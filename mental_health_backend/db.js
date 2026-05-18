const mysql = require("mysql2");
require("dotenv").config();

// ✅ FIX: mysql2 createPool with a connection string needs { uri: ... }
// Passing the string directly works in some versions but is unreliable.
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }

  console.log("✅ Connected to Railway MySQL");
  connection.release();
});

module.exports = pool;
