import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Step, DialogConfig } from '../types';

export interface NavigationContextType {
  step: Step;
  history: Step[];
  navigateTo: (nextStep: Step) => void;
  handleBack: (onMainBack: (config: DialogConfig) => void) => void;
  resetToMain: () => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<Step>('main');
  const [history, setHistory] = useState<Step[]>([]);

  const navigateTo = useCallback((nextStep: Step) => {
    if (step !== 'loading') {
      setHistory((prev) => [...prev, step]);
    }
    setStep(nextStep);
  }, [step]);

  const handleBack = useCallback((onMainBack: (config: DialogConfig) => void) => {
    if (step === 'main') {
      onMainBack({
        isOpen: true,
        title: '앱을 종료할까요?',
        description: '지금 나가시면 작성 중인 내용이\n사라질 수 있어요.',
        showCancel: true,
        onConfirm: () => window.history.back(),
      });
      return;
    }

    if (step === 'result') {
      setStep('input');
      setHistory((prev) => prev.slice(0, -1));
      return;
    }

    if (history.length > 0) {
      const newHistory = [...history];
      const prev = newHistory.pop();
      if (prev) {
        setStep(prev);
        setHistory(newHistory);
      }
    }
  }, [step, history]);

  const resetToMain = useCallback(() => {
    setStep('main');
    setHistory([]);
  }, []);

  return (
    <NavigationContext.Provider value={{ step, history, navigateTo, handleBack, resetToMain }}>
      {children}
    </NavigationContext.Provider>
  );
};
