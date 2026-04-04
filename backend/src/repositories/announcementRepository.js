'use strict';

const db = require('../db');

exports.findActive = async () => {
  const { rows } = await db.query(
    `SELECT announcement_id, title, content, is_urgent, start_at, end_at, created_at
     FROM announcements
     WHERE start_at <= CURRENT_TIMESTAMP
       AND (end_at IS NULL OR end_at >= CURRENT_TIMESTAMP)
     ORDER BY is_urgent DESC, created_at DESC`
  );
  return rows;
};