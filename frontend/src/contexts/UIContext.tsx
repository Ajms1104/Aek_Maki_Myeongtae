import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DialogConfig } from '../types';

export interface ToastConfig {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface UIContextType {
  toastConfig: ToastConfig;
  isMenuOpen: boolean;
  dialogConfig: DialogConfig;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  openDialog: (title: string, description: string, options?: Partial<DialogConfig>) => void;
  closeDialog: () => void;
  setDialogConfig: React.Dispatch<React.SetStateAction<DialogConfig>>;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    show: false,
    message: '',
    type: 'success',
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    isOpen: false,
    title: '',
    description: '',
    showCancel: false,
    onConfirm: () => {},
  });

  const triggerToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastConfig({ show: true, message, type });
    // 가독성을 위해 노출 시간을 4초로 연장
    setTimeout(() => setToastConfig((prev) => ({ ...prev, show: false })), 4000);
  }, []);

  const openDialog = useCallback((title: string, description: string, options?: Partial<DialogConfig>) => {
    setDialogConfig({
      isOpen: true,
      title,
      description,
      showCancel: options?.showCancel ?? false,
      onConfirm: options?.onConfirm || (() => setDialogConfig((p) => ({ ...p, isOpen: false }))),
      onClose: options?.onClose,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogConfig((p) => ({ ...p, isOpen: false }));
  }, []);

  return (
    <UIContext.Provider value={{
      toastConfig,
      isMenuOpen,
      dialogConfig,
      triggerToast,
      setIsMenuOpen,
      openDialog,
      closeDialog,
      setDialogConfig
    }}>
      {children}
    </UIContext.Provider>
  );
};
