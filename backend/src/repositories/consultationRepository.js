'use strict';

const db = require('../db');

// 상담 생성
exports.create = async ({ userId, category, content, preview }) => {
  const { rows } = await db.query(
    `INSERT INTO consultations (user_id, category, content, preview)
     VALUES ($1, $2, $3, $4)
     RETURNING id, status, created_at, delete_at`,
    [userId, category || null, content, preview]
  );
  return rows[0];
};

// 본인 고민 단건 조회
exports.findOneByUser = async (userId, consultationId) => {
  const { rows } = await db.query(
    `SELECT c.id, c.status, c.reply, c.reaction,
            c.created_at, c.delete_at, c.category, c.preview,
            COALESCE(
              json_agg(
                json_build_object(
                  'amuletId', a.id,
                  'name', a.name,
                  'grade', a.grade,
                  'imageUrl', a.image_url
                )
              ) FILTER (WHERE a.id IS NOT NULL),
              '[]'
            ) AS amulets
     FROM consultations c
     LEFT JOIN consultation_amulets ca ON ca.consultation_id = c.id
     LEFT JOIN amulets a ON a.id = ca.amulet_id
     WHERE c.id = $1 AND c.user_id = $2
     GROUP BY c.id`,
    [consultationId, userId]
  );
  return rows[0] || null;
};

// 목록 조회 
exports.findByUser = async (userId, { cursor, limit = 20 }) => {
  const params = [userId, limit + 1];
  let cursorClause = '';

  if (cursor) {
    cursorClause = 'AND c.id < $3';
    params.push(cursor);
  }

  const { rows } = await db.query(
    `SELECT id, category, status, reaction, created_at, delete_at, preview
     FROM consultations c
     WHERE user_id = $1
       AND delete_at > NOW()
       ${cursorClause}
     ORDER BY id DESC
     LIMIT $2`,
    params
  );

  const hasNext = rows.length > limit;
  const items = hasNext ? rows.slice(0, limit) : rows;
  const nextCursor = hasNext ? String(items[items.length - 1].id) : null;

  return { items, nextCursor };
};

// 상태/답변 업데이트
exports.updateStatus = async (consultationId, { status, reply }) => {
  await db.query(
    `UPDATE consultations SET status = $1, reply = $2 WHERE id = $3`,
    [status, reply || null, consultationId]
  );
};

// 반응 업데이트
exports.updateReaction = async (userId, consultationId, reaction) => {
  const { rowCount } = await db.query(
    `UPDATE consultations SET reaction = $1
     WHERE id = $2 AND user_id = $3`,
    [reaction, consultationId, userId]
  );
  return rowCount > 0;
};

// 단건 삭제
exports.deleteOne = async (userId, consultationId) => {
  const { rowCount } = await db.query(
    `DELETE FROM consultations WHERE id = $1 AND user_id = $2`,
    [consultationId, userId]
  );
  return rowCount > 0;
};

// 상담-부적 연결 저장
exports.linkAmulet = async (consultationId, amuletId) => {
  await db.query(
    `INSERT INTO consultation_amulets (consultation_id, amulet_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [consultationId, amuletId]
  );
};