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

  // 브라우저/상단바 뒤로가기 감지 (브라우저 표준 popstate - 단 1회 등록)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const currentStep = stepRef.current;
      console.log('[Navigation] popstate 감지 (현재 단계:', currentStep, ')');
      
      // 🐟 메인 화면에서 일반 웹 뒤로가기가 감지되면 이탈 방지 및 종료 팝업 활성화
      if (currentStep === 'main') {
        window.history.pushState({ step: 'main' }, '', '/');
        setDialogConfig({
          isOpen: true,
          title: '액막이 명태를 종료할까요?',
          description: '앱을 종료하고 토스 화면으로 돌아갑니다.',
          showCancel: true,
          cancelText: '머무르기',
          confirmText: '종료하기',
          onConfirm: () => {
            try {
              (partner as any).exit();
            } catch (e) {
              try {
                (partner as any).close();
              } catch (err) {
                console.error('[Navigation] partner exit/close 실패:', err);
                window.close();
              }
            }
          }
        });
        return;
      }

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
  }, [setDialogConfig]);

  // 토스 네이티브 뒤로가기 버튼 이벤트 감지 (graniteEvent 사용 - 최초 1회 견고히 등록)
  useEffect(() => {
    let unsubscription: (() => void) | undefined;
    
    try {
      console.log('[Navigation] backEvent 리스너 등록 진행');
      unsubscription = graniteEvent.addEventListener('backEvent', {
        onEvent: () => {
          const currentStep = stepRef.current;
          console.log('[Navigation] 네이티브 뒤로가기 감지 (현재 단계:', currentStep, ')');
          
          if (currentStep === 'main') {
            // 메인 화면인 경우 종료 의사 다이얼로그 팝업 노출!
            setDialogConfig({
              isOpen: true,
              title: '액막이 명태를 종료할까요?',
              description: '앱을 종료하고 토스 화면으로 돌아갑니다.',
              showCancel: true,
              cancelText: '머무르기',
              confirmText: '종료하기',
              onConfirm: () => {
                try {
                  (partner as any).exit();
                } catch (e) {
                  try {
                    (partner as any).close();
                  } catch (err) {
                    console.error('[Navigation] partner exit/close 실패:', err);
                    window.close();
                  }
                }
              }
            });
          } else {
            // 서브 단계일 때는 뒤로가기 동작 (브라우저 이전 히스토리)
            window.history.back();
          }
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
  }, [setDialogConfig]); 

  return (
    <NavigationContext.Provider value={{ step, history: [], navigateTo, replaceTo, handleBack, resetToMain }}>
      {children}
    </NavigationContext.Provider>
  );
};
