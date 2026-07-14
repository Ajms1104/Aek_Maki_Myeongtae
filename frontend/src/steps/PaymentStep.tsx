import React, { useState, useEffect, useRef } from 'react';
import {
  IoDiamondOutline,
  IoGiftOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import styled, { keyframes } from 'styled-components';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import * as O from '../styles/overlayStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';
import { useUI } from '../hooks/useUI';
import { loginWithToss } from '../utils/auth';
import { tokenStorage, claimViralReward } from '../utils/api';
import { useTossBanner } from '../hooks/useTossBanner';
import { contactsViral } from '@apps-in-toss/web-framework';

const SKU_HIDDEN = 'ait.0000019636.8223c8cb.17d7c52664.7277637768';
const SKU_CREDIT = 'ait.0000019636.26612546.7356f68591.7277541916';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PaymentLoadingOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f2f4f6;
  border-top: 4px solid #3182f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const ProductCard = styled.div<{ $active: boolean; $disabled?: boolean }>`
  background: #ffffff;
  border: 2px solid ${props => props.$active ? '#3182f6' : '#f2f4f6'};
  border-radius: 20px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.$disabled ? 0.5 : 1};
`;

const PaymentStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { handlePaymentComplete, hasHiddenPass, refreshCollection, setJustUnlockedHidden, credits } = useTalisman();
  const { triggerToast } = useUI();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isViralProcessing, setIsViralProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<'credit' | 'hidden'>(
    hasHiddenPass ? 'credit' : 'hidden'
  );
  const [purchasedProduct, setPurchasedProduct] = useState<'credit' | 'hidden' | null>(null);

  // 🐟 친구 초대 공유 리워드 브릿지 핸들러
  const handleShareViral = () => {
    if (isViralProcessing) return;
    
    if (!tokenStorage.get()) {
      loginWithToss().then(() => refreshCollection());
      return;
    }

    try {
      setIsViralProcessing(true);
      const cleanup = contactsViral({
        options: { moduleId: '9656bdde-b8b8-493d-bc5c-7a7daa4dca59' },
        onEvent: async (event) => {
          if (event.type === 'sendViral') {
            try {
              const res = await claimViralReward();
              if (res && res.success) {
                await refreshCollection();
                triggerToast('🎉 친구 공유 완료 보상으로 2 크레딧이 지급되었습니다!', 'success');
              }
            } catch (err: any) {
              console.error('공유 보상 지급 API 에러:', err);
              const msg = err?.message || '이미 오늘 한도를 채웠거나 에러가 발생했어요.';
              triggerToast(msg, 'error');
            }
          } else if (event.type === 'close') {
            setIsViralProcessing(false);
            cleanup();
          }
        },
        onError: (err) => {
          console.error('공유 브릿지 에러:', err);
          setIsViralProcessing(false);
          cleanup?.();
        }
      });
    } catch (err) {
      console.error('contactsViral 실행 실패:', err);
      setIsViralProcessing(false);
    }
  };

  // 실시간 관리자 지급 상태 감지용 레퍼런스
  const prevHiddenRef = useRef(hasHiddenPass);
  const prevCreditsRef = useRef(credits);

  // ✅ 토스 광고 배너 연동
  const bannerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    prevHiddenRef.current = hasHiddenPass;
    prevCreditsRef.current = credits;
  }, []);

  // 2초 간격 백엔드 동기화 폴링 루프
  useEffect(() => {
    if (isSuccess || isProcessing) return;

    const interval = setInterval(async () => {
      try {
        await refreshCollection();
      } catch (err) {
        console.error('[PaymentStep Polling Error]', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [refreshCollection, isSuccess, isProcessing]);

  // Context 전역 변수 변화 실시간 트래킹 및 보상 지급 연출
  useEffect(() => {
    // 1. 히든 해금 실시간 감지 -> 해금 이펙트 페이지로 워프
    if (!prevHiddenRef.current && hasHiddenPass) {
      prevHiddenRef.current = true;
      setJustUnlockedHidden(true); // 보관함 이동 시 8초 웅장한 봉인 해금 이펙트 자동 활성화
      setPurchasedProduct('hidden');
      setIsSuccess(true);
      triggerToast('🎉 히든 부적 패키지가 실시간으로 해금되었습니다!', 'success');
    }

    // 2. 크레딧 실시간 지급 감지 -> 성공 팝업 워프
    if (credits > prevCreditsRef.current && prevCreditsRef.current !== 0) {
      const diff = credits - prevCreditsRef.current;
      prevCreditsRef.current = credits;
      setPurchasedProduct('credit');
      setIsSuccess(true);
      triggerToast(`🐟 ${diff} 크레딧이 실시간 지급되었습니다!`, 'success');
    } else if (credits !== prevCreditsRef.current) {
      prevCreditsRef.current = credits;
    }
  }, [hasHiddenPass, credits, setJustUnlockedHidden, triggerToast]);

  useEffect(() => {
    if (!isInitialized || !bannerRef.current) return;
    const attached = attachBanner('ait.v2.live.71baf9f8b7fe466d', bannerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: { onAdFailedToRender: (payload) => console.error('충전소 광고 렌더링 실패:', payload) },
    });
    return () => { attached?.destroy(); };
  }, [isInitialized, attachBanner]);

  useEffect(() => {
    refreshCollection().catch(console.error);
  }, [refreshCollection]);

  // 보상 지급 및 성공 화면 표시 공통 함수
  const completeReward = async (type: 'credit' | 'hidden') => {
    await handlePaymentComplete(type);
    
    setPurchasedProduct(type);
    setIsSuccess(true);
    setIsProcessing(false);
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    
    if (!tokenStorage.get()) {
      const loginResult = await loginWithToss();
      if (!loginResult) return;
      await refreshCollection();
      return;
    }

    // 일반 결제 로직
    const sdk = (window as any).TossPayments;
    if (!sdk) { triggerToast('토스 페이먼츠 환경이 아닙니다.', 'info'); return; }

    setIsProcessing(true);
    try {
      const iap = sdk.IAP || sdk;
      const sku = selectedProduct === 'hidden' ? SKU_HIDDEN : SKU_CREDIT;
      let closeIAP: (() => void) | null = null;

      closeIAP = iap.createOneTimePurchaseOrder({
        options: { sku, processProductGrant: () => true },
        onEvent: async (event: any) => {
          if (event?.type === 'success') {
            await completeReward(selectedProduct as 'credit' | 'hidden');
            if (closeIAP) closeIAP();
          }
        },
        onError: () => {
          triggerToast('결제가 중단되었습니다.', 'info');
          setIsProcessing(false);
          if (closeIAP) closeIAP();
        }
      });
    } catch (err) {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <O.ModalOverlay style={{ background: '#ffffff', zIndex: 3000 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px' }}>
          <div style={{ width: '72px', height: '72px', background: '#e5f9ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <IoCheckmarkCircle size={40} color="#00d082" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#191f28', marginBottom: '12px' }}>지급 완료</h2>
          <p style={{ fontSize: '15px', color: '#4e5968', textAlign: 'center', lineHeight: '1.6', marginBottom: '40px' }}>
            {purchasedProduct === 'hidden' 
              ? '히든 부적이 무사히 도착했어요.\n보관함에서 확인해보세요!' 
              : '상품이 성공적으로 지급되었습니다.\n지금 바로 확인해보세요!'}
          </p>
          <C.MainButton onClick={() => { setIsSuccess(false); navigateTo(purchasedProduct === 'hidden' ? 'collection' : 'main'); }} style={{ height: '58px', borderRadius: '18px' }}>
            확인
          </C.MainButton>
        </div>
      </O.ModalOverlay>
    );
  }

  return (
    <L.Content style={{ backgroundColor: '#ffffff', padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {isProcessing && (
        <PaymentLoadingOverlay><Spinner /><p style={{ color: '#191f28', fontWeight: 700, fontSize: '17px' }}>결제창으로 이동 중</p></PaymentLoadingOverlay>
      )}

      <div style={{ padding: '12px 24px 10px', flexShrink: 0 }}>
        <L.Title style={{ textAlign: 'left', fontSize: '24px', fontWeight: 800, margin: 0 }}>충전하기</L.Title>
        <p style={{ color: '#6b7684', fontSize: '15px', marginTop: '6px' }}>명태의 위로가 더 필요하신가요?</p>
      </div>

      <S.ScrollArea style={{ padding: '10px 20px 170px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 🐟 무료 혜택: 친구 공유 리워드 */}
            <ProductCard $active={false} onClick={handleShareViral} style={{ border: '2px dashed #3182f6', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '48px', background: '#e5f9ed', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IoGiftOutline size={24} color="#00d082" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#191f28' }}>친구에게 공유하기</div>
                  <div style={{ fontSize: '11px', color: '#6b7684', fontWeight: 600 }}>공유 완료 시 크레딧 지급 (하루 최대 5회)</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#3182f6', background: '#e8f3ff', padding: '6px 10px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                +2 크레딧
              </div>
            </ProductCard>

            <ProductCard $active={selectedProduct === 'hidden'} $disabled={hasHiddenPass} onClick={() => !hasHiddenPass && setSelectedProduct('hidden')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '48px', background: hasHiddenPass ? '#e5e8eb' : '#f4edff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IoGiftOutline size={24} color={hasHiddenPass ? '#adb5bd' : '#a25df5'} /></div>
                <div><div style={{ fontSize: '16px', fontWeight: 700, color: '#191f28' }}>히든 부적 패키지</div><div style={{ fontSize: '12px', color: '#8b95a1' }}>영구 해금 + 5 크레딧</div></div>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: hasHiddenPass ? '#adb5bd' : '#191f28' }}>{hasHiddenPass ? '소유함' : '2,200원'}</div>
            </ProductCard>

            <ProductCard $active={selectedProduct === 'credit'} onClick={() => setSelectedProduct('credit')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '48px', background: '#e8f3ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IoDiamondOutline size={24} color="#3182f6" /></div>
                <div><div style={{ fontSize: '16px', fontWeight: 700, color: '#191f28' }}>10 크레딧 충전</div><div style={{ fontSize: '12px', color: '#8b95a1' }}>상담 10회 가능</div></div>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#191f28' }}>1,100원</div>
            </ProductCard>

            <div style={{ 
              marginTop: '6px', 
              padding: '10px 14px', 
              background: '#f9fafb', 
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: '#6b7684', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                팁: 매일 처음 접속할 때마다<br />
                명태가 <span style={{ color: '#3182f6', fontWeight: 800 }}>1 크레딧</span>을 선물로 드려요! 🐟
              </p>
            </div>

        </div>
      </S.ScrollArea>

      <C.FixedButtonGroup style={{ backgroundColor: '#ffffff', borderTop: '1px solid #f2f4f6', padding: '16px 24px 32px', flexShrink: 0, flexDirection: 'column', gap: '10px' }}>
        {/* 토스 배너 광고 지면 (결제 버튼 클릭 실수 유도용 배치) */}
        <div 
          ref={bannerRef} 
          style={{ 
            width: '100%', 
            minHeight: '64px', 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: '1px solid #f2f4f6',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
            backgroundColor: '#ffffff'
          }} 
        />
        <C.MainButton onClick={handlePayment} disabled={isProcessing || (selectedProduct === 'hidden' && hasHiddenPass)} style={{ height: '62px', borderRadius: '18px', fontSize: '18px' }}>
          {isProcessing ? '확인 중...' : `결제 및 충전하기`}
        </C.MainButton>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default PaymentStep;
