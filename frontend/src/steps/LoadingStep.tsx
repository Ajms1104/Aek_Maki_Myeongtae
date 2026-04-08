import React from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import { useTalisman } from '../hooks/useTalisman';

const LoadingStep: React.FC = () => {
  const { loadingStep } = useTalisman();
  return (
    <L.Content style={{ justifyContent: 'center', paddingBottom: '60px' }}>
      {/* 분석 카드: 상단 공백을 채우고 진행 상황을 강조 */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        borderRadius: '32px',
        padding: '40px 24px',
        border: '1px solid #f2f4f6',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
        marginBottom: '32px'
      }}>
        <L.Title style={{ fontSize: '20px', marginBottom: '32px' }}>
          명태가 고민을{'\n'}정성스럽게 살펴보고 있어요
        </L.Title>
        
        <div style={{ margin: '20px 0' }}>
          <S.LoadingImage src="/loading_fish.png" alt="로딩 중" style={{ width: '200px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        {[
          { id: 1, label: '고민 살펴보기' },
          { id: 2, label: '마음 정리하기' },
          { id: 3, label: '부적 완성' },
        ].map((item) => (
          <S.StatusChip key={item.id} $visible={loadingStep >= item.id}>
            <S.LoadingCheckIcon $visible={loadingStep >= item.id}>
              <IoCheckmarkCircle />
            </S.LoadingCheckIcon>
            {item.label}
          </S.StatusChip>
        ))}
      </div>
    </L.Content>
  );
};

export default LoadingStep;
