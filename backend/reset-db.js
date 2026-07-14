const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is missing in .env');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

async function reset() {
  try {
    await client.connect();
    console.log('DB Connected for reset...');

    // 1. 기존 테이블 강제 드랍
    console.log('Dropping tables...');
    await client.query(`
      DROP TABLE IF EXISTS user_access_logs CASCADE;
      DROP TABLE IF EXISTS user_challenges CASCADE;
      DROP TABLE IF EXISTS user_amulets CASCADE;
      DROP TABLE IF EXISTS amulet_downloads CASCADE;
      DROP TABLE IF EXISTS consultations CASCADE;
      DROP TABLE IF EXISTS consultation_amulets CASCADE;
      DROP TABLE IF EXISTS probability_configs CASCADE;
      DROP TABLE IF EXISTS amulet_probability_schedules CASCADE;
      DROP TABLE IF EXISTS amulets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // 2. init.sql 로드 및 실행
    console.log('Executing init.sql...');
    const sqlPath = path.join(__dirname, 'src', 'sql', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);

    console.log('DB Reset completed successfully!');
  } catch (err) {
    console.error('DB Reset failed:', err);
  } finally {
    await client.end();
  }
}

reset();
