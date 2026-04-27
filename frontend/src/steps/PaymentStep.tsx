import React, { useState, useCallback } from 'react';
import {
  IoHeart,
  IoChevronForwardOutline,
  IoDiamondOutline,
  IoGiftOutline,
  IoPlayCircleOutline,
} from 'react-icons/io5';
// IntegratedAd 제거 (라이브러리 버전 불일치 에러 방지)
import styled from 'styled-components';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import * as O from '../styles/overlayStyles';
import * as A from '../styles/animations';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';
import { useUI } from '../hooks/useUI';

// 토스 광고 SDK 타입 정의 및 안전한 호출을 위한 헬퍼
const showRewardAd = async () => {
  // @ts-ignore - 토스 웹 프레임워크 SDK가 전역 window 객체에 주입됩니다.
  const tossAds = window.TossPayments?.loadIntegratedAd;

  if (!tossAds) {
    console.warn('[Ads] 토스 광고 SDK를 찾을 수 없습니다. Mock 모드로 전환합니다.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  }

  try {
    const ad = await tossAds({
      adUnitId: 'ait-ad-test-rewarded-id', // 보상형 광고 테스트 ID
    });
    await ad.show();
    return true;
  } catch (err) {
    console.error('[Ads] 광고 재생 실패:', err);
    throw err;
  }
};

// 토스 인앱 결제 호출 헬퍼
const requestIAP = async (productType: 'credit' | 'hidden', onGrant: () => Promise<void>) => {
  // @ts-ignore
  const iap = window.TossPayments?.createOneTimePurchaseOrder;

  if (!iap) {
    console.warn('[IAP] 토스 결제 SDK를 찾을 수 없습니다. Mock 모드로 전환합니다.');
    await new Promise(resolve => setTimeout(resolve, 1500));
    await onGrant();
    return;
  }

  try {
    // 상품 타입에 따른 SKU (실제 콘솔 등록된 ID 적용)
    const productId = productType === 'hidden' 
      ? 'ait.0000019636.8223c8cb.17d7c52664.7277637768' 
      : 'ait.0000019636.26612546.7356f68591.7277541916';

    await iap({
      productId,
      onGrant: async (orderId: string) => {
        console.log(`[IAP] 결제 성공, 상품 지급 시작: ${orderId}`);
        await onGrant(); // 서버/상태 업데이트 로직 실행
        // @ts-ignore - 지급 완료 통보
        await window.TossPayments?.completeProductGrant?.(orderId);
      }
    });
  } catch (err) {
    console.error('[IAP] 결제 실패:', err);
    throw err;
  }
};

const SuccessIconWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #3182f6 0%, #a25df5 100%);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 15px 30px rgba(49, 130, 246, 0.2);

  .pulse-ring {
    position: absolute;
    inset: -8px;
    border: 2px solid rgba(49, 130, 246, 0.3);
    border-radius: 38px;
    animation: ${A.pulse} 2s infinite;
  }
`;

const PaymentStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { handlePaymentComplete, handleAdReward, talismanData } = useTalisman();
  const { openDialog } = useUI();
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<'credit' | 'hidden' | 'ad'>('hidden');
  const [isAdLoading, setIsAdLoading] = useState(false);

  // 히든 부적 구매 여부 확인 (전체 부적 중 legend 등급이 하나라도 잠금 해제되어 있는지 또는 별도 플래그 확인)
  const isHiddenPurchased = talismanData.some(t => t.grade === 'legend' && t.unlocked);

  const handlePayment = useCallback(async () => {
    if (selectedProduct === 'hidden' && isHiddenPurchased) {
      openDialog('알림', '이미 히든 명태 패키지를 보유하고 있습니다.');
      return;
    }

    if (selectedProduct === 'ad') {
      try {
        setIsAdLoading(true);

        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach(audio => audio.pause());

        await showRewardAd();
        
        handleAdReward();
        setIsSuccess(true);

        allAudios.forEach(audio => audio.play().catch(() => {}));
      } catch (error) {
        console.error('광고 로드 실패:', error);
        openDialog('알림', '광고를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsAdLoading(false);
      }
      return;
    }

    // 일반 결제 처리
    try {
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(audio => audio.pause());

      await requestIAP(selectedProduct as 'credit' | 'hidden', async () => {
        handlePaymentComplete(selectedProduct as 'credit' | 'hidden');
        setIsSuccess(true);
      });

      allAudios.forEach(audio => audio.play().catch(() => {}));
    } catch (err) {
      console.error('결제 오류:', err);
      openDialog('알림', '결제 처리 중 오류가 발생했습니다.');
    }
  }, [selectedProduct, isHiddenPurchased, handlePaymentComplete, handleAdReward, openDialog]);

  const handleConfirmAndMove = useCallback(() => {
    if (selectedProduct !== 'ad' && selectedProduct !== 'hidden') {
      // 소모성 크레딧 상품만 여기서 추가 (히든은 handlePaymentComplete에서 이미 처리됨)
      // 실제로는 requestIAP 내부 콜백에서 모든 처리를 하는 것이 안전합니다.
    }
    navigateTo('collection');
  }, [selectedProduct, navigateTo]);

  // 성공 화면... (중략)

  return (
    <L.Content style={{ paddingBottom: '34px' }}>
      <div style={{ width: '100%' }}>
        <L.Title style={{ textAlign: 'left', width: '100%', marginBottom: '12px', fontSize: '26px' }}>
          더 특별한 명태를{'\n'} 만나보시겠어요?
        </L.Title>
        {/* ... (생략) ... */}

        <S.PaymentList style={{ gap: '14px' }}>
          <O.PaymentItem
            $active={selectedProduct === 'hidden'}
            onClick={() => !isHiddenPurchased && setSelectedProduct('hidden')}
            style={{ 
              padding: '20px', 
              borderRadius: '24px',
              opacity: isHiddenPurchased ? 0.6 : 1,
              cursor: isHiddenPurchased ? 'default' : 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: isHiddenPurchased ? '#f2f4f6' : '#f4edff',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IoGiftOutline size={24} color={isHiddenPurchased ? '#adb5bd' : '#a25df5'} />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: isHiddenPurchased ? '#8b95a1' : '#191f28', marginBottom: '2px' }}>
                  히든 명태 패키지 {isHiddenPurchased && '(구매 완료)'}
                </div>
                <div style={{ fontSize: '13px', color: isHiddenPurchased ? '#adb5bd' : '#a25df5', fontWeight: 800 }}>
                  영구 소장 + 5 크레딧 증정
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: isHiddenPurchased ? '#adb5bd' : '#191f28' }}>
              {isHiddenPurchased ? '소유함' : '2,200원'}
            </div>
          </O.PaymentItem>
          {/* ... 나머지 상품들 ... */}

          <O.PaymentItem
            $active={selectedProduct === 'credit'}
            onClick={() => setSelectedProduct('credit')}
            style={{ padding: '20px', borderRadius: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#e8f3ff',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IoDiamondOutline size={24} color="#3182f6" />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#191f28', marginBottom: '2px' }}>
                  10 크레딧 충전
                </div>
                <div style={{ fontSize: '13px', color: '#8b95a1', fontWeight: 600 }}>
                  고민 분석 10회 가능
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#191f28' }}>
              1,100원
            </div>
          </O.PaymentItem>

          <O.PaymentItem
            $active={selectedProduct === 'ad'}
            onClick={() => setSelectedProduct('ad')}
            style={{ padding: '20px', borderRadius: '24px', borderStyle: selectedProduct === 'ad' ? 'solid' : 'dashed', borderColor: selectedProduct === 'ad' ? '#3182f6' : '#e5e8eb' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#e5f9ed',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IoPlayCircleOutline size={24} color="#00d082" />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#191f28', marginBottom: '2px' }}>
                  광고 보고 1 크레딧 받기
                </div>
                <div style={{ fontSize: '13px', color: '#00d082', fontWeight: 800 }}>
                  무료 충전
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#00d082' }}>
              FREE
            </div>
          </O.PaymentItem>

          <div style={{
            padding: '8px 12px',
            fontSize: '14px',
            color: '#8b95a1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '4px',
          }}>
            <span>결제 수단</span>
            <span
              style={{ display: 'flex', alignItems: 'center', color: '#4e5968', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => openDialog('결제 수단', '현재 토스페이만 지원됩니다.')}
            >
              토스페이 <IoChevronForwardOutline size={16} />
            </span>
          </div>
        </S.PaymentList>
      </div>

      <div style={{ flex: 1 }} />

      <C.FixedButtonGroup>
        <C.MainButton onClick={handlePayment} disabled={isAdLoading}>
          {isAdLoading ? '광고 불러오는 중...' : selectedProduct === 'ad' ? '광고 보고 받기' : '결제하기'}
        </C.MainButton>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default PaymentStep;
