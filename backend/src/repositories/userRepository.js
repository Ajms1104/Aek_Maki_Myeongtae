'use strict';

const db = require('../db');

// toss_user_key로 upsert
exports.upsertByTossUserKey = async (tossUserKey) => {
  const { rows } = await db.query(
    `INSERT INTO users (toss_user_key, credits)
     VALUES ($1, 0)
     ON CONFLICT (toss_user_key)
     DO UPDATE SET last_seen_at = NOW()
     RETURNING id, toss_user_key, credits, created_at, last_seen_at`,
    [tossUserKey]
  );
  return rows[0];
};


// userId로 조회
exports.findById = async (userId) => {
  const { rows } = await db.query(
    'SELECT id, toss_user_key, credits, has_hidden_pass, last_attendance_at, last_ad_watched_at, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
};

// 출석 시간 업데이트
exports.updateAttendance = async (userId) => {
  await db.query(
    'UPDATE users SET last_attendance_at = NOW() WHERE id = $1',
    [userId]
  );
};

// 광고 시청 시간 업데이트
exports.updateAdWatchTime = async (userId) => {
  await db.query(
    'UPDATE users SET last_ad_watched_at = NOW() WHERE id = $1',
    [userId]
  );
};

// 히든 패스 해금
exports.unlockHiddenPass = async (userId) => {
  const { rows } = await db.query(
    `UPDATE users 
     SET has_hidden_pass = TRUE 
     WHERE id = $1
     RETURNING has_hidden_pass`,
    [userId]
  );
  return rows[0] ? rows[0].has_hidden_pass : false;
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

// 크레딧 직접 설정 (관리자용)
exports.updateCredit = async (userId, amount) => {
  const { rows } = await db.query(
    `UPDATE users 
     SET credits = $1 
     WHERE id = $2
     RETURNING credits`,
    [amount, userId]
  );
  return rows[0] ? rows[0].credits : null;
};

// 크레딧 차감
exports.deductCredit = async (userId, amount = 1) => {
  const { rows } = await db.query(
    `UPDATE users 
     SET credits = credits - $1 
     WHERE id = $2 AND credits >= $1
     RETURNING credits`,
    [amount, userId]
  );
  return rows[0] ? rows[0].credits : null;
};

// 크레딧 추가 (광고 보상 등)
exports.addCredit = async (userId, amount = 1) => {
  const { rows } = await db.query(
    `UPDATE users 
     SET credits = credits + $1 
     WHERE id = $2
     RETURNING credits`,
    [amount, userId]
  );
  return rows[0] ? rows[0].credits : null;
};

