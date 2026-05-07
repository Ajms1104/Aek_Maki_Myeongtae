'use strict';

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const tossApiService = require('./tossApiService');

const MOCK_MODE = !process.env.TOSS_CLIENT_CERT_PATH;

exports.exchangeAndIssueToken = async (authorizationCode, referrer) => {
  let userKey;

  // ✅ 로컬 테스트용 모의 로그인 로직
  if (authorizationCode === 'mock_code') {
    console.log('[Auth] 모의 로그인 모드 (테스트 유저)');
    userKey = 12345678; 
  } else {
    // 실제 토스 API 호출
    const result = await tossApiService.exchangeAuthorizationCode(
      authorizationCode,
      referrer
    );
    userKey = result.userKey;
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
      credits: user.credits,
      hasHiddenPass: user.has_hidden_pass,
      createdAt: user.created_at,
    },
  };
};