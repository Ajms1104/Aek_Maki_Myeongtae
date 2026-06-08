import React, { useState, useRef, useEffect } from 'react';
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
import { getAmuletImage } from '../utils/amuletAssets';
import type { Grade } from '../types';
import { useTossBanner } from '../hooks/useTossBanner';
import { remoteLog } from '../utils/api';
import { saveBase64Data } from '@apps-in-toss/web-bridge';

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
  padding: 20px;
  border-radius: 28px;
  width: 100%;
  border: 1px solid #f2f4f6;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  flex: 1; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  max-height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar { display: none; }
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

  const bannerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !bannerRef.current) return;

    const attached = attachBanner('ait-ad-test-banner-id', bannerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: {
        onAdFailedToRender: (payload) => console.error('광고 렌더링 실패:', payload),
      },
    });

    return () => {
      attached?.destroy();
    };
  }, [isInitialized, attachBanner]);

  const grade = (consultationResult?.amulet?.grade as Grade) || 'common';
  const isNew = consultationResult?.amulet?.isNew ?? false;
  const theme = GRADE_COLORS[grade] || GRADE_COLORS.common;

  const displayImageUrl = getAmuletImage(consultationResult?.amulet?.imageUrl || '', 'ui');
  const highResImageUrl = getAmuletImage(consultationResult?.amulet?.imageUrl || '', 'high-res');

  const comment = consultationResult?.reply ?? '명태가 당신의 걱정을 모두 가져갔어요.';
  const { displayedText } = useTypingEffect(comment, 60);

  const handleSaveCompositeImage = async () => {
    if (isSaving) return;
    setIsSaving(true);
    remoteLog('[Canvas] 마스터피스 정통 부적 합성 시작');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context 생성 실패');

      canvas.width = 1000;
      canvas.height = 1800;

      const inkRed = '#b91c1c'; 
      const goldBase = '#fcd34d'; 
      const paperLight = '#fff9db';

      // --- [1. 배경] ---
      const grad = ctx.createRadialGradient(500, 700, 100, 500, 900, 1200);
      grad.addColorStop(0, paperLight);
      grad.addColorStop(0.6, goldBase);
      grad.addColorStop(1, '#f97316'); 
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- [2. 붓터치 함수] ---
      const drawBrush = (x: number, y: number, size: number, alpha = 1) => {
        ctx.save();
        ctx.fillStyle = inkRed;
        ctx.globalAlpha = (0.5 + Math.random() * 0.5) * alpha;
        ctx.beginPath();
        ctx.arc(x + (Math.random()-0.5)*size*0.2, y + (Math.random()-0.5)*size*0.2, size * (0.7 + Math.random()*0.4), 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      };

      const drawBrushLine = (x1: number, y1: number, x2: number, y2: number, size: number, alpha = 1) => {
        const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        const steps = dist / 1.5;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            drawBrush(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, size, alpha);
        }
      };

      // --- [3. 상단: 정통 생쪽매듭 & 노리개 술] ---
      const drawMasterKnot = (cx: number, cy: number) => {
        ctx.save();
        drawBrushLine(cx-25, cy-25, cx+25, cy+25, 8);
        drawBrushLine(cx+25, cy-25, cx-25, cy+25, 8);
        const drawPetal = (ang: number, dist: number, r: number) => {
            const px = cx + Math.cos(ang) * dist;
            const py = cy + Math.sin(ang) * dist;
            for(let i=0; i<r*4; i++) {
                const a = (Math.PI*2*i) / (r*4);
                drawBrush(px + Math.cos(a)*r, py + Math.sin(a)*r, 6, 0.9);
            }
        };
        drawPetal(0, 55, 30);
        drawPetal(Math.PI/2, 55, 30);
        drawPetal(Math.PI, 55, 30);
        drawPetal(-Math.PI/2, 55, 30);

        for(let i=0; i<18; i++) {
            const offsetX = (i - 9) * 4;
            const len = 220 + Math.random() * 60;
            for(let t=0; t<=1; t+=0.02) {
                const tx = cx + offsetX + Math.sin(t*5 + i)*5;
                const ty = cy + 40 + t * len;
                drawBrush(tx, ty, 3, 0.5 - t*0.3);
            }
        }
        for(let side of [-1, 1]) {
            for(let i=0; i<4; i++) {
                const startX = cx + (side * 40);
                const endX = cx + (side * 450);
                const cpX = cx + (side * 200);
                const cpY = cy - 120 + (i * 35);
                for(let t=0; t<=1; t+=0.01) {
                    const tx = (1-t)**2 * startX + 2*(1-t)*t * cpX + t**2 * endX;
                    const ty = (1-t)**2 * cy + 2*(1-t)*t * cpY + t**2 * (cy + 180 + i*25);
                    drawBrush(tx, ty, 4, 0.4);
                }
            }
        }
        ctx.restore();
      };
      drawMasterKnot(500, 160);

      // --- [4. 하단: 정통 청해파(靑海波) 문양] ---
      const drawChunghaepaMaster = () => {
        const startY = 1600;
        const r = 55;
        const gapX = 85;
        const gapY = 38;
        for (let row = 0; row < 7; row++) {
            const y = startY + row * gapY;
            const offsetX = (row % 2) * (gapX / 2);
            for (let x = -100; x <= 1100; x += gapX) {
                const curX = x + offsetX;
                ctx.save();
                ctx.beginPath();
                ctx.arc(curX, y, r, Math.PI, Math.PI * 2);
                ctx.fillStyle = goldBase;
                ctx.fill();
                for(let subR = r; subR >= 15; subR -= 14) {
                    const steps = subR * 1.5;
                    for(let i=0; i<=steps; i++) {
                        const angle = Math.PI + (Math.PI * i / steps);
                        const px = curX + Math.cos(angle) * subR;
                        const py = y + Math.sin(angle) * subR;
                        drawBrush(px, py, 4, 0.8 - row*0.1);
                    }
                }
                ctx.restore();
            }
        }
      };
      drawChunghaepaMaster();

      // --- [5. 부적 이미지 합성] ---
      const imgRes = await fetch(highResImageUrl, { headers: { 'ngrok-skip-browser-warning': '69420' } });
      const imgBlob = await imgRes.blob();
      const objectUrl = URL.createObjectURL(imgBlob);
      const img = new Image();
      img.src = objectUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, 225, 260, 550, 550);
      ctx.restore();
      URL.revokeObjectURL(objectUrl);

      // --- [6. 텍스트 필사] ---
      const fontSize = 48;
      ctx.font = `900 ${fontSize}px "Noto Serif KR", serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = inkRed;

      const wrapText = (text: string, maxWidth: number) => {
        const chars = text.split('');
        const lines = [];
        let currentLine = '';
        for (let n = 0; n < chars.length; n++) {
          let testLine = currentLine + chars[n];
          if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine);
            currentLine = chars[n];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      const lines = wrapText(comment, 680);
      const startY = 980; 
      const lineHeight = fontSize + 35;

      lines.forEach((line, i) => {
        ctx.save();
        ctx.shadowColor = 'rgba(185, 28, 28, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText(line, 500, startY + i * lineHeight);
        ctx.restore();
      });

      // --- [7. 낙관] ---
      const stampX = 720;
      const stampY = 1520;
      const stampSize = 180;
      ctx.save();
      ctx.fillStyle = inkRed;
      ctx.globalAlpha = 0.95;
      ctx.fillRect(stampX, stampY, stampSize, stampSize);
      ctx.globalCompositeOperation = 'destination-out';
      for(let i=0; i<40; i++) {
        ctx.beginPath();
        ctx.arc(stampX + Math.random()*stampSize, stampY + (Math.random() < 0.5 ? 0 : stampSize), Math.random()*12, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px serif';
      ctx.textAlign = 'center';
      ctx.fillText('액막', stampX + stampSize/2, stampY + 75);
      ctx.fillText('명태', stampX + stampSize/2, stampY + 135);
      ctx.restore();

      // --- [8. 저장] ---
      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      try {
        await saveBase64Data({
          data: base64Data,
          fileName: `myeongtae_amulet_${Math.floor(Date.now()/1000)}.png`,
          mimeType: 'image/png'
        });
        triggerToast('영험한 복 부적이 저장되었어요 🐟', 'success');
      } catch (e: any) {
        const link = document.createElement('a');
        link.download = `talisman.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        triggerToast('부적이 저장되었습니다', 'success');
      }
    } catch (err: any) {
      console.error(err);
      triggerToast('부적 생성에 실패했어요', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <L.Content style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: `radial-gradient(circle at 50% 30%, ${theme.bg} 0%, #ffffff 70%)`,
      padding: '0 20px', 
      overflow: 'hidden', 
      justifyContent: 'flex-start'
    }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '65px', marginBottom: '20px' }}>
        <div style={{ width: '190px', position: 'relative' }}>
          {isNew && (
            <div style={{ position: 'absolute', top: '-45px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
              <NewBadge $grade={grade}>
                <IoSparkles size={14} />
                {grade === 'legend' ? '전설 부적!' : grade === 'rare' ? '희귀 부적!' : '새로운 부적!'}
              </NewBadge>
            </div>
          )}
          <AnimatedCardWrapper $isFlying={isFlying}>
            <S.ImageBox $bg="#ffffff" $glow={grade === 'legend'} style={{ padding: '16px', border: `2px solid ${theme.sub}`, boxShadow: `0 20px 40px ${theme.sub}40` }}>
              <img src={displayImageUrl} alt="부적" style={{ width: '100%', height: 'auto', objectFit : 'contain' }} />
            </S.ImageBox>
          </AnimatedCardWrapper>
        </div>
      </div>

      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: '16px' }}>
        <ResultTextBox style={{ border: `1px solid ${theme.sub}80` }}>
          <p style={{ color: '#191f28', textAlign: 'center', lineHeight: 1.6, fontSize: comment.length > 120 ? '13px' : '15px', fontWeight: 600, margin: 0, whiteSpace: 'pre-wrap' }}>
            {displayedText}
            <TypingCursor $visible={displayedText.length < comment.length} />
          </p>
        </ResultTextBox>
      </div>

      <div style={{ flexShrink: 0, width: '100%', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <C.MainButton onClick={handleSaveCompositeImage} disabled={isSaving} style={{ flex: 1, height: '54px' }}>
              {isSaving ? '준비 중...' : '부적 소장 및 공유하기'}
            </C.MainButton>
            <button
                onClick={() => { if (!isFlying) { setIsFlying(true); setTimeout(() => navigateTo('collection'), 700); } }}
                style={{ width: '56px', height: '54px', borderRadius: '18px', border: '2px solid #3182f6', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
                <IoArchiveOutline size={24} color="#3182f6" />
            </button>
          </div>
          <div 
            ref={bannerRef} 
            style={{ width: '100%', height: '96px', background: '#f9fafb', borderRadius: '16px', overflow: 'hidden' }} 
          />
      </div>
    </L.Content>
  );
};

export default ResultStep;
