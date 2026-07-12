import React, { useEffect, useState, useRef } from 'react';
import { IoCheckmarkCircle, IoSparklesOutline } from 'react-icons/io5';
import styled, { keyframes } from 'styled-components';
import * as L from '../styles/layoutStyles';
import loading_fish from '../assets/loading_image.png';
import { useTossBanner } from '../hooks/useTossBanner';

const LoadingStep: React.FC = () => {
  const [progress, setProgress] = useState(0);

  // ✅ 토스 광고 배너 연동
  const bannerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !bannerRef.current) return;
    const attached = attachBanner('ait.v2.live.71baf9f8b7fe466d', bannerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: { onAdFailedToRender: (payload) => console.error('로딩 광고 렌더링 실패:', payload) },
    });
    return () => { attached?.destroy(); };
  }, [isInitialized, attachBanner]);

  // 로컬 타이머로 부드러운 가속 시뮬레이션 (85%까지 2.5초에 도달, 그 후 극소 가속)
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      
      setProgress((prev) => {
        if (prev >= 95) {
          // 95% 이상은 극도로 미세하게 증가시키며 대기 (최대 99%)
          return Math.min(99, prev + 0.1);
        }
        
        // 2.5초 동안 부드럽게 85%까지 로딩바를 채움
        const ratio = Math.min(1, elapsed / 2500);
        const nextProgress = Math.round(ratio * 85);
        return Math.max(prev, nextProgress);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 진행도에 따라 로컬 진행 텍스트 단계 연동
  const currentStep = progress < 33 ? 1 : progress < 66 ? 2 : 3;

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
      height: '100%',
      padding: '0 16px 16px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#191f28', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
          명태가 액운을 쫓을{'\n'}
          방법을 고민하고 있어요
        </h2>
        <p style={{ color: '#3182f6', fontSize: '14px', marginTop: '10px', fontWeight: 700 }}>
          [진행 단계: {currentStep}/3]
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
            width: `${progress}%`,
            transition: 'width 0.2s ease' 
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
                backgroundColor: currentStep >= item.id ? '#e8f3ff' : '#f9fafb',
                color: currentStep >= item.id ? '#3182f6' : '#8b95a1',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid',
                borderColor: currentStep >= item.id ? '#3182f6' : '#f2f4f6',
                boxShadow: currentStep === item.id ? '0 4px 12px rgba(49, 130, 246, 0.1)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              <IoCheckmarkCircle size={22} style={{ opacity: currentStep >= item.id ? 1 : 0.2 }} />
              <span style={{ fontSize: '15px', fontWeight: currentStep === item.id ? 800 : 500 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '32px', color: '#adb5bd', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
        <IoSparklesOutline size={14} color="#3182f6" />
        곧 부적이 완성됩니다
      </div>

      {/* 토스 배너 광고 지면 (최하단 정렬) */}
      <div 
        ref={bannerRef} 
        style={{ 
          width: '100%', 
          minHeight: '60px', 
          borderRadius: '16px', 
          overflow: 'hidden',
          border: '1px solid #f2f4f6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
          backgroundColor: '#ffffff',
          marginTop: 'auto',
          flexShrink: 0
        }} 
      />
    </L.Content>
  );
};

export default LoadingStep;
