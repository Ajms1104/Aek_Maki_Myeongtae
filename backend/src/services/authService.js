'use strict';

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const tossApiService = require('./tossApiService');

exports.exchangeAndIssueToken = async (authorizationCode, referrer) => {
  console.log(`[Auth] 인가 코드로 로그인 시도: ${authorizationCode}, referrer: ${referrer}`);

  let userKey;
  try {
    const tossUser = await tossApiService.exchangeAuthorizationCode(authorizationCode, referrer);
    if (tossUser && tossUser.userKey) {
      userKey = tossUser.userKey.toString();
      console.log(`[Auth] 토스 API 교환 성공: userKey=${userKey}`);
    } else {
      throw new Error('Toss API returned empty userKey');
    }
  } catch (err) {
    console.warn(`[Auth] 토스 API 교환 실패 (모의 토큰 사용 가능성): ${err.message}`);
    userKey = authorizationCode;
  }

  console.log(`[Auth] 유저 데이터 저장(upsert) 시도... userKey: ${userKey}`);
  try {
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
  } catch (err) {
    console.error('[Auth] 유저 저장 실패:', err);
    throw err;
  }
};
