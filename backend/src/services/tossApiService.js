'use strict';

const https = require('https');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

const TOSS_API_BASE = 'https://apps-in-toss-api.toss.im';
const MOCK_MODE = !process.env.TOSS_CLIENT_CERT_PATH;

/**
 * 토스 사용자 정보 복호화 (AES-256-GCM)
 * 문서 5번 항목 참조
 */
exports.decryptTossData = (encryptedText) => {
  if (!encryptedText || MOCK_MODE) return encryptedText;

  try {
    const DECRYPT_KEY = process.env.TOSS_DECRYPT_KEY; // Base64 encoded
    const AAD = process.env.TOSS_AAD || 'TOSS';      // Additional Authenticated Data

    if (!DECRYPT_KEY) {
      console.warn('[Toss API] 복호화 키가 설정되지 않아 복호화를 건너뜁니다.');
      return encryptedText;
    }

    const IV_LENGTH = 12;
    const TAG_LENGTH = 16;

    // 1. 데이터 디코딩
    const decoded = Buffer.from(encryptedText, 'base64');

    // 2. IV(Nonce), 본문, Tag 분리
    // 암호화된 데이터 구조: [IV(12bytes)][Ciphertext...][Tag(16bytes)]
    const iv = decoded.slice(0, IV_LENGTH);
    const tag = decoded.slice(decoded.length - TAG_LENGTH);
    const ciphertext = decoded.slice(IV_LENGTH, decoded.length - TAG_LENGTH);

    // 3. 복호화 설정
    const key = Buffer.from(DECRYPT_KEY, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from(AAD));

    // 4. 복호화 실행
    let decrypted = decipher.update(ciphertext, 'binary', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[Toss API] 복호화 중 에러 발생:', err.message);
    return null; // 또는 원래의 encryptedText 반환 선택
  }
};

function createTossAxiosInstance() {
  if (MOCK_MODE) {
    console.warn('[MOCK] mTLS 인증서 없음 - MOCK 모드로 동작');
    return axios.create({ baseURL: TOSS_API_BASE });
  }

  const httpsAgent = new https.Agent({
    cert: fs.readFileSync(process.env.TOSS_CLIENT_CERT_PATH),
    key: fs.readFileSync(process.env.TOSS_CLIENT_KEY_PATH),
    rejectUnauthorized: true,
  });

  return axios.create({
    baseURL: TOSS_API_BASE,
    httpsAgent,
    timeout: 5000,
  });
}

const tossAxios = createTossAxiosInstance();

/*authorizationCode + referrer → 토스 accessToken + userKey 교환 */
exports.exchangeAuthorizationCode = async (authorizationCode, referrer) => {
  // 0. 만약에 KEY가 없을 경우
  if (MOCK_MODE) {
    console.warn('[MOCK] exchangeAuthorizationCode 스킵 - 더미 userKey 반환');
    return { userKey: 999000001 };
  }


  // 1: authorizationCode → accessToken
  const tokenRes = await tossAxios.post(
    '/api-partner/v1/apps-in-toss/user/oauth2/generate-token',
    { authorizationCode, referrer },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (tokenRes.data.resultType !== 'SUCCESS') {
    const err = tokenRes.data.error || {};
    console.error('[토스 API] 토큰 발급 실패:', err);
    const error = new Error(err.reason || '토큰 발급 실패');
    error.status = 400;
    throw error;
  }

  const { accessToken } = tokenRes.data.success;

  // 2: accessToken → userKey
  const userRes = await tossAxios.get(
    '/api-partner/v1/apps-in-toss/user/oauth2/login-me',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (userRes.data.resultType !== 'SUCCESS') {
    const err = userRes.data.error || {};
    console.error('[토스 API] 유저 정보 조회 실패:', err);
    const error = new Error(err.reason || '유저 정보 조회 실패');
    error.status = 502;
    throw error;
  }

  const { userKey, name, email, gender } = userRes.data.success;

  return { 
    userKey,
    name: this.decryptTossData(name),
    email: this.decryptTossData(email),
    gender: this.decryptTossData(gender)
  };
};