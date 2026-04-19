const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 토큰 저장/조회
export const tokenStorage = {
  get: () => localStorage.getItem('accessToken'),
  set: (token: string) => localStorage.setItem('accessToken', token),
  remove: () => localStorage.removeItem('accessToken'),
};

// 공통 fetch
const request = async (url: string, options: RequestInit = {}) => {
  const token = tokenStorage.get();
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '서버 오류' }));
    throw new Error(error.error || '서버 오류');
  }

  return res.json();
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

// 부적 도감 마스터 조회 (인증 불필요)
export const getCatalog = () => request('/api/v1/amulets/catalog');