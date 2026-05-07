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
}

export interface DialogConfig {
  isOpen: boolean;
  title: string;
  description: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
}
