// 현재 접속한 호스트를 기반으로 서버 주소 설정 (모바일 테스트 대응)
export const BASE_URL = 'https://runniest-suppositionally-jesica.ngrok-free.dev';

// 토큰 저장/조회
export const tokenStorage = {
  get: () => localStorage.getItem('accessToken'),
  set: (token: string) => localStorage.setItem('accessToken', token),
  remove: () => localStorage.removeItem('accessToken'),
};

// 원격 로그 전송
export const remoteLog = (message: string, level: 'info' | 'warn' | 'error' = 'info', data?: any) => {
  console.log(`[Remote] ${message}`, data || '');
  fetch(`${BASE_URL}/api/v1/debug/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, message, data }),
  }).catch(() => {}); // 로그 전송 실패는 무시
};

// 공통 fetch
const request = async (url: string, options: RequestInit = {}) => {
  const token = tokenStorage.get();
  const fullUrl = `${BASE_URL}${url}`;
  console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420', // ngrok 경고 페이지 우회
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    console.log(`[API Response] ${res.status} ${fullUrl}`);

    if (!res.ok) {
      // 401(인증실패) 또는 404(유저없음) 시 세션 초기화
      if (res.status === 401 || res.status === 404) {
        console.warn(`[API] 세션 무효화 (${res.status}). 토큰을 삭제합니다.`);
        tokenStorage.remove();
      }
      const error = await res.json().catch(() => ({ error: '서버 오류' }));
      throw new Error(error.error || '서버 오류');
    }

    return res.json();
  } catch (err) {
    console.error(`[API Error] ${fullUrl} :`, err);
    throw err;
  }
};

// 토스 로그인 - authorizationCode 교환
export const exchangeTossToken = async (
  authorizationCode: string,
  referrer: string
) => {
  const data = await request('/api/v1/auth/toss/exchange', {
    method: 'POST',
    body: JSON.stringify({ authorizationCode, referrer }),
  });
  tokenStorage.set(data.accessToken);
  return data;
};

// 고민 등록 + 부적 발급
export const createConsultation = async (content: string, category?: string) => {
  return request('/api/v1/consultations', {
    method: 'POST',
    body: JSON.stringify({ content, category }),
  });
};

// 내 부적 도감 조회
export const getCollection = () => request('/api/v1/amulets/collection');

// 결제 기록 및 보상 지급 요청
export const recordPayment = (productType: 'credit' | 'hidden') => 
  request('/api/v1/payments/record', { 
    method: 'POST', 
    body: JSON.stringify({ productType }) 
  });

// 출석 보상 지급 요청
export const claimAttendanceReward = () => request('/api/v1/payments/reward/attendance', { method: 'POST' });

// 부적 도감 마스터 조회 (인증 불필요)
export const getCatalog = () => request('/api/v1/amulets/catalog');


// 관리자 전용 - 유저 목록 조회
export const getAdminUsers = (page = 1, search = '') => 
  request(`/api/v1/admin/users?page=${page}&search=${search}`);

// 관리자 전용 - 유저 상세 조회
export const getAdminUserDetail = (userId: string | number) => 
  request(`/api/v1/admin/users/${userId}`);

// 관리자 전용 - 유저 해금 상태 수동 변경
export const updateAdminUserUnlock = (userId: string | number, unlocked: boolean) => 
  request(`/api/v1/admin/users/${userId}/unlock`, {
    method: 'PATCH',
    body: JSON.stringify({ unlocked }),
  });

// 관리자 전용 - 유저 크레딧 수동 수정
export const updateAdminUserCredit = (userId: string | number, credits: number) => 
  request(`/api/v1/admin/users/${userId}/credit`, {
    method: 'PATCH',
    body: JSON.stringify({ credits }),
  });
