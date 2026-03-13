'use strict';

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const MOCK_MODE = !process.env.TOSS_CLIENT_ID;

/**
 * 토스 authorizationCode + referrer → 서비스 JWT 발급
 * 앱인토스 정책: referrer 필수 (DEFAULT | sandbox)
 */
exports.exchangeAndIssueToken = async (authorizationCode, referrer) => {
  let userKey;

  if (MOCK_MODE) {
    // 개발용 MOCK - 토스 API 없이 테스트
    console.warn('[MOCK] 토스 API 스킵 - 개발용 더미 userKey 반환');
    userKey = 999000001;
  } else {
    // 실제 토스 API 호출 (mTLS 인증서 필요)
    const tossApiService = require('./tossApiService');
    const result = await tossApiService.exchangeAuthorizationCode(
      authorizationCode,
      referrer
    );
    userKey = result.userKey;
  }

  // DB upsert (처음이면 생성, 재방문이면 last_seen_at 갱신)
  const user = await userRepository.upsertByTossUserKey(userKey);

  // 서비스 JWT 발급
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    expiresIn: '7d',
    user: {
      userId: user.id,
      createdAt: user.created_at,
    },
  };
};