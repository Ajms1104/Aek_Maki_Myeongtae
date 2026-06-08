export type Step =
  | 'main'
  | 'input'
  | 'loading'
  | 'result'
  | 'collection'
  | 'payment'
  | 'customer_service'
  | 'inquiry'
  | 'admin'
  | 'admin_login';

export type Grade = 'legend' | 'rare' | 'common' | 'hidden';

export interface Talisman {
  id: number;
  unlocked: boolean;
  img: string;
  name: string;
  grade: Grade;
  count: number;
  description?: string; // 액막이 설명 추가
  extraImg?: string;   // 히든 전용 감사 카드 등 추가 이미지
  letter?: string;     // 개발자 감사 편지 문구
  fontFamily?: string; // 감사 편지용 고유 서체
}

export interface DialogConfig {
  isOpen: boolean;
  title: string;
  description: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
}
