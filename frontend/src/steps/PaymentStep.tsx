import React, { useState, useCallback } from 'react';
import {
  IoHeart,
  IoChevronForwardOutline,
  IoDiamondOutline,
  IoGiftOutline,
} from 'react-icons/io5';
import styled from 'styled-components';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import * as O from '../styles/overlayStyles';
import * as A from '../styles/animations';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';
import { useUI } from '../hooks/useUI';

// 성공 아이콘 래퍼 - 스타일 안정성 강화
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
  const { handlePaymentComplete } = useTalisman();
  const { openDialog } = useUI();
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<'credit' | 'hidden'>('hidden');

  const handlePayment = useCallback(() => {
    // 1. 내부 성공 상태 전환 (데이터는 아직 업데이트 안함)
    setIsSuccess(true);
  }, []);

  const handleConfirmAndMove = useCallback(() => {
    // 2. 이동 직전에 데이터 업데이트
    handlePaymentComplete(selectedProduct);
    // 3. 이동
    navigateTo('collection');
  }, [selectedProduct, handlePaymentComplete, navigateTo]);

  // 성공 화면을 별도의 변수로 분리하여 렌더링 안정성 확보
  if (isSuccess) {
    return (
      <O.ModalOverlay style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}>
        <O.ModalContent
          style={{
            width: '300px',
            borderRadius: '32px',
            padding: '40px 20px 24px',
          }}
        >
          <SuccessIconWrapper>
            <IoGiftOutline size={50} color="white" />
            <div className="pulse-ring" />
          </SuccessIconWrapper>
          
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#191f28', marginBottom: '8px' }}>
            {selectedProduct === 'hidden' ? '히든 패키지 도착!' : '충전 완료!'}
          </h2>
          <p style={{ fontSize: '15px', color: '#4e5968', lineHeight: '1.5', marginBottom: '32px' }}>
            {selectedProduct === 'hidden'
              ? '신비로운 히든 명태들이\n보관함으로 배달되었어요.'
              : '10 크레딧이 성공적으로\n충전되었습니다.'}
          </p>
          
          <C.MainButton
            onClick={handleConfirmAndMove}
            style={{
              height: '54px',
              fontSize: '16px',
              background: '#3182f6',
            }}
          >
            보관함에서 확인하기
          </C.MainButton>
        </O.ModalContent>
      </O.ModalOverlay>
    );
  }

  return (
    <L.Content style={{ paddingBottom: '34px' }}>
      <div style={{ width: '100%' }}>
        <L.Title style={{ textAlign: 'left', width: '100%', marginBottom: '12px', fontSize: '26px' }}>
          더 특별한 명태를{'\n'} 만나보시겠어요?
        </L.Title>
        <p style={{ width: '100%', color: '#6b7684', lineHeight: '1.6', fontSize: '16px', marginBottom: '24px' }}>
          버려진 비운의 부적부터 시크릿 명태까지{'\n'} 모두 만나보세요.
        </p>

        <div style={{
          width: '100%',
          background: '#f9fafb',
          padding: '18px',
          borderRadius: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <IoHeart color="#f04452" size={20} />
          <span style={{ fontSize: '14px', color: '#4e5968', fontWeight: 600 }}>
            수익금은 개발팀의 간식비로 소중히 사용됩니다.
          </span>
        </div>

        <S.PaymentList style={{ gap: '14px' }}>
          <O.PaymentItem
            $active={selectedProduct === 'hidden'}
            onClick={() => setSelectedProduct('hidden')}
            style={{ padding: '20px', borderRadius: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#f4edff',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IoGiftOutline size={24} color="#a25df5" />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#191f28', marginBottom: '2px' }}>
                  히든 명태 패키지
                </div>
                <div style={{ fontSize: '13px', color: '#a25df5', fontWeight: 800 }}>
                  영구 소장 + 5 크레딧 증정
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#191f28' }}>
              2,000원
            </div>
          </O.PaymentItem>

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
              1,000원
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
        <C.MainButton onClick={handlePayment}>결제하기</C.MainButton>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default PaymentStep;
