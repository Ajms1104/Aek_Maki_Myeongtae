import { exchangeTossToken, remoteLog } from './api';
import { getAnonymousKey } from '@apps-in-toss/web-framework';

/**
 * 토스 사용자 식별키를 발급받아 로그인을 시도합니다. (동의창 없음)
 */
export const loginWithToss = async (): Promise<any> => {
  try {
    console.log('[Toss Login] 식별키 발급 시작...');
    
    // 1. 토스 사용자 식별키 발급 (비게임 미니앱용)
    const result = await getAnonymousKey();
    
    if (!result || typeof result === 'string') {
      throw new Error(`식별키 발급 실패: ${result || 'unknown'}`);
    }

    const hash = result.hash;
    remoteLog(`[Toss Login] 식별키 수신 성공`);

    // 2. 백엔드로 식별키(hash) 전달하여 JWT 발급
    // 기존 exchangeTossToken 함수를 재사용하되, 첫 번째 인자로 hash를 넘깁니다.
    const loginResult = await exchangeTossToken(hash, 'DEFAULT');
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
