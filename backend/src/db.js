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

    // 🐟 [가중치 마이그레이션] 1번 밸런스형 황금 비율 가중치 자동 갱신 (일반 20, 희귀 9, 전설 4)
    try {
      await client.query("UPDATE amulets SET weight = 20, draft_weight = 20 WHERE grade = 'common'");
      await client.query("UPDATE amulets SET weight = 9, draft_weight = 9 WHERE grade = 'rare'");
      await client.query("UPDATE amulets SET weight = 4, draft_weight = 4 WHERE grade = 'legend'");
      console.log('Amulet weights synced to 1st Balance Option (Common:20, Rare:9, Legend:4)');
    } catch (e) {
      console.error('Amulet weights sync failed:', e.message);
    }
    
    // 다중 인스턴스 배포 시 테이블 락 충돌 방지를 위해, 개발 환경이거나 AUTO_MIGRATE=true 일 때만 마이그레이션을 구동함
    const shouldMigrate = process.env.AUTO_MIGRATE === 'true' || process.env.NODE_ENV !== 'production';
    
    if (shouldMigrate) {
      try {
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 1');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS current_attendance_streak INTEGER NOT NULL DEFAULT 0');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');
        
        await client.query(`CREATE TABLE IF NOT EXISTS user_challenges (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          challenge_key VARCHAR(50) NOT NULL,
          reward_credits INTEGER NOT NULL,
          rewarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id, challenge_key)
        )`);
        
        // 접속 로그 테이블 생성
        await client.query(`CREATE TABLE IF NOT EXISTS user_access_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          action VARCHAR(50) NOT NULL,
          duration_seconds INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        
        // 시스템 오류 및 활동 로그 테이블 생성
        await client.query(`CREATE TABLE IF NOT EXISTS system_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          level VARCHAR(10) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        
        console.log('DB schema checked & migrated successfully');
      } catch (err) {
        console.error('DB schema update failed:', err.message);
      }
    } else {
      console.log('DB schema check skipped (Production mode without AUTO_MIGRATE)');
    }
  })
  .catch((err) => console.error('DB connection failed', err));

module.exports = client;
