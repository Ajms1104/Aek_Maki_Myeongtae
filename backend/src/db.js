require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect()
  .then(async () => {
    console.log('DB connected');
    try {
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 1');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS current_attendance_streak INTEGER NOT NULL DEFAULT 0');
      await client.query(`CREATE TABLE IF NOT EXISTS user_challenges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        challenge_key VARCHAR(50) NOT NULL,
        reward_credits INTEGER NOT NULL,
        rewarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, challenge_key)
      )`);
      console.log('DB schema checked');
    } catch (err) {
      console.error('DB schema update failed:', err.message);
    }
  })
  .catch((err) => console.error('DB connection failed', err));

module.exports = client;
