import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
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
    // 1. 일반 경로 파싱
    const path = window.location.pathname;
    if (path === '/collection') return 'collection';
    if (path === '/payment') return 'payment';
    if (path === '/admin_login') return 'admin_login';
    if (path === '/admin') return 'admin';

    // 2. Nginx 정적 호스팅 우회용 쿼리 스트링 (?step=admin_login) 파싱
    const params = new URLSearchParams(window.location.search);
    const queryStep = params.get('step') as Step;
    const validSteps: Step[] = ['collection', 'payment', 'admin_login', 'admin'];
    if (queryStep && validSteps.includes(queryStep)) {
      return queryStep;
    }

    return 'main';
  };

  const [step, setStep] = useState<Step>(getInitialStep);
  const { setDialogConfig } = useUI();

  // 🐟 step 상태의 Stale Closure 및 네이티브 리스너 재등록 유실 예방용 레퍼런스
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // --- 핵심 로직 (useEffect에서 참조하므로 위로 이동) ---

  const handleBack = useCallback((_onMainBack?: (config: DialogConfig) => void) => {
    console.log('[Navigation] handleBack 실행 (현재 단계:', stepRef.current, ')');
    window.history.back();
  }, []);

  const navigateTo = useCallback((nextStep: Step) => {
    if (nextStep !== stepRef.current) {
      const path = nextStep === 'main' ? '/' : `/${nextStep}`;
      window.history.pushState({ step: nextStep }, '', path);
      setStep(nextStep);
    }
  }, []);

  const replaceTo = useCallback((nextStep: Step) => {
    if (nextStep !== stepRef.current) {
      const path = nextStep === 'main' ? '/' : `/${nextStep}`;
      window.history.replaceState({ step: nextStep }, '', path);
      setStep(nextStep);
    }
  }, []);

  const resetToMain = useCallback(() => {
    setStep('main');
    window.history.pushState({ step: 'main' }, '', '/');
  }, []);

  // --- Effect Hooks ---

  // 앱 진입 시 초기 히스토리 상태 설정
  useEffect(() => {
    const initialPath = stepRef.current === 'main' ? '/' : `/${stepRef.current}`;
    window.history.replaceState({ step: stepRef.current }, '', initialPath);
  }, []);

  // 브라우저/상단바 뒤로가기 감지 (브라우저 표준 popstate)
  // 메인 화면('main')일 때는 popstate를 강제로 가두지 않고 내버려두어, 토스 네이티브 종료 시퀀스가 정상 가동되도록 합니다.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log('[Navigation] popstate 감지 (현재 단계:', step, ')');
      
      if (step === 'main') {
        return;
      }

      if (event.state && event.state.step) {
        setStep(event.state.step);
      } else {
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
  }, [step]);

  // 토스 네이티브 뒤로가기 버튼 이벤트 감지 (graniteEvent 사용)
  // 현재 스텝이 'main' 이 아닐 때만 뒤로가기 이벤트를 가로채서 이전 브라우저 스택으로 돌려줍니다.
  // 메인 화면('main')일 때는 리스너를 해제해두므로, 토스앱 네이티브 뒤로가기가 미니앱을 정상적이고 확실하게 종료(Exit)시킵니다.
  useEffect(() => {
    if (step === 'main') {
      console.log('[Navigation] 메인 화면: 네이티브 뒤로가기 가로채기 해제 (Toss 기본 종료 시퀀스 사용)');
      return;
    }

    let unsubscription: (() => void) | undefined;
    
    try {
      console.log('[Navigation] backEvent 리스너 등록 (단계:', step, ')');
      unsubscription = graniteEvent.addEventListener('backEvent', {
        onEvent: () => {
          console.log('[Navigation] 네이티브 뒤로가기 감지 -> 이전 단계로 이동');
          window.history.back();
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
        console.log('[Navigation] backEvent 리스너 해제 (단계:', step, ')');
        unsubscription();
      }
    };
  }, [step]); 

  return (
    <NavigationContext.Provider value={{ step, history: [], navigateTo, replaceTo, handleBack, resetToMain }}>
      {children}
    </NavigationContext.Provider>
  );
};
