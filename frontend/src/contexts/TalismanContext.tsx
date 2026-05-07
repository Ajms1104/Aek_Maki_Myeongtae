import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Talisman, Grade } from '../types';
import { INITIAL_TALISMAN_DATA, HIDDEN_TALISMAN_DATA, STORAGE_KEYS } from '../constants/talisman';
import { storage } from '../utils/storage';
import { 
  createConsultation, 
  rewardAdCredit, 
  claimAttendanceReward,
  getCollection, 
  tokenStorage, 
  recordPayment 
} from '../utils/api';

export interface TalismanContextType {
  talismanData: Talisman[];
  credits: number;
  hasHiddenPass: boolean;
  lastAdWatchedAt: string | null; // 추가
  wish: string;
  loadingStep: number;
  justUnlockedHidden: boolean;
  consultationResult: ConsultationResult | null;
  isLoading: boolean;
  error: string | null;
  setWish: (wish: string) => void;
  setLoadingStep: (step: number) => void;
  setJustUnlockedHidden: (unlocked: boolean) => void;
  setCredits: (credits: number) => void;
  setHasHiddenPass: (has: boolean) => void;
  handlePaymentComplete: (productType: 'credit' | 'hidden') => void;
  handleAdReward: () => Promise<void>;
  handleAttendanceReward: () => Promise<string | null>;
  unlockHiddenInState: () => void;
  resetWish: () => void;
  submitWish: () => Promise<void>;
  refreshCollection: () => Promise<void>;
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
  remainingCredits: number;
  deleteAt: string;
}

export const TalismanContext = createContext<TalismanContextType | undefined>(undefined);

export const TalismanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasHiddenPass, setHasHiddenPass] = useState<boolean>(() => 
    storage.get('has_hidden_pass', false)
  );

  const [talismanData, setTalismanData] = useState<Talisman[]>([]);
  const [credits, setCredits] = useState<number>(() => 
    storage.get(STORAGE_KEYS.CREDITS, 0)
  );
  const [lastAdWatchedAt, setLastAdWatchedAt] = useState<string | null>(null); // 추가
  const [wish, setWish] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [justUnlockedHidden, setJustUnlockedHidden] = useState(false);
  const [consultationResult, setConsultationResult] = useState<ConsultationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCollection = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token || !token.includes('.')) {
      setTalismanData(INITIAL_TALISMAN_DATA.filter(t => t.grade !== 'hidden'));
      setHasHiddenPass(false);
      return;
    }
    
    try {
      const data = await getCollection();
      const { items, hasHiddenPass: serverHasHiddenPass, lastAdWatchedAt: serverAdTime, credits: serverCredits } = data;
      
      if (typeof serverHasHiddenPass === 'boolean') {
        setHasHiddenPass(serverHasHiddenPass);
        storage.set('has_hidden_pass', serverHasHiddenPass);
      }
      
      if (typeof serverCredits === 'number') {
        setCredits(serverCredits);
        storage.set(STORAGE_KEYS.CREDITS, serverCredits);
      }

      if (serverAdTime) setLastAdWatchedAt(serverAdTime); // 추가

      if (items && Array.isArray(items)) {
        const mappedItems = items.map((si: any) => ({
          id: si.id,
          name: si.name,
          grade: si.grade as Grade,
          img: si.imageUrl || '',
          unlocked: !si.isLocked,
          count: si.count || 0
        }));
        setTalismanData(mappedItems);
      }
    } catch (err) {
      console.error('Failed to fetch collection:', err);
    }
  }, []);

  useEffect(() => {
    refreshCollection();
  }, [refreshCollection]);

  const submitWish = useCallback(async () => {
    if (!wish || wish.length < 5) return;
    setIsLoading(true);
    setError(null);
    setConsultationResult(null); // 새로운 요청 전 이전 결과 초기화
    
    try {
      const result = await createConsultation(wish);
      setConsultationResult(result);
      await refreshCollection();
      if (typeof result.remainingCredits === 'number') {
        setCredits(result.remainingCredits);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wish, refreshCollection]);


  useEffect(() => {
    storage.set(STORAGE_KEYS.TALISMAN_DATA, talismanData);
  }, [talismanData]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CREDITS, credits);
  }, [credits]);

  const handlePaymentComplete = useCallback(async (productType: 'credit' | 'hidden') => {
    try {
      const result = await recordPayment(productType);
      if (result.success) {
        if (typeof result.credits === 'number') setCredits(result.credits);
        if (typeof result.hasHiddenPass === 'boolean') {
          setHasHiddenPass(result.hasHiddenPass);
          if (productType === 'hidden' && result.hasHiddenPass) {
            setJustUnlockedHidden(true);
          }
        }
      }
      await refreshCollection();
    } catch (err) {
      throw err;
    }
  }, [refreshCollection]);

  const handleAdReward = useCallback(async () => {
    try {
      const result = await rewardAdCredit();
      if (result && typeof result.credits === 'number') {
        setCredits(result.credits);
        setLastAdWatchedAt(new Date().toISOString()); // 즉시 갱신
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const handleAttendanceReward = useCallback(async () => {
    try {
      const result = await claimAttendanceReward();
      if (result && result.success) {
        setCredits(result.credits);
        return result.message; 
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  const unlockHiddenInState = useCallback(() => {
    setTalismanData((prev) => 
      prev.map(t => t.grade === 'hidden' ? { ...t, unlocked: true } : t)
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
      hasHiddenPass,
      lastAdWatchedAt, // 추가
      wish,
      loadingStep,
      justUnlockedHidden,
      consultationResult, 
      isLoading,         
      error,              
      setWish,
      setLoadingStep,
      setJustUnlockedHidden,
      setCredits,
      setHasHiddenPass,
      handlePaymentComplete,
      handleAdReward,
      handleAttendanceReward,
      unlockHiddenInState,
      resetWish,
      submitWish,
      refreshCollection,
    }}>
      {children}
    </TalismanContext.Provider>
  );
};
