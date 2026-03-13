'use strict';

const db = require('../db');

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

exports.findById = async (userId) => {
  const { rows } = await db.query(
    'SELECT id, toss_user_key, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
};