import React, { useState } from 'react';
import { IoArchiveOutline, IoSparkles } from 'react-icons/io5';
import styled, { keyframes, css } from 'styled-components';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useUI } from '../hooks/useUI';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { useTalisman } from '../hooks/useTalisman';
import { GRADE_COLORS } from '../constants/talisman';
import type { Grade } from '../types';


const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const cursorBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const ResultTextBox = styled.div`
  position: relative;
  background: #ffffff;
  padding: 22px 24px;
  border-radius: 28px;
  width: 100%;
  border: 1px solid #f2f4f6;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
`;

const TypingCursor = styled.span<{ $visible: boolean }>`
  display: ${(props) => (props.$visible ? 'inline-block' : 'none')};
  width: 2px;
  height: 16px;
  background: #3182f6;
  margin-left: 2px;
  vertical-align: middle;
  animation: ${cursorBlink} 1s infinite;
`;

const AnimatedCardWrapper = styled(S.ResultCardWrapper)<{ $isFlying: boolean }>`
  ${(props) =>
    !props.$isFlying &&
    css`
      animation: ${floatingAnimation} 3s ease-in-out infinite;
    `}
`;

const NewBadge = styled.div<{ $grade: string }>`
  background: ${(props) => {
    if (props.$grade === 'legend') return 'linear-gradient(135deg, #fcc419 0%, #ff922b 100%)';
    if (props.$grade === 'rare') return '#3182f6';
    return '#ffffff';
  }};
  color: ${(props) => (props.$grade === 'common' ? '#191f28' : '#ffffff')};
  padding: 8px 18px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: ${(props) => (props.$grade === 'common' ? '1px solid #e5e8eb' : 'none')};
  animation: ${floatingAnimation} 2s ease-in-out infinite;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px 6px 0;
    border-style: solid;
    border-color: ${(props) => {
      if (props.$grade === 'legend') return '#ff922b transparent transparent';
      if (props.$grade === 'rare') return '#3182f6 transparent transparent';
      return '#ffffff transparent transparent';
    }};
  }
`;

const ResultStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { triggerToast } = useUI();
  const { consultationResult } = useTalisman();
  const [isFlying, setIsFlying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const grade = (consultationResult?.amulet?.grade as Grade) || 'common';
  const isNew = consultationResult?.amulet?.isNew ?? false;
  const theme = GRADE_COLORS[grade] || GRADE_COLORS.common;

  const getImageUrl = () => {
    const path = consultationResult?.amulet?.imageUrl || '/result_image.png';
    if (path.startsWith('http')) return path;
    const host = window.location.hostname;
    // backend 포트가 8080임을 확인
    return `http://${host}:8080${path}`;
  };

  const amuletImageUrl = getImageUrl();
  const comment = consultationResult?.reply ?? '명태가 당신의 걱정을 모두 가져갔어요.';
  const { displayedText } = useTypingEffect(comment, 60);

  const handleSaveCompositeImage = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 생성 실패');

      // 고화질 저장을 위해 캔버스 크기를 크게 설정
      canvas.width = 1000;
      canvas.height = 1600;

      let bgColor = '#fdfbf0'; 
      let borderColor = '#c92a2a'; 

      if (grade === 'rare') {
        bgColor = '#f8f9ff';
        borderColor = '#364fc7';
      } else if (grade === 'legend') {
        bgColor = '#fff9db';
        borderColor = '#fcc419';
      } else if (grade === 'hidden') {
        bgColor = '#fff0f6';
        borderColor = '#d6336c';
      }

      // 1. 진한 황지(부적 전용 종이) 질감 배경 구현
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 고해상도 섬유 질감 (한지 특유의 실느낌)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      for (let i = 0; i < 400; i++) {
        ctx.beginPath();
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() - 0.5) * 40, startY + (Math.random() - 0.5) * 40);
        ctx.stroke();
      }
      
      // 거친 입자 및 세월의 얼룩 (Vignette 효과 추가)
      const vignette = ctx.createRadialGradient(500, 800, 100, 500, 800, 900);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 배경에 희미한 전통 문양 (팔괘/구름) 배치 - 신비감 극대화
      ctx.fillStyle = borderColor;
      ctx.globalAlpha = 0.04;
      ctx.font = '200px serif';
      ctx.textAlign = 'center';
      ctx.fillText('☯', 500, 850); // 중앙 팔괘 문양
      ctx.globalAlpha = 1.0;

      // 3. 수묵화 스타일의 거친 손맛 테두리 (Double Brush)
      const drawMysticBorder = (offset: number, weight: number, alpha: number) => {
        ctx.strokeStyle = borderColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = weight;
        ctx.beginPath();
        let curX = offset;
        let curY = offset;
        ctx.moveTo(curX, curY);
        // 선을 직선이 아닌 미세하게 떨리도록 그림
        for(let i=1; i<=10; i++) {
          const nextX = offset + (canvas.width - offset*2) * (i/10);
          ctx.lineTo(nextX, offset + (Math.random()-0.5)*10);
        }
        for(let i=1; i<=10; i++) {
          const nextY = offset + (canvas.height - offset*2) * (i/10);
          ctx.lineTo(canvas.width - offset + (Math.random()-0.5)*10, nextY);
        }
        for(let i=1; i<=10; i++) {
          const nextX = (canvas.width - offset) - (canvas.width - offset*2) * (i/10);
          ctx.lineTo(nextX, canvas.height - offset + (Math.random()-0.5)*10);
        }
        for(let i=1; i<=10; i++) {
          const nextY = (canvas.height - offset) - (canvas.height - offset*2) * (i/10);
          ctx.lineTo(offset + (Math.random()-0.5)*10, nextY);
        }
        ctx.closePath();
        ctx.stroke();
      };

      drawMysticBorder(45, 18, 0.9);
      drawMysticBorder(75, 4, 0.6);

      // 4. 부적 이미지 (종이에 스며든 느낌을 위해 약간의 투명도와 블렌딩)
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = amuletImageUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      
      const imgSize = 750;
      ctx.save();
      ctx.globalAlpha = 0.95; // 종이 질감이 살짝 비치게
      ctx.drawImage(img, (canvas.width - imgSize) / 2, 100, imgSize, imgSize);
      ctx.restore();

      // 5. 메시지 영역 - 붓글씨의 힘이 느껴지는 배치
      const fontSize = comment.length > 100 ? 40 : 48;
      ctx.fillStyle = '#1a1a1a'; // 진한 먹색
      ctx.font = `900 ${fontSize}px "Noto Serif KR", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const chars = comment.split('');
      let line = '';
      let y = 950;
      const lineHeight = fontSize + 32;

      for (let n = 0; n < chars.length; n++) {
        let testLine = line + chars[n];
        if (ctx.measureText(testLine).width > 700) {
          ctx.fillText(line, 500, y);
          line = chars[n];
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 500, y);

      // 6. 정통 낙관(도장) - 마모된 인감 효과 (Chipped Seal)
      const stampSize = 170;
      const stampX = 730;
      const stampY = 1330;
      
      // 도장 바탕 (불규칙한 외곽선 처리)
      ctx.fillStyle = borderColor;
      ctx.beginPath();
      ctx.rect(stampX, stampY, stampSize, stampSize);
      ctx.fill();
      
      // 도장 훼손 효과 (풍화된 느낌)
      ctx.fillStyle = bgColor;
      for(let i=0; i<30; i++) {
        ctx.beginPath();
        ctx.arc(stampX + Math.random()*stampSize, stampY + (Math.random() < 0.5 ? 0 : stampSize), Math.random()*8, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(stampX + (Math.random() < 0.5 ? 0 : stampSize), stampY + Math.random()*stampSize, Math.random()*8, 0, Math.PI*2);
        ctx.fill();
      }
      
      // 도장 테두리 및 글자
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.strokeRect(stampX + 15, stampY + 15, stampSize - 30, stampSize - 30);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px serif';
      ctx.fillText('액막', stampX + stampSize/2, stampY + 70);
      ctx.fillText('명태', stampX + stampSize/2, stampY + 125);

      // 7. 하단 고정 문구
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.font = 'italic 500 22px serif';
      ctx.fillText('액막이 명태 - 천지신명의 기운을 담아 평안을 기원합니다', 500, 1530);

      // 미세한 먹물 튐 효과 (Ink Splatter)
      ctx.fillStyle = borderColor;
      ctx.globalAlpha = 0.2;
      for(let i=0; i<15; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*3, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 7. 토스 SDK를 이용한 이미지 저장
      const base64Full = canvas.toDataURL('image/png');
      const base64Data = base64Full.split(',')[1];
      const sdk = (window as any).TossPayments;

      if (sdk && typeof sdk.saveBase64Data === 'function') {
        console.log('[Ads] Toss SDK saveBase64Data 호출');
        await sdk.saveBase64Data({
          data: base64Data,
          fileName: `amulet_${Date.now()}.png`,
          mimeType: 'image/png'
        });
        triggerToast('성공적으로 저장되었어요', 'success');
      } else {
        // PC 환경 등 미지원 시 브라우저 다운로드
        console.log('[Ads] 브라우저 기본 다운로드 실행');
        const link = document.createElement('a');
        link.download = `amulet_${Date.now()}.png`;
        link.href = base64Full;
        link.click();
        triggerToast('성공적으로 저장되었어요', 'success');
      }
    } catch (err) {
      console.error('[Ads] 이미지 생성 및 저장 실패:', err);
      triggerToast('이미지 저장에 실패했어요', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <L.Content style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      justifyContent: 'center', 
      paddingBottom: '120px', 
      paddingTop: '100px',
      background: `radial-gradient(circle at 50% 30%, ${theme.bg} 0%, #ffffff 70%)`
    }}>
      
      <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, overflow: 'visible' }}>
        <div style={{ width: '240px', position: 'relative', overflow: 'visible', marginTop: '40px' }}>
          {isNew && (
            <div style={{ position: 'absolute', top: '-55px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
              <NewBadge $grade={grade}>
                <IoSparkles size={14} />
                {grade === 'legend' ? '전설 부적 획득!' : grade === 'rare' ? '희귀 부적 획득!' : '새로운 부적 획득!'}
              </NewBadge>
            </div>
          )}
          <AnimatedCardWrapper $isFlying={isFlying} style={{ width: '100%', maxHeight: '100%', position: 'relative', overflow: 'visible' }}>
            <S.ImageBox 
              $bg="#ffffff"
              $glow={grade === 'legend'} 
              style={{ 
                padding: '24px', 
                border: `2px solid ${theme.sub}`,
                boxShadow: `0 20px 40px ${theme.sub}40`
              }}
            >
              <img src={amuletImageUrl} alt="부적" style={{ width: '100%', height: 'auto', objectFit : 'contain' }} />
            </S.ImageBox>
          </AnimatedCardWrapper>
        </div>
      </div>

      {/* 2. 대사 영역 */}
      <div style={{ flex: 0.8, display: 'flex', alignItems: 'flex-start', minHeight: 0, padding: '0 8px', marginTop: '24px' }}>
        <ResultTextBox style={{ 
          margin: 0, 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflowY: 'auto',
          border: `1px solid ${theme.sub}80`,
        }}>
          <p style={{
            color: '#191f28', // 가독성을 위해 다시 어두운 색상으로 복구
            textAlign: 'center',
            lineHeight: 1.6,
            fontSize: comment.length > 100 ? '14px' : '15px',
            fontWeight: 600,
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}>
            {displayedText}
            <TypingCursor $visible={displayedText.length < comment.length} />
          </p>
        </ResultTextBox>
      </div>

      <C.FixedButtonGroup>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
          <C.MainButton onClick={handleSaveCompositeImage} disabled={isSaving} style={{ flex: 1, height: '54px' }}>
            {isSaving ? '부적 생성 중...' : '부적 소장 및 공유하기'}
          </C.MainButton>
          <button
            onClick={() => {
              if (isFlying) return;
              setIsFlying(true);
              setTimeout(() => navigateTo('collection'), 700);
            }}
            style={{ width: '58px', height: '54px', borderRadius: '18px', border: '2px solid #3182f6', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}
          >
            <IoArchiveOutline size={24} color="#3182f6" />
            <IoSparkles size={10} color="#fcc419" style={{ position: 'absolute', top: '6px', right: '6px' }} />
          </button>
        </div>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default ResultStep;
