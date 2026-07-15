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
import { tokenStorage, remoteLog, logAccessLog } from './utils/api';
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

  // ✅ [수정] 앱 시작 시 자동 로그인 제거 (사용자 경험 개선) & 진입 로그 전송
  useEffect(() => {
    // URL에서 ?referrer=추천인 파라미터를 읽어 임시 세션스토리지에 보관합니다.
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('referrer');
    if (ref) {
      sessionStorage.setItem('referrer', ref);
    }

    const checkToken = async () => {
      const token = tokenStorage.get();
      if (token) {
        remoteLog('[App] 기존 로그인 세션 확인 - 동기화 진행');
        const storedReferrer = sessionStorage.getItem('referrer') || null;
        logAccessLog('APP_ENTER', 0, storedReferrer);
        try {
          await refreshCollection();
        } catch (e) {
          remoteLog('[App] 세션 동기화 실패 (유효하지 않은 토큰 등)');
        }
      }
    };
    checkToken();
  }, [refreshCollection]);

  // 앱 체류 시간 로깅
  // 앱 체류 시간 로깅
  useEffect(() => {
    const startTime = Date.now();
    const handleLeave = () => {
      const token = tokenStorage.get();
      if (token) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        const body = JSON.stringify({ action: 'APP_LEAVE', durationSeconds: duration });
        
        // 🔒 [수리] 하드코딩 URL을 상대 경로로 고치고, 인증 토큰이 누락되던 sendBeacon 대신 keepalive fetch로 무결 전송!
        const url = '/api/v1/me/access-log';
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body,
          keepalive: true
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);
    return () => {
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [step]);

  // 💓 [하트비트] 20초 주기 핑 송신을 통해 실시간 DAU 정밀성 및 누적 체류 시간 계산 무결성 확보!
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) return;

    const sendHeartbeat = () => {
      const url = '/api/v1/me/access-log';
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'HEARTBEAT', durationSeconds: 20 }),
        keepalive: true
      }).catch(() => {});
    };

    const interval = setInterval(sendHeartbeat, 20000);
    return () => clearInterval(interval);
  }, [step]);

  // 인증 가드 (보호된 단계 접근 제어)
  useEffect(() => {
    // 🔒 [어드민 선제 진입 가드] 관리자 토큰(adminToken)이 없는데 admin 화면으로 진입하려 하면, API를 쏘기 전에 로그인창으로 튕겨서 403을 예방합니다.
    const hasAdminToken = !!localStorage.getItem('adminToken');
    if (step === 'admin' && !hasAdminToken) {
      navigateTo('admin_login');
      return;
    }

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

  const isAdminStep = step === 'admin' || step === 'admin_login';

  return (
    <>
      {!isAdminStep && <GlobalStyle />}
      {/* 🐟 감성 웹 폰트 선제 프리로딩용 투명 안보임 DIV (감사 편지 로드 시 폰트 깨짐/깜빡임 완전 방지) */}
      <div style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <span style={{ fontFamily: '"Nanum Pen Script"' }}>Preload Nanum Pen Script</span>
        <span style={{ fontFamily: '"Gamja Flower"' }}>Preload Gamja Flower</span>
        <span style={{ fontFamily: '"East Sea Dokdo"' }}>Preload East Sea Dokdo</span>
        <span style={{ fontFamily: '"Gowun Dodum"' }}>Preload Gowun Dodum</span>
        <span style={{ fontFamily: '"Hi Melody"' }}>Preload Hi Melody</span>
      </div>

      {isAdminStep ? (
        <>
          <C.ToastContainer $show={toastConfig.show} $type={toastConfig.type}>
            {toastConfig.type === 'success' && <IoCheckmarkCircle size={18} color="#2ecc71" />}
            {toastConfig.type === 'error' && <IoAlertCircle size={18} color="#ffffff" />}
            {toastConfig.type === 'info' && <IoInformationCircle size={18} color="#3182f6" />}
            <span style={{ marginLeft: '2px' }}>{toastConfig.message}</span>
          </C.ToastContainer>
          {CurrentStep}
        </>
      ) : (
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
              cancelText={dialogConfig.cancelText}
              confirmText={dialogConfig.confirmText}
            />
          )}
          <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </L.Container>
      )}
    </>
  );
}
