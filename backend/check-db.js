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
    const { rows } = await pool.query('SELECT id, toss_user_key, is_deleted, created_at FROM users ORDER BY id ASC');
    console.log('--- ALL USERS IN DB ---');
    console.table(rows);
    
    const { rows: countStats } = await pool.query('SELECT COUNT(*) FROM users');
    const { rows: countActive } = await pool.query('SELECT COUNT(*) FROM users WHERE is_deleted = FALSE');
    console.log(`Total users in DB: ${countStats[0].count}`);
    console.log(`Active users in DB (is_deleted=FALSE): ${countActive[0].count}`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
