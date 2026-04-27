import { exchangeTossToken } from './api';

export const loginWithToss = async (): Promise<boolean> => {
  try {
    console.log('[Toss Login] 시작...');
    
    // @ts-ignore
    const tossResult = await window.TossPayments?.appLogin?.().catch(() => null);
    
    const { authorizationCode, referrer } = tossResult ?? { 
      authorizationCode: 'mock_code_' + Date.now(), 
      referrer: 'sandbox' 
    };

    console.log('[Toss Login] 인증 코드 확보:', { authorizationCode, referrer });

    const result = await exchangeTossToken(authorizationCode, referrer);
    console.log('[Toss Login] 백엔드 토큰 교환 성공:', result);
    
    return true;
  } catch (err) {
    console.error('[Toss Login] 실패 상세:', err);
    // 에러 내용을 알림으로 표시 (디버깅용)
    alert('로그인에 실패했습니다: ' + (err instanceof Error ? err.message : String(err)));
    return false;
  }
};