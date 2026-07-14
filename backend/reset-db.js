const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

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
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // 🔒 [안전장치] 한글 인코딩 깨짐 주석 및 다중 행 주석 일괄 청소
    sql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // 세미콜론(;) 단위로 분할하여 개별 쿼리 순차 실행
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
      } catch (err) {
        console.error(`[SQL Error at statement ${i + 1}]:`, stmt);
        throw err;
      }
    }

    console.log('DB Reset completed successfully!');
  } catch (err) {
    console.error('DB Reset failed:', err);
  } finally {
    await client.end();
  }
}

reset();
