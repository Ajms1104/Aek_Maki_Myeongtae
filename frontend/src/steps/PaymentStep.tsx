import React, { useState, useCallback, useEffect } from 'react';
import {
  IoDiamondOutline,
  IoGiftOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoTimeOutline
} from 'react-icons/io5';
import styled, { keyframes, css } from 'styled-components';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import * as O from '../styles/overlayStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';
import { useUI } from '../hooks/useUI';
import { loginWithToss } from '../utils/auth';
import { tokenStorage } from '../utils/api';

const SKU_HIDDEN = 'ait.0000019636.8223c8cb.17d7c52664.7277637768';
const SKU_CREDIT = 'ait.0000019636.26612546.7356f68591.7277541916';
const TEST_AD_REWARD_ID = 'ait.dev.43daa14da3ae487b'; // ✅ 문서에 명시된 공식 테스트 ID로 수정

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

const OrderSummary = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  padding: 14px 18px;
  margin-top: 4px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  &:last-child { margin-bottom: 0; }
  span:first-child { color: #8b95a1; font-size: 13px; }
  span:last-child { color: #4e5968; font-size: 13px; font-weight: 600; }
`;

const ProductCard = styled.div<{ $active: boolean; $disabled?: boolean }>`
  background: #ffffff;
  border: 2px solid ${props => props.$active ? '#3182f6' : '#f2f4f6'};
  border-radius: 20px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(49, 130, 246, 0.1)' : 'none'};
`;

const CooldownBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f2f4f6;
  color: #8b95a1;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  margin-top: 4px;
`;

const PaymentStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { handlePaymentComplete, handleAdReward, hasHiddenPass, lastAdWatchedAt, refreshCollection } = useTalisman();
  const { triggerToast } = useUI();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<'credit' | 'hidden' | 'ad'>(
    hasHiddenPass ? 'credit' : 'hidden'
  );
  const [purchasedProduct, setPurchasedProduct] = useState<'credit' | 'hidden' | 'ad' | null>(null);
  const [cooldownSec, setCooldownSec] = useState<number>(0);

  // 1. 광고 사전 로드 로직 (통합 광고 2.0 ver2)
  useEffect(() => {
    const isSupported = loadFullScreenAd.isSupported();
    const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('ngrok');
    let unregister: (() => void) | null = null;
    let retryTimeout: number | null = null;
    let isMounted = true;

    console.log('[Ads] 통합 광고 지원 여부:', isSupported, 'isDev:', isDev);

    if (!isSupported && !isDev) {
        return;
    }

    const loadAd = () => {
        if (!isMounted) return;
        console.log('[Ads] 광고 로드 시도 중...');
        unregister = loadFullScreenAd({
            options: { adGroupId: TEST_AD_REWARD_ID },
            onEvent: (event) => {
                if (event.type === 'loaded') {
                    console.log('[Ads] 광고 로드 성공');
                    if (isMounted) setIsAdLoaded(true);
                }
            },
            onError: (err: any) => {
                console.error('[Ads] 광고 로드 실패:', err);
                if (isMounted) setIsAdLoaded(false);
                
                // 에러 메시지 토스트 제거 (사용자 요청: 조용히 백그라운드에서 시도)
                // 5초 후 자동 재시도 로직 (마운트 상태 확인 필수)
                retryTimeout = window.setTimeout(() => {
                    if (isMounted) loadAd();
                }, 5000);
            }
        });
    };

    loadAd();

    return () => {
        isMounted = false;
        if (unregister) unregister();
        if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);


  useEffect(() => {
    refreshCollection().catch(console.error);
  }, [refreshCollection]);

  useEffect(() => {
    if (!lastAdWatchedAt) return;
    const updateCooldown = () => {
      const lastWatched = new Date(lastAdWatchedAt).getTime();
      const now = new Date().getTime();
      const diffSec = Math.floor((now - lastWatched) / 1000);
      const remaining = Math.max(0, 600 - diffSec);
      setCooldownSec(remaining);
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastAdWatchedAt]);

  const handlePayment = async () => {
    if (isProcessing) return;
    
    if (!tokenStorage.get()) {
      const loginResult = await loginWithToss();
      if (!loginResult) return;
      await refreshCollection();
      return;
    }

    const type = selectedProduct;
    const sdk = (window as any).TossPayments;
    
    // --- 최신 통합 광고 2.0 ver2 적용 파트 ---
    if (type === 'ad') {
        if (cooldownSec > 0) {
            triggerToast(`${Math.ceil(cooldownSec/60)}분 후에 가능해요.`, 'info');
            return;
        }

        const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('ngrok');
        const isSupported = showFullScreenAd.isSupported();

        if (!isSupported && !isDev) {
            triggerToast(`광고 미지원 환경입니다. (isSupported: ${isSupported})`, 'info');
            return;
        }

        if (!isAdLoaded) {
            triggerToast(`광고가 아직 준비되지 않았습니다. (로드상태: ${isAdLoaded})`, 'info');
            
            // 만약 로드가 안 되어 있다면 강제로 다시 로드 시도 (복구 로직)
            loadFullScreenAd({
                options: { adGroupId: TEST_AD_REWARD_ID },
                onEvent: (e) => { 
                    if (e.type === 'loaded') {
                        setIsAdLoaded(true);
                        triggerToast('광고 로드 성공! 다시 눌러주세요.', 'success');
                    }
                },
                onError: (err: any) => {
                    console.error('[Ads] 즉시 재로드 실패:', err);
                    triggerToast('광고 서버 응답이 없습니다. 잠시 후 시도해 주세요.', 'error');
                }
            });
            return;
        }

        setIsProcessing(true);
        showFullScreenAd({
            options: { adGroupId: TEST_AD_REWARD_ID },
            onEvent: async (event) => {
                switch (event.type) {
                    case 'userEarnedReward':
                        console.log('[Ads] 보상 획득 조건 충족');
                        await handleAdReward();
                        setPurchasedProduct('ad');
                        setIsSuccess(true);
                        break;
                    case 'dismissed':
                        console.log('[Ads] 광고 닫힘');
                        setIsAdLoaded(false);
                        setIsProcessing(false);
                        // 다음 광고를 위해 미리 로드
                        loadFullScreenAd({
                            options: { adGroupId: TEST_AD_REWARD_ID },
                            onEvent: (e) => { if (e.type === 'loaded') setIsAdLoaded(true); },
                            onError: () => setIsAdLoaded(false)
                        });
                        break;
                    case 'failedToShow':
                        triggerToast('광고를 표시할 수 없습니다.', 'error');
                        setIsProcessing(false);
                        break;
                }
            },
            onError: (err) => {
                console.error('[Ads] 광고 표시 중 에러:', err);
                setIsProcessing(false);
            }
        });
        return;
    }

    if (!sdk) {
        triggerToast('토스 페이먼츠 환경이 아닙니다.', 'info');
        return;
    }

    setIsProcessing(true);
    try {
      const iap = sdk.IAP || sdk;
      const sku = type === 'hidden' ? SKU_HIDDEN : SKU_CREDIT;
      let closeIAP: (() => void) | null = null;

      closeIAP = iap.createOneTimePurchaseOrder({
        options: {
          sku,
          processProductGrant: () => true 
        },
        onEvent: async (event: any) => {
          if (event?.type === 'success') {
            await handlePaymentComplete(type as 'credit' | 'hidden');
            setPurchasedProduct(type as 'credit' | 'hidden');
            setIsSuccess(true);
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

  const getPrice = () => {
    if (selectedProduct === 'hidden') return '2,200원';
    if (selectedProduct === 'credit') return '1,100원';
    return '0원';
  };

  const formatCooldown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
          <C.MainButton 
            onClick={() => {
                setIsSuccess(false);
                navigateTo(purchasedProduct === 'hidden' ? 'collection' : 'main');
            }}
            style={{ height: '58px', borderRadius: '18px' }}
          >
            확인
          </C.MainButton>
        </div>
      </O.ModalOverlay>
    );
  }

  return (
    <L.Content style={{ backgroundColor: '#ffffff', padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {isProcessing && (
        <PaymentLoadingOverlay>
          <Spinner />
          <p style={{ color: '#191f28', fontWeight: 700, fontSize: '17px' }}>결제창으로 이동 중</p>
        </PaymentLoadingOverlay>
      )}

      {/* ✅ 과도한 패딩 제거, 바 바로 아래 위치하도록 보정 */}
      <div style={{ padding: '12px 24px 10px', flexShrink: 0 }}>
        <L.Title style={{ textAlign: 'left', fontSize: '24px', fontWeight: 800, margin: 0 }}>
          충전하기
        </L.Title>
        <p style={{ color: '#6b7684', fontSize: '15px', marginTop: '6px' }}>명태의 위로가 더 필요하신가요?</p>
      </div>

      <S.ScrollArea style={{ padding: '10px 20px 140px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <ProductCard $active={selectedProduct === 'hidden'} $disabled={hasHiddenPass} onClick={() => !hasHiddenPass && setSelectedProduct('hidden')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '48px', background: hasHiddenPass ? '#e5e8eb' : '#f4edff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IoGiftOutline size={24} color={hasHiddenPass ? '#adb5bd' : '#a25df5'} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#191f28' }}>히든 부적 패키지</div>
                  <div style={{ fontSize: '12px', color: '#8b95a1' }}>영구 해금 + 5 크레딧</div>
                </div>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: hasHiddenPass ? '#adb5bd' : '#191f28' }}>{hasHiddenPass ? '소유함' : '2,200원'}</div>
            </ProductCard>

            <ProductCard $active={selectedProduct === 'credit'} onClick={() => setSelectedProduct('credit')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '48px', background: '#e8f3ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IoDiamondOutline size={24} color="#3182f6" />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#191f28' }}>10 크레딧 충전</div>
                  <div style={{ fontSize: '12px', color: '#8b95a1' }}>상담 10회 가능</div>
                </div>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#191f28' }}>1,100원</div>
            </ProductCard>

            <ProductCard $active={selectedProduct === 'ad'} $disabled={cooldownSec > 0} onClick={() => setSelectedProduct('ad')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '48px', background: cooldownSec > 0 ? '#f2f4f6' : '#e5f9ed', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IoPlayCircleOutline size={24} color={cooldownSec > 0 ? '#adb5bd' : '#00d082'} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: cooldownSec > 0 ? '#8b95a1' : '#191f28' }}>무료 크레딧 받기</div>
                  {cooldownSec > 0 ? (
                    <CooldownBadge><IoTimeOutline size={12} />대기 시간 {formatCooldown(cooldownSec)}</CooldownBadge>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#6b7684' }}>광고 시청 1회</div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: cooldownSec > 0 ? '#adb5bd' : '#00d082' }}>무료</div>
            </ProductCard>
        </div>
      </S.ScrollArea>

      <C.FixedButtonGroup style={{ backgroundColor: '#ffffff', borderTop: '1px solid #f2f4f6', padding: '16px 24px 34px', flexShrink: 0 }}>
        <OrderSummary>
          <SummaryRow><span>주문 상품</span><span>{selectedProduct === 'hidden' ? '히든 부적 패키지' : selectedProduct === 'credit' ? '10 크레딧 충전' : '무료 크레딧'}</span></SummaryRow>
          <SummaryRow>
            <span>{selectedProduct === 'ad' ? '지급 수단' : '결제 수단'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {selectedProduct === 'ad' ? (
                    <>
                    <IoPlayCircleOutline size={13} color="#00d082" />
                    <span style={{ color: '#00d082', fontSize: '13px' }}>광고 시청</span>
                    </>
                ) : (
                    <>
                    <IoLockClosedOutline size={12} color="#8b95a1" />
                    <span>토스페이</span>
                    </>
                )}
            </div>
          </SummaryRow>
        </OrderSummary>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '12px 0 4px', color: '#3182f6', fontSize: '12px', fontWeight: 600 }}>
          <IoShieldCheckmarkOutline size={14} /><span>안전한 토스 결제 시스템이 적용됩니다</span>
        </div>
        <C.MainButton 
          onClick={handlePayment} 
          disabled={isProcessing || (selectedProduct === 'hidden' && hasHiddenPass) || (selectedProduct === 'ad' && cooldownSec > 0)}
          style={{ height: '62px', borderRadius: '18px', fontSize: '18px' }}
        >
          {isProcessing ? '확인 중...' : (selectedProduct === 'ad' && cooldownSec > 0 ? `${formatCooldown(cooldownSec)} 후 가능` : `${getPrice()} 결제하기`)}
        </C.MainButton>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default PaymentStep;
