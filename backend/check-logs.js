const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

async function run() {
  try {
    console.log('--- SYSTEM ERROR LOGS (LAST 20) ---');
    const { rows } = await pool.query(
      `SELECT id, level, message, data, created_at 
       FROM system_logs 
       ORDER BY created_at DESC 
       LIMIT 20`
    );
    console.table(rows.map(r => ({
      id: r.id,
      level: r.level,
      message: r.message,
      data: JSON.stringify(r.data),
      createdAt: r.created_at
    })));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
