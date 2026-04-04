'use strict';

const db = require('../db');
const userRepository = require('../repositories/userRepository');

// 내 데이터 전체 삭제
exports.deleteMyData = async (userId) => {
  await userRepository.deleteAllData(userId);
};

// 토스 UNLINK 콜백 처리
exports.handleUnlink = async (tossUserKey, referrer) => {
  console.info(`[UNLINK] tossUserKey=${tossUserKey}, referrer=${referrer}`);

  const user = await userRepository.findByTossUserKey(tossUserKey);
  if (!user) {
    // 이미 탈퇴했거나 없는 유저 - 무시
    console.info(`[UNLINK] 유저 없음 - tossUserKey=${tossUserKey}`);
    return;
  }

  // WITHDRAWAL_TOSS = 토스 탈퇴 → 우리 데이터도 삭제
  // UNLINK = 연결만 끊기 → 데이터 삭제 여부는 정책에 따라 결정
  // WITHDRAWAL_TERMS = 약관 철회 → 연결만 끊기
  if (referrer === 'WITHDRAWAL_TOSS') {
    await userRepository.deleteAllData(user.id);
    console.info(`[UNLINK] WITHDRAWAL_TOSS - 데이터 삭제 완료 userId=${user.id}`);
  } else {
    // UNLINK, WITHDRAWAL_TERMS - soft delete만
    await db.query(
      `UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1`,
      [user.id]
    );
    console.info(`[UNLINK] ${referrer} - soft delete 완료 userId=${user.id}`);
  }
};