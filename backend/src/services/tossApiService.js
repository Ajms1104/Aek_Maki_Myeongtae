'use strict';

const https = require('https');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

const TOSS_API_BASE = 'https://apps-in-toss-api.toss.im';
const MOCK_MODE = !process.env.TOSS_CLIENT_CERT_PATH;

exports.decryptTossData = (encryptedText) => {
  if (!encryptedText || MOCK_MODE) return encryptedText;
  try {
    const DECRYPT_KEY = process.env.TOSS_DECRYPT_KEY;
    const AAD = process.env.TOSS_AAD || 'TOSS';
    if (!DECRYPT_KEY) return encryptedText;

    const decoded = Buffer.from(encryptedText, 'base64');
    const iv = decoded.slice(0, 12);
    const tag = decoded.slice(decoded.length - 16);
    const ciphertext = decoded.slice(12, decoded.length - 16);

    const key = Buffer.from(DECRYPT_KEY, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from(AAD));

    let decrypted = decipher.update(ciphertext, 'binary', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[Toss API] 복호화 에러:', err.message);
    return null;
  }
};

function createTossAxiosInstance() {
  if (MOCK_MODE) return axios.create({ baseURL: TOSS_API_BASE });
  const httpsAgent = new https.Agent({
    cert: fs.readFileSync(process.env.TOSS_CLIENT_CERT_PATH),
    key: fs.readFileSync(process.env.TOSS_CLIENT_KEY_PATH),
    rejectUnauthorized: true,
  });
  return axios.create({ baseURL: TOSS_API_BASE, httpsAgent, timeout: 5000 });
}

const tossAxios = createTossAxiosInstance();

exports.exchangeAuthorizationCode = async (authorizationCode, referrer) => {
  // 인증서의 CN 값인 'aekmagi-ai'를 파트너 ID로 사용합니다.
  const partnerId = process.env.TOSS_PARTNER_ID || 'aekmagi-ai';

  console.log('[토스 API] === 인가 코드 교환 요청 (JSON 규격) ===');
  console.log('[토스 API] 요청 데이터:', {
    authorizationCode: authorizationCode.substring(0, 15) + '...',
    referrer: referrer,
    partnerId: partnerId
  });

  let accessToken;
  try {
    const tokenRes = await tossAxios.post(
      '/api-partner/v1/apps-in-toss/user/oauth2/generate-token',
      { 
        authorizationCode: authorizationCode, 
        referrer: referrer // SDK가 준 원본 그대로 전달
      },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'x-toss-partner-id': partnerId // 파트너 식별자 추가
        } 
      }
    );

    if (tokenRes.data.resultType !== 'SUCCESS') {
      console.error('[토스 API] 응답 FAIL 상세:', JSON.stringify(tokenRes.data.error, null, 2));
      const error = new Error(tokenRes.data.error?.reason || '토큰 발급 실패');
      error.status = 400;
      error.details = tokenRes.data.error;
      throw error;
    }

    accessToken = tokenRes.data.success.accessToken;
    console.log('[토스 API] accessToken 발급 성공!');

    // 2: 유저 정보 조회
    const userRes = await tossAxios.get(
      '/api-partner/v1/apps-in-toss/user/oauth2/login-me',
      { headers: { Authorization: `Bearer ${accessToken}`, 'x-toss-partner-id': partnerId } }
    );

    const { userKey, name, email, gender } = userRes.data.success;
    return { 
      userKey,
      name: exports.decryptTossData(name),
      email: exports.decryptTossData(email),
      gender: exports.decryptTossData(gender)
    };
  } catch (err) {
    if (err.status) throw err;
    console.error('[토스 API] 에러:', err.message);
    throw err;
  }
};
