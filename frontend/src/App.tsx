import { useEffect, useMemo, useState } from 'react';
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle
} from 'react-icons/io5';
import { GlobalStyle } from './styles/globalStyles';
import * as L from './styles/layoutStyles';
import * as C from './styles/commonStyles';

import { useNavigation } from './hooks/useNavigation';
import { useTalisman } from './hooks/useTalisman';
import { useUI } from './hooks/useUI';
import { tokenStorage } from './utils/api';
import { loginWithToss } from './utils/auth';

import { TossDialog } from './components/TossDialog';
import { BottomSheet } from './components/BottomSheet';
import CustomNavigationBar from './components/CustomNavigationBar';
import MainStep from './steps/MainStep';
import InputStep from './steps/InputStep';
import LoadingStep from './steps/LoadingStep';
import ResultStep from './steps/ResultStep';
import CollectionStep from './steps/CollectionStep';
import PaymentStep from './steps/PaymentStep';
import CustomerServiceStep from './steps/CustomerServiceStep';
import InquiryStep from './steps/InquiryStep';
import AdminStep from './steps/AdminStep';
import AdminLoginStep from './steps/AdminLoginStep';

export default function App() {
  const { step, navigateTo } = useNavigation();
  const { setLoadingStep, refreshCollection, setCredits, setHasHiddenPass } = useTalisman();
  const {
    toastConfig,
    isMenuOpen,
    setIsMenuOpen,
    dialogConfig,
    setDialogConfig,
  } = useUI();

  // ✅ 앱 시작 시 자동 로그인 시도
  useEffect(() => {
    const initLogin = async () => {
      // 이미 토큰이 있다면 동기화만 진행
      if (tokenStorage.get()) {
        await refreshCollection();
        return;
      }

      // 관리자 모드 파라미터가 있으면 자동 로그인 건너뜀
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') return;

      console.log('[App] 자동 로그인 시도...');
      try {
        const result = await loginWithToss();
        if (result && result.user) {
          console.log('[App] 자동 로그인 성공');
          setCredits(result.user.credits);
          setHasHiddenPass(result.user.hasHiddenPass);
          await refreshCollection();
        }
      } catch (err: any) {
        console.warn('[App] 자동 로그인 실패 (비로그인 모드 유지)', err);
        // 만약 유저 정보를 찾을 수 없다는 에러라면 토큰 삭제
        if (err.message?.includes('찾을 수 없') || err.message?.includes('Unauthorized')) {
            tokenStorage.remove();
            console.log('[App] 무효한 토큰 삭제 완료');
        }
      }
    };
    initLogin();
  }, [refreshCollection, setCredits, setHasHiddenPass]);

  // 인증 가드 (보호된 단계 접근 제어)
  useEffect(() => {
    const publicSteps = ['main', 'admin_login', 'admin', 'payment'];
    const isProtectedStep = !publicSteps.includes(step);
    const hasToken = !!tokenStorage.get();

    if (isProtectedStep && !hasToken) {
      navigateTo('main');
    }
  }, [step, navigateTo]);

  // 관리자 리다이렉트
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' && step === 'main') {
      navigateTo('admin_login');
    }
  }, [step, navigateTo]);

  // 로딩 상태 제어
  useEffect(() => {
    if (step === 'loading') {
      setLoadingStep(0); // 로딩 진입 시 초기화
      const timers = [
        setTimeout(() => setLoadingStep(1), 800),
        setTimeout(() => setLoadingStep(2), 1800),
        setTimeout(() => setLoadingStep(3), 2800),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [step, setLoadingStep]);

  const CurrentStep = useMemo(() => {
    switch (step) {
      case 'main': return <MainStep />;
      case 'input': return <InputStep />;
      case 'loading': return <LoadingStep />;
      case 'result': return <ResultStep />;
      case 'collection': return <CollectionStep />;
      case 'payment': return <PaymentStep />;
      case 'customer_service': return <CustomerServiceStep />;
      case 'inquiry': return <InquiryStep />;
      case 'admin': return <AdminStep />;
      case 'admin_login': return <AdminLoginStep />;
      default: return <MainStep />;
    }
  }, [step]);

  return (
    <>
      <GlobalStyle />
      <L.Container>
        {/* 토스 스타일 통합 토스트 알림 */}
        <C.ToastContainer $show={toastConfig.show} $type={toastConfig.type}>
          {toastConfig.type === 'success' && <IoCheckmarkCircle size={18} color="#2ecc71" />}
          {toastConfig.type === 'error' && <IoAlertCircle size={18} color="#ffffff" />}
          {toastConfig.type === 'info' && <IoInformationCircle size={18} color="#3182f6" />}
          <span style={{ marginLeft: '2px' }}>{toastConfig.message}</span>
        </C.ToastContainer>

        {CurrentStep}

        {dialogConfig.isOpen && (
          <TossDialog
            title={dialogConfig.title}
            description={dialogConfig.description}
            showCancel={dialogConfig.showCancel}
            onConfirm={dialogConfig.onConfirm}
            onClose={() => setDialogConfig((p) => ({ ...p, isOpen: false }))}
          />
        )}
        <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </L.Container>
    </>
  );
}
