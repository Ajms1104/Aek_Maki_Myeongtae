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
  ${(props) => !props.$isFlying && css`animation: ${floatingAnimation} 3s ease-in-out infinite;`}
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
    const attached = attachBanner('ait.v2.live.71baf9f8b7fe466d', bannerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: { onAdFailedToRender: (payload) => console.error('광고 렌더링 실패:', payload) },
    });
    return () => { attached?.destroy(); };
  }, [isInitialized, attachBanner]);

  const grade = (consultationResult?.amulet?.grade as Grade) || 'common';
  const isNew = consultationResult?.amulet?.isNew ?? false;
  const theme = GRADE_COLORS[grade] || GRADE_COLORS.common;
  const highResImageUrl = getAmuletImage(consultationResult?.amulet?.imageUrl || '', 'high-res');
  const comment = consultationResult?.reply ?? '명태가 당신의 걱정을 모두 가져갔어요.';
  
  // UI 출력용 문자열 처리 (키워드 부분 제거)
  const displayComment = comment.replace(/\[키워드:\s*.+?\]/g, '').trim();
  const { displayedText } = useTypingEffect(displayComment, 60);

  const handleSaveCompositeImage = async (isDebug = false) => {
    if (isSaving && !isDebug) return;
    if (!isDebug) setIsSaving(true);
    remoteLog('[Canvas] 정통 부적 합성 시작 (프리미엄 퀄리티)');
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context 생성 실패');
      
      canvas.width = 1000; 
      canvas.height = 1200;
      
      const targetGrade = isDebug ? 'legend' : grade;
      const inkRed = '#b91c1c'; 
      const goldBase = '#fcd34d'; 
      
      // 1. 등급별 배경 그라데이션 다변화
      const grad = ctx.createRadialGradient(500, 500, 50, 500, 800, 1200);
      if (targetGrade === 'legend') {
        grad.addColorStop(0, '#fffbeb'); grad.addColorStop(0.5, '#fde68a'); grad.addColorStop(1, '#f59e0b');
      } else if (targetGrade === 'rare') {
        grad.addColorStop(0, '#f5f3ff'); grad.addColorStop(0.5, '#d8b4fe'); grad.addColorStop(1, '#9333ea');
      } else {
        grad.addColorStop(0, '#f8f9fa'); grad.addColorStop(0.5, '#e2e8f0'); grad.addColorStop(1, '#9ca3af');
      }
      ctx.fillStyle = grad; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 한지(종이) 노이즈 질감 추가
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < 4000; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }
      ctx.restore();

      // 은은한 사선 격자 무늬
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 2;
      for (let i = -canvas.height; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + canvas.height, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i + canvas.height, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      ctx.restore();

      // 중앙 원형 후광
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowColor = targetGrade === 'rare' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(185, 28, 28, 0.2)';
      ctx.shadowBlur = 50;
      ctx.beginPath(); ctx.arc(500, 480, 250, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // 2. 외곽 테두리 및 귀퉁이 장식
      ctx.strokeStyle = inkRed;
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, 920, 1120); 
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, 880, 1080); 
      
      // 전통 귀퉁이 장식 (Corner Ornaments)
      const drawCorner = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y); ctx.rotate(rotation);
        ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 0); ctx.lineTo(40, 0);
        ctx.lineWidth = 8; ctx.strokeStyle = inkRed; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(15, 15); ctx.lineTo(35, 35);
        ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();
      };
      drawCorner(60, 60, 0);
      drawCorner(940, 60, Math.PI/2);
      drawCorner(940, 1140, Math.PI);
      drawCorner(60, 1140, -Math.PI/2);

      // 3. 상단 밧줄 및 매듭
      ctx.save();
      ctx.strokeStyle = inkRed; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(500, 40); ctx.lineTo(500, 160); ctx.stroke();
      ctx.strokeStyle = goldBase; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
      for (let y = 40; y < 160; y += 12) {
        ctx.beginPath(); ctx.moveTo(496, y); ctx.lineTo(504, y + 8); ctx.stroke();
      }
      
      ctx.fillStyle = inkRed; ctx.globalAlpha = 1;
      const kx = 500; const ky = 160;
      ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(kx, ky, 22, 0, Math.PI*2); ctx.fill(); 
      ctx.beginPath(); ctx.ellipse(kx - 35, ky, 24, 12, 0, 0, Math.PI*2); ctx.fill(); 
      ctx.beginPath(); ctx.ellipse(kx + 35, ky, 24, 12, 0, 0, Math.PI*2); ctx.fill(); 
      ctx.beginPath(); ctx.ellipse(kx, ky - 35, 12, 24, 0, 0, Math.PI*2); ctx.fill(); 
      ctx.fillStyle = goldBase;
      ctx.beginPath(); ctx.arc(kx, ky, 6, 0, Math.PI*2); ctx.fill();
      
      ctx.strokeStyle = inkRed; ctx.lineWidth = 2;
      for (let i = -15; i <= 15; i += 3) {
        ctx.beginPath(); ctx.moveTo(kx + i*0.4, ky + 20); ctx.lineTo(kx + i, 220); ctx.stroke();
      }
      ctx.restore();

      // 4. 하단 파도 문양
      ctx.save();
      ctx.strokeStyle = inkRed; ctx.fillStyle = 'rgba(185, 28, 28, 0.03)';
      ctx.lineWidth = 3; ctx.globalAlpha = 0.7;
      const waveW = 80;
      for (let row = 0; row < 4; row++) {
        const yBase = 1160 - (row * 40); 
        const xOff = (row % 2) * waveW;
        for (let x = -waveW; x <= canvas.width + waveW; x += waveW * 2) {
          for (let r = waveW; r > 10; r -= 20) {
            ctx.beginPath(); ctx.arc(x + xOff, yBase, r, Math.PI, 0); ctx.stroke();
            if (r === waveW) ctx.fill(); 
          }
        }
      }
      ctx.restore();

      // 5. 이미지 로드 및 그리기
      const imgUrl = isDebug ? getAmuletImage('/uploads/legend/legend_amulet_03.png', 'high-res') : highResImageUrl;
      remoteLog(`[Canvas] 이미지 로드 시작: ${imgUrl}`);
      const relativePath = imgUrl.replace(window.location.origin, '');
      const img = new Image();
      img.crossOrigin = 'anonymous'; 
      img.src = relativePath;
      
      await new Promise((res, rej) => { 
        img.onload = () => res(true);
        img.onerror = () => rej(new Error('이미지 로드 실패')); 
      });

      let customKeyword = '만사형통';
      const targetComment = isDebug ? "취업 면접 때문에 너무 떨려요." : comment;
      const keywordMatch = targetComment.match(/\[키워드:\s*(.+?)\]/);
      if (keywordMatch && keywordMatch[1]) {
        customKeyword = keywordMatch[1].trim().substring(0, 4);
      }
      
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.95;
      ctx.drawImage(img, 250, 180, 500, 500); ctx.restore();

      // 키워드별 맞춤형 서브 텍스트 매핑
      const subTextMap: Record<string, string> = {
        '취업성공': '명태가 당신의 눈부신 새 출발을 응원합니다',
        '재물가득': '마르지 않는 샘물처럼 풍요가 깃들 것입니다',
        '무병장수': '아픈 곳 없이 평안하고 건강한 날들이 이어집니다',
        '천생연분': '귀한 인연이 닿아 따뜻한 사랑을 이룰 것입니다',
        '시험합격': '그동안의 땀방울이 값진 열매로 맺힐 것입니다',
        '인복가득': '좋은 사람들이 당신의 곁을 든든히 지켜줍니다',
        '만사형통': '세상의 모든 좋은 기운이 당신을 향해 흐릅니다',
        '소원성취': '마음속 깊이 품은 간절한 소망이 이루어집니다',
        '행운가득': '예상치 못한 기분 좋은 일들이 쏟아질 것입니다'
      };
      const subText = subTextMap[customKeyword] || '명태가 당신의 무거운 고민을 먹어치웠습니다';
      
      ctx.save();
      // 텍스트 그라데이션 적용 (고급스러움 극대화)
      const textGrad = ctx.createLinearGradient(0, 720, 0, 820);
      textGrad.addColorStop(0, '#7f1d1d'); // 다크 레드
      textGrad.addColorStop(1, inkRed);
      
      ctx.font = '900 85px "Pretendard", "Noto Serif KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = textGrad;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'; 
      ctx.shadowBlur = 15; // 글자 주변을 환하게 밝힘
      ctx.fillText(customKeyword, 500, 800);

      // 서브 텍스트 (더 정갈하고 세련된 폰트 처리)
      ctx.font = '600 30px "Pretendard", sans-serif';
      ctx.fillStyle = '#333d4b';
      ctx.shadowBlur = 0;
      ctx.fillText(subText, 500, 880);
      ctx.restore(); 

      // 7. 하단 고퀄리티 직인
      const stampX = 760; const stampY = 960; const stampSize = 120; 
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = inkRed;
      ctx.beginPath();
      ctx.roundRect(stampX, stampY, stampSize, stampSize, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Noto Serif KR", serif';
      ctx.textAlign = 'center';
      ctx.fillText('액막', stampX + stampSize/2, stampY + 50);
      ctx.fillText('명태', stampX + stampSize/2, stampY + 95);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
      for(let i=0; i<60; i++) {
        const x = stampX + (Math.random() > 0.5 ? Math.random()*12 : stampSize - Math.random()*12);
        const y = stampY + Math.random()*stampSize;
        ctx.beginPath(); ctx.arc(x, y, Math.random()*2.5 + 0.5, 0, Math.PI*2); ctx.fill();
        const x2 = stampX + Math.random()*stampSize;
        const y2 = stampY + (Math.random() > 0.5 ? Math.random()*12 : stampSize - Math.random()*12);
        ctx.beginPath(); ctx.arc(x2, y2, Math.random()*2.5 + 0.5, 0, Math.PI*2); ctx.fill();
      }
      for(let i=0; i<120; i++) {
        ctx.beginPath();
        ctx.arc(stampX + Math.random()*stampSize, stampY + Math.random()*stampSize, Math.random()*1.2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();

      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      if (isDebug) {
        const win = window.open();
        if (win) win.document.write(`<div style="background:#eee; display:flex; justify-content:center; padding:20px;"><img src="${canvas.toDataURL('image/png')}" style="max-height:90vh; border:1px solid #ccc; box-shadow:0 20px 50px rgba(0,0,0,0.1);" /></div>`);
      } else {
        try {
          await saveBase64Data({ data: base64Data, fileName: `myeongtae_amulet_${Math.floor(Date.now()/1000)}.png`, mimeType: 'image/png' });
          triggerToast('영험한 복 부적이 저장되었어요 🐟', 'success');
        } catch (e: any) {
          const link = document.createElement('a'); link.download = `talisman.png`; link.href = canvas.toDataURL('image/png'); link.click();
          triggerToast('부적이 저장되었습니다', 'success');
        }
      }
    } catch (err: any) {
      console.error(err); remoteLog(`[Canvas] 실패 원인: ${err.message}`, 'error');
      triggerToast('부적 생성에 실패했어요', 'error');
    } finally { setIsSaving(false); }
  };

  return (
    <L.Content style={{ display: 'flex', flexDirection: 'column', height: '100%', background: `radial-gradient(circle at 50% 30%, ${theme.bg} 0%, #ffffff 70%)`, padding: '0 20px', overflow: 'hidden', justifyContent: 'flex-start' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '65px', marginBottom: '20px' }}>
        <div style={{ width: '190px', position: 'relative' }}>
          {isNew && <div style={{ position: 'absolute', top: '-45px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}><NewBadge $grade={grade}><IoSparkles size={14} />{grade === 'legend' ? '전설 부적!' : grade === 'rare' ? '희귀 부적!' : '새로운 부적!'}</NewBadge></div>}
          <AnimatedCardWrapper $isFlying={isFlying}><S.ImageBox $bg="#ffffff" $glow={grade === 'legend'} style={{ padding: '16px', border: `2px solid ${theme.sub}`, boxShadow: `0 20px 40px ${theme.sub}40` }}><img src={getAmuletImage(consultationResult?.amulet?.imageUrl || '', 'ui')} alt="부적" style={{ width: '100%', height: 'auto', objectFit : 'contain' }} /></S.ImageBox></AnimatedCardWrapper>
        </div>
      </div>
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: '16px' }}><ResultTextBox style={{ border: `1px solid ${theme.sub}80` }}><p style={{ color: '#191f28', textAlign: 'center', lineHeight: 1.6, fontSize: displayComment.length > 120 ? '13px' : '15px', fontWeight: 600, margin: 0, whiteSpace: 'pre-wrap' }}>{displayedText}<TypingCursor $visible={displayedText.length < displayComment.length} /></p></ResultTextBox></div>
      
      <div style={{ flexShrink: 0, width: '100%', paddingBottom: '20px' }}><div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}><C.MainButton onClick={() => handleSaveCompositeImage(false)} disabled={isSaving} style={{ flex: 1, height: '54px' }}>{isSaving ? '준비 중...' : '부적 소장 및 공유하기'}</C.MainButton><button onClick={() => { if (!isFlying) { setIsFlying(true); setTimeout(() => navigateTo('collection'), 700); } }} style={{ width: '56px', height: '54px', borderRadius: '18px', border: '2px solid #3182f6', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IoArchiveOutline size={24} color="#3182f6" /></button></div><div ref={bannerRef} style={{ width: '100%', height: '96px', background: '#f9fafb', borderRadius: '16px', overflow: 'hidden' }} /></div>
    </L.Content>
  );
};
export default ResultStep;
