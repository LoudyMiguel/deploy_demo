require('dotenv').config();

const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'global_chat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT messages.id, messages.body, messages.created_at,
              users.display_name
       FROM messages JOIN users ON users.id = messages.user_id
       ORDER BY messages.created_at DESC LIMIT 100`
    );
    res.json(rows.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not load messages. Check your database.' });
  }
});

app.post('/api/users', async (req, res) => {
  const displayName = cleanText(req.body.displayName, 40);
  if (!displayName) return res.status(400).json({ error: 'Display name is required.' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (display_name) VALUES (?)',
      [displayName]
    );
    res.status(201).json({ id: result.insertId, displayName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create the demo account.' });
  }
});

app.post('/api/messages', async (req, res) => {
  const userId = Number(req.body.userId);
  const body = cleanText(req.body.body, 500);
  if (!Number.isInteger(userId) || userId < 1 || !body) {
    return res.status(400).json({ error: 'A user and message are required.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO messages (user_id, body) VALUES (?, ?)',
      [userId, body]
    );
    const [rows] = await pool.execute(
      `SELECT messages.id, messages.body, messages.created_at, users.display_name
       FROM messages JOIN users ON users.id = messages.user_id
       WHERE messages.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not send the message.' });
  }
});

app.listen(port, () => console.log(`Global chat running on port ${port}`));
