// 유저 데이터 전체 삭제 
exports.deleteAllData = async (userId) => {
  await db.query('DELETE FROM consultations WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM user_amulets WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM support WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM amulet_downloads WHERE user_id = $1', [userId]);

  // 유저 자체는 soft delete (토스 userKey 보존 - 재가입 대비)
  await db.query(
    `UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1`,
    [userId]
  );
};

// toss_user_key로 유저 조회 (UNLINK 콜백용)
exports.findByTossUserKey = async (tossUserKey) => {
  const { rows } = await db.query(
    'SELECT id FROM users WHERE toss_user_key = $1 AND is_deleted = FALSE',
    [tossUserKey]
  );
  return rows[0] || null;
};