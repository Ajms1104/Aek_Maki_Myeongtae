import { exchangeTossToken } from './api';

export const loginWithToss = async (): Promise<boolean> => {
  try {
    // 앱인토스 SDK appLogin() 호출
    // @ts-ignore
    const { authorizationCode, referrer } = await window.TossPayments?.appLogin?.() 
      ?? { authorizationCode: 'mock_code', referrer: 'sandbox' }; // 개발용 MOCK

    await exchangeTossToken(authorizationCode, referrer);
    return true;
  } catch (err) {
    console.error('[Toss Login] 실패:', err);
    return false;
  }
};