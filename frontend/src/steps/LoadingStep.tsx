import React from 'react';
import { IoCheckmarkCircle, IoSparklesOutline } from 'react-icons/io5';
import styled, { keyframes } from 'styled-components';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import { useTalisman } from '../hooks/useTalisman';
import loading_fish from '../assets/loading_image.png';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const LoadingStatus = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 6px;
  background: #f2f4f6;
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div<{ $step: number }>`
  height: 100%;
  background: #3182f6;
  width: ${props => (props.$step / 3) * 100}%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LoadingStep: React.FC = () => {
  const { loadingStep } = useTalisman();

  console.log('[LoadingStep] Rendering, step:', loadingStep);

  const statusItems = [
    { id: 1, label: '액운을 분류하는 중' },
    { id: 2, label: '고민을 담은 부적 빚는 중' },
    { id: 3, label: '명태의 기운을 불어넣는 중' },
  ];

  return (
    <L.Content style={{ 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#191f28', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
          명태가 액운을 쫓을{'\n'}
          방법을 고민하고 있어요
        </h2>
        <p style={{ color: '#3182f6', fontSize: '14px', marginTop: '10px', fontWeight: 700 }}>
          [진행 단계: {loadingStep}/3]
        </p>
      </div>

      <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
        <img
          src={loading_fish}
          alt="분석 중"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
        <div style={{ width: '240px', height: '8px', background: '#f2f4f6', borderRadius: '100px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ 
            height: '100%', 
            background: '#3182f6', 
            width: `${(loadingStep / 3) * 100}%`,
            transition: 'width 0.5s ease' 
          }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', alignItems: 'center' }}>
          {statusItems.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                width: '260px', 
                padding: '16px 20px',
                borderRadius: '20px',
                backgroundColor: loadingStep >= item.id ? '#e8f3ff' : '#f9fafb',
                color: loadingStep >= item.id ? '#3182f6' : '#8b95a1',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid',
                borderColor: loadingStep >= item.id ? '#3182f6' : '#f2f4f6',
                boxShadow: loadingStep === item.id ? '0 4px 12px rgba(49, 130, 246, 0.1)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              <IoCheckmarkCircle size={22} style={{ opacity: loadingStep >= item.id ? 1 : 0.2 }} />
              <span style={{ fontSize: '15px', fontWeight: loadingStep === item.id ? 800 : 500 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', color: '#adb5bd', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IoSparklesOutline size={14} color="#3182f6" />
        곧 부적이 완성됩니다
      </div>
    </L.Content>
  );
};

export default LoadingStep;
