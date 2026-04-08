import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Talisman } from '../types';
import { INITIAL_TALISMAN_DATA, HIDDEN_TALISMAN_DATA, STORAGE_KEYS } from '../constants/talisman';
import { storage } from '../utils/storage';

interface TalismanContextType {
  talismanData: Talisman[];
  credits: number;
  wish: string;
  loadingStep: number;
  justUnlockedHidden: boolean;
  setWish: (wish: string) => void;
  setLoadingStep: (step: number) => void;
  setJustUnlockedHidden: (unlocked: boolean) => void;
  handlePaymentComplete: (productType: 'credit' | 'hidden') => void;
  unlockHiddenInState: () => void; // 연출 완료 후 호출할 함수 추가
  resetWish: () => void;
}

export const TalismanContext = createContext<TalismanContextType | undefined>(undefined);

export const TalismanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasHiddenPass, setHasHiddenPass] = useState<boolean>(() => 
    storage.get('has_hidden_pass', false)
  );

  const [talismanData, setTalismanData] = useState<Talisman[]>(() => {
    const savedData = storage.get(STORAGE_KEYS.TALISMAN_DATA, INITIAL_TALISMAN_DATA);
    const hasPass = storage.get('has_hidden_pass', false);
    if (!hasPass) {
      return savedData.filter(t => t.grade !== 'hidden');
    }
    return savedData;
  });

  const [credits, setCredits] = useState<number>(() => 
    storage.get(STORAGE_KEYS.CREDITS, 0)
  );
  const [wish, setWish] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [justUnlockedHidden, setJustUnlockedHidden] = useState(false);

  useEffect(() => {
    storage.set(STORAGE_KEYS.TALISMAN_DATA, talismanData);
  }, [talismanData]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CREDITS, credits);
  }, [credits]);

  useEffect(() => {
    storage.set('has_hidden_pass', hasHiddenPass);
  }, [hasHiddenPass]);

  const handlePaymentComplete = useCallback((productType: 'credit' | 'hidden') => {
    if (productType === 'hidden') {
      setHasHiddenPass(true);
      setTalismanData((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newHiddenItems = HIDDEN_TALISMAN_DATA
          .filter((t) => !existingIds.has(t.id))
          .map((t) => ({ ...t, unlocked: false })); // 초기엔 잠금 상태로 추가
        
        if (newHiddenItems.length === 0) {
          setJustUnlockedHidden(false);
          return prev;
        }
        
        setJustUnlockedHidden(true);
        return [...prev, ...newHiddenItems];
      });
      setCredits((c) => c + 5);
    } else {
      setCredits((c) => c + 10);
      setJustUnlockedHidden(false);
    }
  }, []);

  // 연출 완료 시점에 실제 잠금 해제 처리
  const unlockHiddenInState = useCallback(() => {
    setTalismanData((prev) => 
      prev.map(t => t.grade === 'hidden' ? { ...t, unlocked: true } : t)
    );
  }, []);

  const resetWish = useCallback(() => {
    setWish('');
    setLoadingStep(0);
  }, []);

  return (
    <TalismanContext.Provider value={{
      talismanData,
      credits,
      wish,
      loadingStep,
      justUnlockedHidden,
      setWish,
      setLoadingStep,
      setJustUnlockedHidden,
      handlePaymentComplete,
      unlockHiddenInState,
      resetWish
    }}>
      {children}
    </TalismanContext.Provider>
  );
};
