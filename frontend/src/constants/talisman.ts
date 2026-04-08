import type { Talisman, Grade } from '../types';

export const GRADE_COLORS: Record<Grade, { bg: string; text: string; sub: string }> = {
  hidden: {
    bg: 'linear-gradient(135deg, #e5e5e5 0%, #ffffff 50%, #e5e5e5 100%)',
    text: '#191f28',
    sub: '#f2f4f6',
  },
  legend: { bg: '#fff8e1', text: '#ff9100', sub: '#ffecb3' },
  hero: { bg: '#f4edff', text: '#a25df5', sub: '#e8d9ff' },
  rare: { bg: '#e8f3ff', text: '#3182f6', sub: '#d0e5ff' },
  common: { bg: '#ffffff', text: '#191f28', sub: '#f2f4f6' },
};

export const INITIAL_TALISMAN_DATA: Talisman[] = [
  { id: 1, unlocked: true, name: '전설 명태 1', grade: 'legend', img: '/talisman_sun.png' },
  { id: 2, unlocked: false, name: '전설 명태 2', grade: 'legend', img: '/talisman_sun.png' },
  { id: 3, unlocked: false, name: '영웅 명태 1', grade: 'hero', img: '/talisman_sun.png' },
  { id: 4, unlocked: false, name: '영웅 명태 2', grade: 'hero', img: '/talisman_sun.png' },
  { id: 5, unlocked: false, name: '영웅 명태 3', grade: 'hero', img: '/talisman_sun.png' },
  { id: 6, unlocked: false, name: '영웅 명태 4', grade: 'hero', img: '/talisman_sun.png' },
  { id: 7, unlocked: false, name: '영웅 명태 5', grade: 'hero', img: '/talisman_sun.png' },
  { id: 8, unlocked: false, name: '개발자 명태', grade: 'rare', img: '/talisman_sun.png' },
  { id: 9, unlocked: false, name: '의사 명태', grade: 'rare', img: '/talisman_sun.png' },
  { id: 10, unlocked: false, name: '군인 명태', grade: 'rare', img: '/talisman_sun.png' },
  { id: 11, unlocked: false, name: '연구원 명태', grade: 'rare', img: '/talisman_sun.png' },
  { id: 12, unlocked: false, name: '디자이너 명태', grade: 'rare', img: '/talisman_sun.png' },
  { id: 17, unlocked: false, name: '일반 명태 1', grade: 'common', img: '/talisman_sun.png' },
];

export const HIDDEN_TALISMAN_DATA: Talisman[] = [
  { id: 34, unlocked: false, name: '히든 명태 1', grade: 'hidden', img: '/talisman_sun.png' },
  { id: 35, unlocked: false, name: '히든 명태 2', grade: 'hidden', img: '/talisman_sun.png' },
  { id: 36, unlocked: false, name: '히든 명태 3', grade: 'hidden', img: '/talisman_sun.png' },
];

export const STORAGE_KEYS = {
  TALISMAN_DATA: 'talisman_data',
  CREDITS: 'talisman_credits',
  WISH: 'talisman_wish',
};
