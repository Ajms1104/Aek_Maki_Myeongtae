import { exchangeTossToken } from './api';

export const loginWithToss = async (): Promise<any> => {
  try {
    console.log('[Toss Login] 시작...');
    
    const sdk = (window as any).TossPayments;
    
    // ✅ 로컬 환경(SDK 없음) 대응: mock_code를 사용하여 자동 로그인
    if (!sdk || typeof sdk.appLogin !== 'function') {
      console.warn('[Toss Login] 토스 앱 환경이 아닙니다. 모의 로그인을 시도합니다.');
      try {
        const result = await exchangeTossToken('mock_code', 'DEFAULT');
        console.log('[Toss Login] 모의 로그인 성공');
        return result;
      } catch (mockErr) {
        console.error('[Toss Login] 모의 로그인 실패:', mockErr);
        return null;
      }
    }

    // 2. 실제 토스 앱 로그인
    const tossResult = await sdk.appLogin();
    
    if (!tossResult || !tossResult.authorizationCode) {
      throw new Error('인증 코드가 없습니다.');
    }

    const { authorizationCode, referrer } = tossResult;
    const result = await exchangeTossToken(authorizationCode, referrer);
    console.log('[Toss Login] 백엔드 토큰 교환 성공');

    return result;
  } catch (err) {
    console.error('[Toss Login] 실패:', err);
    // 실제 유저에게는 에러 알림을 띄우지 않고 로그만 남김 (App.tsx에서 리다이렉트로 처리)
    return null;
  }
};
