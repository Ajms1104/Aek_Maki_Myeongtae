import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import main_fish from '../assets/가로형.png';
import {
  IoArchiveOutline,
  IoHelpCircleOutline,
  IoWalletOutline,
  IoColorWandOutline,
  IoFingerPrintOutline,
  IoChatbubblesOutline,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoImageOutline,
  IoTrophyOutline,
} from 'react-icons/io5';
import * as L from '../styles/layoutStyles';
import * as C from '../styles/commonStyles';
import * as O from '../styles/overlayStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';
import { useUI } from '../hooks/useUI';
import { loginWithToss } from '../utils/auth'; 
import { tokenStorage, remoteLog } from '../utils/api';  
import { GRADE_COLORS } from '../constants/talisman';
import { getAmuletImage } from '../utils/amuletAssets';

const MainStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { credits, challenges, attendanceStreak, handleAttendanceReward, refreshCollection } = useTalisman();
  const { openDialog, triggerToast } = useUI();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const challengeCopy: Record<string, { title: string; description: string }> = {
    ATTENDANCE_3_DAYS: { title: '3일 연속 출석', description: '+1 크레딧' },
    ATTENDANCE_10_DAYS_TOTAL: { title: '누적 10일 출석', description: '+2 크레딧' },
    AMULET_3_CREATIONS: { title: '부적 3개 생성', description: '+1 크레딧' },
    FIRST_LEGEND: { title: '전설 등급 부적 획득', description: '+3 크레딧' },
    PAYMENT_CREDIT: { title: '10 크레딧 충전 완료', description: '+2 크레딧' },
    PAYMENT_HIDDEN: { title: '히든 패키지 해금 완료', description: '+3 크레딧' },
  };
  const visibleChallenges = challenges.length > 0 ? challenges : [
    { key: 'ATTENDANCE_3_DAYS', title: '3일 연속 출석', description: '', rewardCredits: 1, target: 3, progress: Math.min(attendanceStreak, 3), completed: false },
    { key: 'ATTENDANCE_10_DAYS_TOTAL', title: '누적 10일 출석', description: '', rewardCredits: 2, target: 10, progress: 0, completed: false },
    { key: 'AMULET_3_CREATIONS', title: '부적 3개 생성', description: '', rewardCredits: 1, target: 3, progress: 0, completed: false },
    { key: 'FIRST_LEGEND', title: '전설 등급 부적 획득', description: '', rewardCredits: 3, target: 1, progress: 0, completed: false },
    { key: 'PAYMENT_CREDIT', title: '10 크레딧 충전 완료', description: '', rewardCredits: 2, target: 1, progress: 0, completed: false },
    { key: 'PAYMENT_HIDDEN', title: '히든 패키지 해금 완료', description: '', rewardCredits: 3, target: 1, progress: 0, completed: false },
  ];

  // ✅ 다변화된 프리미엄 퀄리티 프리뷰 로직 (옵션별 생성)
  const handleDebugPreview = async (gradeType: string, keyword: string) => {
    remoteLog(`[Debug] ${gradeType} 등급 - ${keyword} 프리뷰 생성 시작`);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = 1000; canvas.height = 1200; 

      const inkRed = '#b91c1c'; const goldBase = '#fcd34d'; 

      // 1. 등급별 배경 그라데이션 다변화
      const grad = ctx.createRadialGradient(500, 500, 50, 500, 800, 1200);
      if (gradeType === 'legend') {
        grad.addColorStop(0, '#fffbeb'); grad.addColorStop(0.5, '#fde68a'); grad.addColorStop(1, '#f59e0b');
      } else if (gradeType === 'rare') {
        grad.addColorStop(0, '#f5f3ff'); grad.addColorStop(0.5, '#d8b4fe'); grad.addColorStop(1, '#9333ea');
      } else {
        grad.addColorStop(0, '#f8f9fa'); grad.addColorStop(0.5, '#e2e8f0'); grad.addColorStop(1, '#9ca3af');
      }
      ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 한지(종이) 노이즈 질감
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < 4000; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }
      ctx.restore();

      // 사선 격자 무늬
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
      ctx.shadowColor = gradeType === 'rare' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(185, 28, 28, 0.2)';
      ctx.shadowBlur = 50;
      ctx.beginPath(); ctx.arc(500, 480, 250, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // 2. 외곽 테두리 및 귀퉁이 장식
      ctx.strokeStyle = inkRed;
      ctx.lineWidth = 12; ctx.strokeRect(40, 40, 920, 1120);
      ctx.lineWidth = 3; ctx.strokeRect(60, 60, 880, 1080);

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
      ctx.strokeStyle = inkRed;
      ctx.fillStyle = 'rgba(185, 28, 28, 0.03)';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      const waveW = 80;
      for (let row = 0; row < 4; row++) {
        const yBase = 1160 - (row * 40); 
        const xOff = (row % 2) * waveW;
        for (let x = -waveW; x <= canvas.width + waveW; x += waveW * 2) {
          for (let r = waveW; r > 10; r -= 20) {
            ctx.beginPath();
            ctx.arc(x + xOff, yBase, r, Math.PI, 0);
            ctx.stroke();
            if (r === waveW) ctx.fill(); 
          }
        }
      }
      ctx.restore();

      // 5. 이미지 로드 및 그리기
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.src = getAmuletImage('/uploads/legend/legend_amulet_03.png', 'high-res').replace(window.location.origin, '');
      await new Promise(res => { img.onload = res; img.onerror = res; });
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.95;
      ctx.drawImage(img, 250, 180, 500, 500); ctx.restore();

      // 6. 맞춤형 한글 요약 키워드 및 다변화된 서브 텍스트
      const subTextMap: Record<string, string> = {
        '취업성공': '명태가 당신의 눈부신 새 출발을 응원합니다',
        '재물가득': '마르지 않는 샘물처럼 풍요가 깃들 것입니다',
        '무병장수': '아픈 곳 없이 평안하고 건강한 날들이 이어집니다',
        '천생연분': '귀한 인연이 닿아 따뜻한 사랑을 이룰 것입니다'
      };
      const subText = subTextMap[keyword] || '명태가 당신의 무거운 고민을 먹어치웠습니다';

      ctx.save();
      const textGrad = ctx.createLinearGradient(0, 720, 0, 820);
      textGrad.addColorStop(0, '#7f1d1d');
      textGrad.addColorStop(1, inkRed);

      ctx.font = '900 85px "Pretendard", "Noto Serif KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = textGrad;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'; 
      ctx.shadowBlur = 15;
      ctx.fillText(keyword, 500, 800);

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

      const win = window.open();
      if (win) win.document.write(`<div style="background:#eee; display:flex; justify-content:center; padding:20px;"><img src="${canvas.toDataURL('image/png')}" style="max-height:90vh; border:1px solid #ccc; box-shadow:0 20px 50px rgba(0,0,0,0.1);" /></div>`);
    } catch (e) { console.error(e); }
  };



  const attemptLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await loginWithToss();
      if (result && result.user) {
        await refreshCollection();
        const msg = await handleAttendanceReward();
        if (msg) triggerToast(msg, 'success');
        navigateTo('input');
      }
    } catch (err) {
      console.error('[Main] 로그인 시도 실패:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStart = async () => {
    if (isLoggingIn) return;
    
    const existingToken = tokenStorage.get();
    remoteLog(`[Main] 시작하기 클릭. 토큰존재여부: ${!!existingToken}`);

    if (existingToken) {
      setIsLoggingIn(true);
      try {
        await refreshCollection();
        if (credits <= 0) {
          openDialog('크레딧 부족', '고민을 털어놓으려면 크레딧이 필요해요.\n충전소로 이동하시겠습니까?', {
            showCancel: true,
            cancelText: '구경하기',
            confirmText: '충전소 가기',
            onConfirm: () => navigateTo('payment')
          });
          setIsLoggingIn(false);
          return;
        }
        navigateTo('input');
      } catch (err: any) {
        remoteLog(`[Main] 세션 갱신 실패 (만료 또는 유저없음): ${err.message}`, 'warn');
        tokenStorage.remove(); 
        triggerToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'info');
        await attemptLogin();
      } finally {
        setIsLoggingIn(false);
      }
      return;
    }
    await attemptLogin();
  };

  return (
    <L.Content style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 16px 16px', justifyContent: 'flex-start', overflow: 'hidden' }}> 
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f9fafb 0%, #f2f4f6 100%)',
          borderRadius: '24px',
          padding: '10px 16px',
          border: '1px solid #f2f4f6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          aspectRatio: '2.4 / 1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <img
            src={main_fish}
            alt="AI 명태"
            style={{ 
              position: 'absolute',
              top: '50%', 
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
              height: '95%',
              objectFit: 'contain',
              zIndex: 0,
              pointerEvents: 'none'
            }} 
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <C.CollectionLink
              onClick={() => navigateTo('collection')}
              style={{
                margin: 0,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '6px 10px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IoArchiveOutline size={16} color="#3182f6" />
                <span style={{ marginLeft: '6px', fontWeight: 800, color: '#191f28', fontSize: '12px' }}>보관함</span>
              </div>
            </C.CollectionLink>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 10px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <IoColorWandOutline size={14} color="#3182f6" />
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#3182f6' }}>{credits}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 1, title: '토스로 로그인하기', sub: '안전하고 빠르게 시작하세요.', icon: <IoFingerPrintOutline size={18} color="#3182f6" />, color: '#e8f3ff' },
            { id: 2, title: '고민 털어놓기', sub: '명태에게 말 못한 고민을 적어보세요.', icon: <IoChatbubblesOutline size={18} color="#a25df5" />, color: '#f4edff' },
            { id: 4, title: '행운의 부적 받기', sub: '당신만을 위한 특별한 부적을 드려요.', icon: <IoStarOutline size={18} color="#27ae60" />, color: '#e8f5e9' },
          ].map((item) => (
            <div key={item.id} style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid #f2f4f6',
                boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#191f28', marginBottom: '1px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: '#6b7684', fontWeight: 600 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '4px', background: '#ffffff', borderRadius: '20px', padding: '12px 14px', border: '1px solid #f2f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 900, color: '#191f28' }}>
              <IoTrophyOutline size={16} color="#3182f6" /> 도전과제
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#8b95a1' }}>{attendanceStreak}일 연속</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px' }}>
            {visibleChallenges.map((challenge) => {
              const copy = challengeCopy[challenge.key] || { title: challenge.title, description: `+${challenge.rewardCredits} tokens` };
              const progress = Math.min(challenge.progress, challenge.target);
              const percent = challenge.target > 0 ? Math.min(100, (progress / challenge.target) * 100) : 0;
              return (
                <div key={challenge.key} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px', 
                  minWidth: 0,
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '8px 10px',
                  border: '1px solid #f2f4f6'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 850, color: challenge.completed ? '#3182f6' : '#333d4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{copy.title}</span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 900, 
                      color: challenge.completed ? '#27ae60' : '#3182f6', 
                      background: challenge.completed ? '#e8f5e9' : '#e8f3ff', 
                      borderRadius: '5px', 
                      padding: '2px 5px', 
                      flexShrink: 0 
                    }}>
                      {challenge.completed ? '완료' : `+${challenge.rewardCredits || 1}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ height: '6px', background: '#e5e8eb', borderRadius: '999px', overflow: 'hidden', flex: 1, marginRight: '6px' }}>
                      <div style={{ width: `${percent}%`, height: '100%', borderRadius: '999px', background: challenge.completed ? '#27ae60' : '#3182f6', transition: 'width 0.2s ease' }} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#8b95a1', flexShrink: 0 }}>{progress}/{challenge.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', paddingBottom: '8px', flexShrink: 0, marginTop: 'auto' }}>
        <C.MainButton 
          onClick={handleStart}
          disabled={isLoggingIn}
          style={{ 
            height: '56px', 
            fontSize: '17px', 
            fontWeight: 800,
            borderRadius: '16px',
            boxShadow: '0 6px 16px rgba(49, 130, 246, 0.15)' 
          }}
        >
          {isLoggingIn ? '로그인 중...' : '시작하기'}
        </C.MainButton>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
          <button onClick={() => navigateTo('payment')} style={{ background: 'none', color: '#8b95a1', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IoWalletOutline size={16} /> 충전소
          </button>
          <div style={{ width: '1px', height: '10px', background: '#e5e8eb', alignSelf: 'center' }} />
          <button onClick={() => setIsHelpOpen(true)} style={{ background: 'none', color: '#3182f6', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IoHelpCircleOutline size={16} /> 상세 가이드
          </button>
        </div>
      </div>

      <O.MenuOverlay $show={isHelpOpen} onClick={() => setIsHelpOpen(false)} />
      <O.BottomSheetContainer $show={isHelpOpen}>
        <div style={{ width: '36px', height: '5px', background: '#e5e8eb', borderRadius: '10px', margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#191f28', marginBottom: '20px' }}>액막이AI 가이드</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#e8f3ff', borderRadius: '12px' }}><IoShieldCheckmarkOutline size={22} color="#3182f6" /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#333d4b', marginBottom: '4px' }}>비밀은 철저히 보장해요</div>
              <div style={{ fontSize: '14px', color: '#6b7684', lineHeight: '1.5' }}>작성하신 고민 내용은 부적 생성 후 즉시 파기되며, 누구도 열람할 수 없으니 안심하세요.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#f4edff', borderRadius: '12px' }}><IoImageOutline size={22} color="#a25df5" /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#333d4b', marginBottom: '4px' }}>부적 저장 및 수집</div>
              <div style={{ fontSize: '14px', color: '#6b7684', lineHeight: '1.5' }}>완성된 부적은 이미지로 저장하거나 내 보관함에 영구히 소장하여 언제든 다시 꺼내볼 수 있습니다.</div>
            </div>
          </div>
        </div>
        <C.MainButton onClick={() => setIsHelpOpen(false)} style={{ height: '56px', borderRadius: '16px' }}>확인했습니다</C.MainButton>
      </O.BottomSheetContainer>
    </L.Content>
  );
};

export default MainStep;
