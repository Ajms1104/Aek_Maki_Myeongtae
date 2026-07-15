require('dotenv').config();
const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');

const dbStorage = new AsyncLocalStorage();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  max: 20, // 최대 풀 크기
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 트랜잭션 안전 래퍼
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// 최초 초기화 및 스키마 검증
pool.connect()
  .then(async (client) => {
    console.log('DB Pool connected successfully');

    try {
      // 🐟 [가중치 마이그레이션] 전설 5% / 희귀 30% / 일반 65% 최적 가중치 자동 갱신 (일반 21, 희귀 8, 전설 3)
      await client.query("UPDATE amulets SET weight = 21, draft_weight = 21 WHERE grade = 'common'");
      await client.query("UPDATE amulets SET weight = 8, draft_weight = 8 WHERE grade = 'rare'");
      await client.query("UPDATE amulets SET weight = 3, draft_weight = 3 WHERE grade = 'legend'");
      console.log('Amulet weights synced to Custom Option (Common:21, Rare:8, Legend:3)');
    } catch (e) {
      console.error('Amulet weights sync failed:', e.message);
    }
    
    const shouldMigrate = process.env.AUTO_MIGRATE === 'true' || process.env.NODE_ENV !== 'production';
    
    if (shouldMigrate) {
      try {
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 1');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS current_attendance_streak INTEGER NOT NULL DEFAULT 0');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS amulet_pity_count INTEGER NOT NULL DEFAULT 0');
        
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

        // 🔒 [포트폴리오 인프라 튜닝] referrer 물리 컬럼화 및 JSONB meta_data 추가
        await client.query('ALTER TABLE user_access_logs ADD COLUMN IF NOT EXISTS referrer VARCHAR(50) DEFAULT NULL');
        await client.query('ALTER TABLE user_access_logs ADD COLUMN IF NOT EXISTS meta_data JSONB DEFAULT \'{}\'::jsonb');

        // 복합 인덱스 순서 정정 (action, created_at) - 등치 조건 선행으로 Index Only Scan 유도
        await client.query('CREATE INDEX IF NOT EXISTS idx_user_access_logs_action_created ON user_access_logs(action, created_at)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_user_access_logs_referrer ON user_access_logs(referrer) WHERE referrer IS NOT NULL');
        
        // 시스템 오류 및 활동 로그 테이블 생성
        await client.query(`CREATE TABLE IF NOT EXISTS system_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          level VARCHAR(10) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);

        // 🔒 [APM 성능 모니터링 테이블 생성]
        await client.query(`CREATE TABLE IF NOT EXISTS system_performance_logs (
          id SERIAL PRIMARY KEY,
          method VARCHAR(10) NOT NULL,
          path VARCHAR(255) NOT NULL,
          status INTEGER NOT NULL,
          latency_ms DOUBLE PRECISION NOT NULL,
          query_count INTEGER DEFAULT 0,
          total_query_latency_ms DOUBLE PRECISION DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        await client.query('CREATE INDEX IF NOT EXISTS idx_sys_perf_created_path ON system_performance_logs(created_at, path)');
        
        console.log('DB schema checked & migrated successfully');
      } catch (err) {
        console.error('DB schema update failed:', err.message);
      }
    }
    client.release();
  })
  .catch((err) => console.error('DB connection failed', err));

module.exports = {
  query: async (text, params) => {
    const start = process.hrtime();
    try {
      const res = await pool.query(text, params);
      const diff = process.hrtime(start);
      const latencyMs = (diff[0] * 1e9 + diff[1]) / 1e6;

      const store = dbStorage.getStore();
      if (store) {
        store.count += 1;
        store.totalLatency += latencyMs;
      }
      return res;
    } catch (err) {
      throw err;
    }
  },
  pool,
  transaction,
  dbStorage,
};
