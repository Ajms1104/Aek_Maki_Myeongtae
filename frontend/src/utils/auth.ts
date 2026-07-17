import { exchangeTossToken, remoteLog, logAccessLog } from './api';
import { appLogin } from '@apps-in-toss/web-framework';

/**
 * 토스 사용자 식별키를 발급받아 로그인을 시도합니다. (동의창 포함)
 */
export const loginWithToss = async (): Promise<any> => {
  try {
    console.log('[Toss Login] 인가 코드 발급 시작...');
    
    // 1. 로그인 시도 로그 기록 (비회원 자격으로 먼저 전송)
    logAccessLog('LOGIN_ATTEMPT', 0, sessionStorage.getItem('referrer') || null);
    
    // 토스 인가 코드 발급 (동의창 포함)
    const result = await appLogin();
    
    if (!result || typeof result === 'string') {
      throw new Error(`인가 코드 발급 실패: ${result || 'unknown'}`);
    }

    const { authorizationCode, referrer } = result;
    remoteLog(`[Toss Login] 인가 코드 수신 성공`);

    // 2. 백엔드로 인가 코드(authorizationCode) 전달하여 JWT 발급
    const loginResult = await exchangeTossToken(authorizationCode, referrer);
    remoteLog('[Toss Login] 서비스 로그인 성공');

    // 3. 로그인 최종 성공 로그 기록 (이제 토큰 헤더가 실리므로 회원 로그로 자동 기록됨)
    logAccessLog('LOGIN_SUCCESS', 0, referrer);

    return loginResult;
  } catch (err: any) {
    console.error('[Toss Login] 실패:', err);
    
    // 에러 원인이 단순 유저의 취소/닫기인지, 아니면 진짜 시스템 오류인지 감별
    const errMsg = err.message || String(err);
    const isUserCancel = errMsg.includes('cancel') || errMsg.includes('취소') || errMsg.includes('close') || errMsg.includes('완료할 수 없습니다');
    const actionType = isUserCancel ? 'LOGIN_CANCEL' : 'LOGIN_ERROR';
    
    // 4. 로그인 에러/취소 로그 기록 (비회원 자격으로 원격 적재)
    logAccessLog(actionType, 0, null, {
      errorMessage: errMsg,
      userAgent: window.navigator.userAgent
    });
    
    remoteLog(`[Toss Login] 에러: ${errMsg}`, 'error');
    
    // 모의 로그인 폴백 (테스트 환경 또는 토스 앱이 아닌 경우)
    if (errMsg.includes('not supported') || !window.navigator.userAgent.includes('Toss')) {
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
