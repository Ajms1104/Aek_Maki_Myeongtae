export const BASE_URL = 'https://aekmaki.site';

export const tokenStorage = {
  get: () => localStorage.getItem('accessToken'),
  set: (token: string) => localStorage.setItem('accessToken', token),
  remove: () => localStorage.removeItem('accessToken'),
};

export const remoteLog = (message: string, level: 'info' | 'warn' | 'error' = 'info', data?: any) => {
  console.log(`[Remote] ${message}`, data || '');
  fetch(`${BASE_URL}/api/v1/debug/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, message, data }),
  }).catch(() => {});
};

const request = async (url: string, options: RequestInit = {}) => {
  const token = tokenStorage.get();
  const fullUrl = `${BASE_URL}${url}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 404) tokenStorage.remove();
      const error = await res.json().catch(() => ({ error: '서버 오류' }));
      throw new Error(error.error || '서버 오류');
    }
    return res.json();
  } catch (err) {
    throw err;
  }
};

export const exchangeTossToken = (authorizationCode: string, referrer: string) => 
  request('/api/v1/auth/toss/exchange', { method: 'POST', body: JSON.stringify({ authorizationCode, referrer }) })
  .then(data => { tokenStorage.set(data.accessToken); return data; });

export const createConsultation = (content: string, category?: string) => request('/api/v1/consultations', { method: 'POST', body: JSON.stringify({ content, category }) });
export const getCollection = () => request('/api/v1/amulets/collection');
export const recordPayment = (productType: 'credit' | 'hidden') => request('/api/v1/payments/record', { method: 'POST', body: JSON.stringify({ productType }) });
export const claimAttendanceReward = () => request('/api/v1/payments/reward/attendance', { method: 'POST' });
export const claimViralReward = () => request('/api/v1/payments/reward/viral', { method: 'POST' });
export const getCatalog = () => request('/api/v1/amulets/catalog');
export const getPublicStats = () => request('/api/v1/amulets/public-stats');
export const getAdminUsers = (page = 1, search = '') => request(`/api/v1/admin/users?page=${page}&search=${search}`);
export const getAdminUserDetail = (userId: string | number) => request(`/api/v1/admin/users/${userId}`);
export const updateAdminUserUnlock = (userId: string | number, unlocked: boolean) => request(`/api/v1/admin/users/${userId}/unlock`, { method: 'PATCH', body: JSON.stringify({ unlocked }) });
export const updateAdminUserCredit = (userId: string | number, credits: number) => request(`/api/v1/admin/users/${userId}/credit`, { method: 'PATCH', body: JSON.stringify({ credits }) });
export const getAdminStats = () => request('/api/v1/admin/stats');
export const logAccessLog = (action: string, durationSeconds?: number) => 
  request('/api/v1/me/access-log', { method: 'POST', body: JSON.stringify({ action, durationSeconds }) }).catch(() => {});
