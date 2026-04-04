'use strict';

const db = require('../db');

// 문의 등록
exports.create = async ({ userId, title, content, replyEmail }) => {
  const { rows } = await db.query(
    `INSERT INTO support (user_id, title, content, reply_email)
     VALUES ($1, $2, $3, $4)
     RETURNING id AS "ticketId"`,
    [userId, title, content, replyEmail]
  );
  return rows[0];
};

// 내 문의 목록 조회 (cursor 기반)
exports.findByUser = async ({ userId, cursor, limit }) => {
  let query, values;
  if (!cursor) {
    query = `SELECT id AS "ticketId", title, status, created_at AS "createdAt", updated_at AS "updatedAt"
             FROM support WHERE user_id = $1
             ORDER BY id DESC LIMIT $2`;
    values = [userId, limit];
  } else {
    query = `SELECT id AS "ticketId", title, status, created_at AS "createdAt", updated_at AS "updatedAt"
             FROM support WHERE user_id = $1 AND id < $2
             ORDER BY id DESC LIMIT $3`;
    values = [userId, cursor, limit];
  }
  const { rows } = await db.query(query, values);
  return rows;
};

// 관리자 - 전체 문의 목록 조회
exports.findAll = async ({ status, cursor, limit }) => {
  const lastId = cursor ? parseInt(cursor) : 99999999;
  const { rows } = await db.query(
    `SELECT id AS "ticketId", user_id AS "userId", title, status,
            created_at AS "createdAt"
     FROM support
     WHERE ($1 = 'ALL' OR status = $1) AND id < $2
     ORDER BY id DESC LIMIT $3`,
    [status, lastId, limit]
  );
  return rows;
};

// 관리자 - 문의 상태 변경/답변 등록
exports.update = async ({ ticketId, status, replyContent }) => {
  let finalStatus = status;
  if (replyContent && !status) finalStatus = 'Done';

  const { rows } = await db.query(
    `UPDATE support
     SET status = COALESCE($1, status),
         reply_content = COALESCE($2, reply_content),
         updated_at = NOW()
     WHERE id = $3
     RETURNING id AS "ticketId", status, reply_content AS "replyContent", updated_at AS "updatedAt"`,
    [finalStatus, replyContent, ticketId]
  );
  return rows[0] || null;
};