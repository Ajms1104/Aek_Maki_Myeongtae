import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Talisman } from '../types';
import { INITIAL_TALISMAN_DATA, HIDDEN_TALISMAN_DATA, STORAGE_KEYS } from '../constants/talisman';
import { storage } from '../utils/storage';
import { createConsultation } from '../utils/api';

export interface TalismanContextType {
  talismanData: Talisman[];
  credits: number;
  wish: string;
  loadingStep: number;
  justUnlockedHidden: boolean;
  consultationResult: ConsultationResult | null;
  isLoading: boolean;
  error: string | null;
  setWish: (wish: string) => void;
  setLoadingStep: (step: number) => void;
  setJustUnlockedHidden: (unlocked: boolean) => void;
  handlePaymentComplete: (productType: 'credit' | 'hidden') => void;
  handleAdReward: () => void;
  unlockHiddenInState: () => void; // 연출 완료 후 호출할 함수 추가
  resetWish: () => void;
  submitWish: () => Promise<void>;
}

interface ConsultationResult {
  consultationId: number;
  status: string;
  reply: string;
  amulet: {
    id: number;
    name: string;
    imageUrl: string;
    grade: string;
    isNew: boolean;
  };
  deleteAt: string;
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
      return savedData.filter(t => t.grade !== 'legend');
    }
    return savedData;
  });

  const [credits, setCredits] = useState<number>(() => 
    storage.get(STORAGE_KEYS.CREDITS, 0)
  );
  const [wish, setWish] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [justUnlockedHidden, setJustUnlockedHidden] = useState(false);
  const [consultationResult, setConsultationResult] = useState<ConsultationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitWish = useCallback(async () => {
    if (!wish || wish.length < 5) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await createConsultation(wish);
      setConsultationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wish]);


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

  const handleAdReward = useCallback(() => {
    setCredits((c) => c + 1);
  }, []);

  // 연출 완료 시점에 실제 잠금 해제 처리
  const unlockHiddenInState = useCallback(() => {
    setTalismanData((prev) => 
      prev.map(t => t.grade === 'legend' ? { ...t, unlocked: true } : t)
    );
  }, []);

  const resetWish = useCallback(() => {
    setWish('');
    setLoadingStep(0);
    setConsultationResult(null);
    setError(null); 
  }, []);

  return (
    <TalismanContext.Provider value={{
      talismanData,
      credits,
      wish,
      loadingStep,
      justUnlockedHidden,
      consultationResult, 
      isLoading,         
      error,              
      setWish,
      setLoadingStep,
      setJustUnlockedHidden,
      handlePaymentComplete,
      handleAdReward,
      unlockHiddenInState,
      resetWish,
      submitWish,
    }}>
      {children}
    </TalismanContext.Provider>
  );
};
