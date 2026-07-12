import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { graniteEvent, partner } from '@apps-in-toss/web-framework';
import { useUI } from '../hooks/useUI';
import type { Step, DialogConfig } from '../types';

export interface NavigationContextType {
  step: Step;
  history: Step[];
  navigateTo: (nextStep: Step) => void;
  replaceTo: (nextStep: Step) => void;
  handleBack: (onMainBack: (config: DialogConfig) => void) => void;
  resetToMain: () => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // URL 경로를 기반으로 초기 스텝 설정 (앱 내 기능 딥링크 지원)
  const getInitialStep = (): Step => {
    const path = window.location.pathname;
    if (path === '/collection') return 'collection';
    if (path === '/payment') return 'payment';
    if (path === '/admin_login') return 'admin_login';
    if (path === '/admin') return 'admin';
    return 'main';
  };

  const [step, setStep] = useState<Step>(getInitialStep);
  const { setDialogConfig } = useUI();

  // --- 핵심 로직 (useEffect에서 참조하므로 위로 이동) ---

  const handleBack = useCallback((_onMainBack?: (config: DialogConfig) => void) => {
    console.log('[Navigation] handleBack 실행 (현재 단계:', step, ')');
    // 메인 화면에서는 이 함수가 호출되지 않도록 (네이티브 종료에 맡김) 처리하지만, 
    // 만약 호출된다면 브라우저 뒤로가기를 시도합니다.
    window.history.back();
  }, [step]);

  const navigateTo = useCallback((nextStep: Step) => {
    if (nextStep !== step) {
      const path = nextStep === 'main' ? '/' : `/${nextStep}`;
      window.history.pushState({ step: nextStep }, '', path);
      setStep(nextStep);
    }
  }, [step]);

  const replaceTo = useCallback((nextStep: Step) => {
    if (nextStep !== step) {
      const path = nextStep === 'main' ? '/' : `/${nextStep}`;
      window.history.replaceState({ step: nextStep }, '', path);
      setStep(nextStep);
    }
  }, [step]);

  const resetToMain = useCallback(() => {
    setStep('main');
    window.history.pushState({ step: 'main' }, '', '/');
  }, []);

  // --- Effect Hooks ---

  // 앱 진입 시 초기 히스토리 상태 설정
  useEffect(() => {
    const initialPath = step === 'main' ? '/' : `/${step}`;
    window.history.replaceState({ step }, '', initialPath);
  }, []);

  // 브라우저/상단바 뒤로가기 감지 (브라우저 표준 popstate)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.step) {
        setStep(event.state.step);
      } else {
        // 브라우저 기본 동작으로 돌아왔을 때 현재 경로 기준으로 복구
        const path = window.location.pathname;
        if (path === '/collection') setStep('collection');
        else if (path === '/payment') setStep('payment');
        else if (path === '/admin_login') setStep('admin_login');
        else if (path === '/admin') setStep('admin');
        else setStep('main');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 토스 네이티브 뒤로가기 버튼 이벤트 감지 (graniteEvent 사용)
  useEffect(() => {
    // ✅ 메인 화면에서는 뒤로가기를 가로채지 않습니다.
    // 이렇게 하면 토스 앱이 자체적으로 "종료하시겠습니까?" 팝업(X 버튼과 동일한 것)을 띄워줍니다.
    if (step === 'main') {
      console.log('[Navigation] 메인 화면: 네이티브 뒤로가기 가로채기 해제 (Toss 기본 동작 사용)');
      return;
    }

    let unsubscription: (() => void) | undefined;
    
    try {
      console.log('[Navigation] backEvent 리스너 등록 (단계:', step, ')');
      unsubscription = graniteEvent.addEventListener('backEvent', {
        onEvent: () => {
          console.log('[Navigation] 네이티브 뒤로가기 감지 -> 이전 단계로 이동');
          handleBack();
        },
        onError: (error) => {
          console.error('[Navigation] backEvent 에러:', error);
        }
      });
    } catch (e) {
      console.warn('[Navigation] backEvent 리스너 등록 실패', e);
    }
    
    return () => {
      if (unsubscription) {
        console.log('[Navigation] backEvent 리스너 해제');
        unsubscription();
      }
    };
  }, [step, handleBack]); 

  return (
    <NavigationContext.Provider value={{ step, history: [], navigateTo, replaceTo, handleBack, resetToMain }}>
      {children}
    </NavigationContext.Provider>
  );
};
