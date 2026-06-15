import { exchangeTossToken, remoteLog } from './api';
import { appLogin } from '@apps-in-toss/web-framework';

/**
 * 토스 사용자 식별키를 발급받아 로그인을 시도합니다. (동의창 포함)
 */
export const loginWithToss = async (): Promise<any> => {
  try {
    console.log('[Toss Login] 인가 코드 발급 시작...');
    
    // 1. 토스 인가 코드 발급 (동의창 포함)
    const result = await appLogin();
    
    if (!result || typeof result === 'string') {
      throw new Error(`인가 코드 발급 실패: ${result || 'unknown'}`);
    }

    const { authorizationCode, referrer } = result;
    remoteLog(`[Toss Login] 인가 코드 수신 성공`);

    // 2. 백엔드로 인가 코드(authorizationCode) 전달하여 JWT 발급
    const loginResult = await exchangeTossToken(authorizationCode, referrer);
    remoteLog('[Toss Login] 서비스 로그인 성공');

    return loginResult;
  } catch (err: any) {
    console.error('[Toss Login] 실패:', err);
    remoteLog(`[Toss Login] 에러: ${err.message || err}`, 'error');
    
    // 모의 로그인 폴백 (테스트 환경 또는 토스 앱이 아닌 경우)
    if (err.message?.includes('not supported') || !window.navigator.userAgent.includes('Toss')) {
      console.warn('[Toss Login] 테스트 환경 감지. 모의 로그인을 시도합니다.');
      try {
        const loginResult = await exchangeTossToken('mock_user_hash_123', 'DEFAULT');
        return loginResult;
      } catch (mockErr) {
        return null;
      }
    }
    return null;
  }
};
