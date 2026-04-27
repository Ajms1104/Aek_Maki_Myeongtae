'use strict';

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const tossApiService = require('./tossApiService');

const MOCK_MODE = !process.env.TOSS_CLIENT_CERT_PATH;

exports.exchangeAndIssueToken = async (authorizationCode, referrer) => {
  let userKey;

  if (MOCK_MODE) {
    console.warn('[MOCK] 토스 API 스킵 - 개발용 더미 userKey 반환');
    userKey = 999000001;
  } else {
    // 실제 토스 API 호출
    const result = await tossApiService.exchangeAuthorizationCode(
      authorizationCode,
      referrer
    );
    userKey = result.userKey;
    // 필요한 경우 result.name, result.email 등을 여기서 처리 (예: DB 저장)
  }

  const user = await userRepository.upsertByTossUserKey(userKey);

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