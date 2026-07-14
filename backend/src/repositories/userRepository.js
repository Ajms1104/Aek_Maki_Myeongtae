'use strict';

const db = require('../db');

exports.upsertByTossUserKey = async (tossUserKey) => {
  const { rows } = await db.query(
    `INSERT INTO users (toss_user_key, credits)
     VALUES ($1, 1)
     ON CONFLICT (toss_user_key)
     DO UPDATE SET last_seen_at = NOW()
     RETURNING id, toss_user_key, credits, created_at, last_seen_at`,
    [tossUserKey]
  );
  return rows[0];
};

exports.findById = async (userId) => {
  const { rows } = await db.query(
    'SELECT id, toss_user_key, credits, has_hidden_pass, last_attendance_at, last_ad_watched_at, current_attendance_streak, created_at, is_deleted FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
};

exports.updateAttendance = async (userId, attendanceStreak = 1) => {
  await db.query(
    'UPDATE users SET last_attendance_at = NOW(), current_attendance_streak = $2 WHERE id = $1',
    [userId, attendanceStreak]
  );
};

exports.updateAdWatchTime = async (userId) => {
  await db.query(
    'UPDATE users SET last_ad_watched_at = NOW() WHERE id = $1',
    [userId]
  );
};

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

exports.findByTossUserKey = async (tossUserKey) => {
  const { rows } = await db.query(
    'SELECT id FROM users WHERE toss_user_key = $1 AND is_deleted = FALSE',
    [tossUserKey]
  );
  return rows[0] || null;
};

exports.deleteAllData = async (userId) => {
  await db.query('DELETE FROM consultations WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM user_amulets WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM support WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM amulet_downloads WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM user_challenges WHERE user_id = $1', [userId]);

  await db.query(
    `UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1`,
    [userId]
  );
};

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

exports.unlockHiddenPassWithCredits = async (userId, bonusCredits = 5) => {
  const { rows } = await db.query(
    `UPDATE users
     SET has_hidden_pass = TRUE,
         credits = credits + $1
     WHERE id = $2
     RETURNING has_hidden_pass, credits`,
    [bonusCredits, userId]
  );
  return rows[0] || null;
};
