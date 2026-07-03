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
  description?: string; // ?〓쭑???ㅻ챸 異붽?
  extraImg?: string;   // ?덈뱺 ?꾩슜 媛먯궗 移대뱶 ??異붽? ?대?吏
  letter?: string;     // 媛쒕컻??媛먯궗 ?몄? 臾멸뎄
  fontFamily?: string; // 媛먯궗 ?몄???怨좎쑀 ?쒖껜
}

export interface DialogConfig {
  isOpen: boolean;
  title: string;
  description: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
}

export interface Challenge {
  key: string;
  title: string;
  description: string;
  rewardCredits: number;
  target: number;
  progress: number;
  completed: boolean;
}

