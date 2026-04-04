'use strict';

const https = require('https');
const fs = require('fs');
const axios = require('axios');

const TOSS_API_BASE = 'https://apps-in-toss-api.toss.im';
const MOCK_MODE = !process.env.TOSS_CLIENT_CERT_PATH;

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

  const { userKey } = userRes.data.success;

  return { userKey };
};