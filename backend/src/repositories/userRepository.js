'use strict';

const db = require('../db');

// toss_user_key로 upsert
exports.upsertByTossUserKey = async (tossUserKey) => {
  const { rows } = await db.query(
    `INSERT INTO users (toss_user_key)
     VALUES ($1)
     ON CONFLICT (toss_user_key)
     DO UPDATE SET last_seen_at = NOW()
     RETURNING id, toss_user_key, created_at, last_seen_at`,
    [tossUserKey]
  );
  return rows[0];
};

// userId로 조회
exports.findById = async (userId) => {
  const { rows } = await db.query(
    'SELECT id, toss_user_key, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
};

// toss_user_key로 유저 조회 (UNLINK 콜백용)
exports.findByTossUserKey = async (tossUserKey) => {
  const { rows } = await db.query(
    'SELECT id FROM users WHERE toss_user_key = $1 AND is_deleted = FALSE',
    [tossUserKey]
  );
  return rows[0] || null;
};

// 유저 데이터 전체 삭제
exports.deleteAllData = async (userId) => {
  await db.query('DELETE FROM consultations WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM user_amulets WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM support WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM amulet_downloads WHERE user_id = $1', [userId]);

  await db.query(
    `UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1`,
    [userId]
  );
};