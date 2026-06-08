'use strict';

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const tossApiService = require('./tossApiService');

const MOCK_MODE = !process.env.TOSS_CLIENT_CERT_PATH;

exports.exchangeAndIssueToken = async (userHash, referrer) => {
  // 프론트엔드에서 받은 식별키(hash)를 그대로 userKey로 사용합니다.
  const userKey = userHash;
  
  console.log(`[Auth] 유저 식별키로 로그인 시도: ${userKey}`);

  console.log(`[Auth] 유저 데이터 저장(upsert) 시도... userKey: ${userKey}`);
  const user = await userRepository.upsertByTossUserKey(userKey);
  console.log(`[Auth] 유저 데이터 저장 완료: userId=${user.id}`);

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