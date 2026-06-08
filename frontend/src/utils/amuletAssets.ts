/**
 * 이 파일은 하이브리드 부적 이미지 자산을 관리합니다.
 * 1. UI용: 프론트엔드 내부의 저용량 WebP 사용 (src/assets/amulets/)
 * 2. 고화질용: 서버/CDN의 원본 PNG 사용
 */

const amuletModules = import.meta.glob('../assets/amulets/**/*.{webp,png}', { eager: true, as: 'url' });

/**
 * 상황에 맞는 부적 이미지 URL을 반환합니다.
 * @param path 기존의 백엔드용 이미지 경로 (예: /uploads/common/common_amulet_01.png)
 * @param mode 'ui' (로컬 WebP 우선) | 'high-res' (서버/CDN PNG)
 * @returns 이미지 URL
 */
export const getAmuletImage = (path: string, mode: 'ui' | 'high-res' = 'ui'): string => {
  if (!path) return '/result_image.png';

  // 가로형 특수 처리
  if (path.includes('horizontal_amulet')) {
    return mode === 'ui' 
      ? (amuletModules['../assets/amulets/hidden/horizontal_amulet.png'] || getHighResUrl(path))
      : getHighResUrl(path);
  }

  if (mode === 'ui') {
    // 1. 프론트엔드 내 WebP 자산 경로 생성
    const webpPath = path.replace('/uploads/', '../assets/amulets/').replace('.png', '.webp');
    if (amuletModules[webpPath]) {
      return amuletModules[webpPath];
    }
    
    // WebP가 없으면 서버 경로를 fallback으로 사용
    return getHighResUrl(path);
  } else {
    // 2. 고화질 원본 PNG 경로 (서버 또는 CDN)
    return getHighResUrl(path);
  }
};

import { BASE_URL } from './api';

/**
 * 서버 또는 CDN 기반의 고화질 이미지 URL을 생성합니다.
 */
const getHighResUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  // BASE_URL을 기반으로 절대 경로 생성
  return `${BASE_URL}${path}`;
};
