import { useEffect, useMemo } from 'react';
import {
  IoArrowBack,
  IoEllipsisHorizontal,
  IoClose,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import { GlobalStyle } from './styles/globalStyles';
import * as L from './styles/layoutStyles';
import * as C from './styles/commonStyles';

import { useNavigation } from './hooks/useNavigation';
import { useTalisman } from './hooks/useTalisman';
import { useUI } from './hooks/useUI';

import { TossDialog } from './components/TossDialog';
import { BottomSheet } from './components/BottomSheet';
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
  const {
    step,
    navigateTo,
    handleBack,
    resetToMain: navReset,
  } = useNavigation();
  const { setLoadingStep, resetWish } = useTalisman();
  const {
    showToast,
    isMenuOpen,
    setIsMenuOpen,
    dialogConfig,
    setDialogConfig,
  } = useUI();

  // 앱 시작 시 관리자 모드 확인 (?admin=true 파라미터가 있을 경우)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      navigateTo('admin_login');
    }
  }, []);

  const resetToMain = () => {
    if (step === 'main') {
      handleBack(setDialogConfig);
      return;
    }
    navReset();
    resetWish();
  };

  useEffect(() => {
    if (step === 'loading') {
      const timers = [
        setTimeout(() => setLoadingStep(1), 800),
        setTimeout(() => setLoadingStep(2), 1800),
        setTimeout(() => setLoadingStep(3), 2800),
        setTimeout(() => navigateTo('result'), 3800),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [step, navigateTo, setLoadingStep]);

  const CurrentStep = useMemo(() => {
    switch (step) {
      case 'main':
        return <MainStep />;
      case 'input':
        return <InputStep />;
      case 'loading':
        return <LoadingStep />;
      case 'result':
        return <ResultStep />;
      case 'collection':
        return <CollectionStep />;
      case 'payment':
        return <PaymentStep />;
      case 'customer_service':
        return <CustomerServiceStep />;
      case 'inquiry':
        return <InquiryStep />;
      case 'admin':
        return <AdminStep />;
      case 'admin_login':
        return <AdminLoginStep />;
      default:
        return <MainStep />;
    }
  }, [step]);

  return (
    <>
      <GlobalStyle />
      <L.Container>
        <C.ToastContainer $show={showToast}>
          <IoCheckmarkCircle size={18} color="#3182f6" />
          <span>성공적으로 저장되었어요</span>
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
