import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DialogConfig } from '../types';

interface UIContextType {
  showToast: boolean;
  isMenuOpen: boolean;
  dialogConfig: DialogConfig;
  triggerToast: () => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  openDialog: (title: string, description: string, options?: Partial<DialogConfig>) => void;
  closeDialog: () => void;
  setDialogConfig: React.Dispatch<React.SetStateAction<DialogConfig>>;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    isOpen: false,
    title: '',
    description: '',
    showCancel: false,
    onConfirm: () => {},
  });

  const triggerToast = useCallback(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
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
      showToast,
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
