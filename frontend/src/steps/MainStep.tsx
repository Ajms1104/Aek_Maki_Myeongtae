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
  IoHardwareChipOutline,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoImageOutline,
} from 'react-icons/io5';
import * as L from '../styles/layoutStyles';
import * as C from '../styles/commonStyles';
import * as O from '../styles/overlayStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useTalisman } from '../hooks/useTalisman';
import { useUI } from '../hooks/useUI';
import { loginWithToss } from '../utils/auth'; 
import { tokenStorage, remoteLog } from '../utils/api';  


const pulseGreen = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(39, 174, 96, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
`;

const OnlineStatusDot = styled.div`
  width: 6px; 
  height: 6px; 
  background: #27ae60; 
  border-radius: 50%;
  animation: ${pulseGreen} 2s infinite;
`;

const MainStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { credits, handleAttendanceReward, refreshCollection } = useTalisman();
  const { openDialog, triggerToast } = useUI();
  const [visitorCount, setVisitorCount] = useState(37421);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ✅ 개발용 세션 초기화 기능 (메인 화면 물고기 로고 5번 클릭 시 발동)
  const [debugClick, setDebugClick] = useState(0);
  const handleDebugReset = () => {
    if (debugClick >= 4) {
      tokenStorage.remove();
      triggerToast('세션이 초기화되었습니다.', 'info');
      setDebugClick(0);
      refreshCollection().catch(() => {});
    } else {
      setDebugClick(prev => prev + 1);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 2));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
    
    // [DEBUG] 로그 추가
    remoteLog(`[Main] 시작하기 클릭. 토큰존재여부: ${!!existingToken}`);

    if (existingToken) {
      setIsLoggingIn(true);
      try {
        // 서버에서 최신 정보(크레딧 등) 강제 동기화
        await refreshCollection();

        // 동기화된 결과로 크레딧 체크
        if (credits <= 0) {
          openDialog('크레딧 부족', '고민을 털어놓으려면 크레딧이 필요해요. 충전소로 이동할까요?', {
            showCancel: true,
            onConfirm: () => navigateTo('payment')
          });
          setIsLoggingIn(false);
          return;
        }

        navigateTo('input');
      } catch (err: any) {
        remoteLog(`[Main] 세션 갱신 실패 (만료 또는 유저없음): ${err.message}`, 'warn');
        tokenStorage.remove(); // 토큰 삭제
        triggerToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'info');
        await attemptLogin();
      } finally {
        setIsLoggingIn(false);
      }
      return;
    }

    // 로그인이 안 되어 있는 경우
    await attemptLogin();
  };

  return (
    <L.Content style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 24px', justifyContent: 'flex-start' }}> 
      
      {/* 상단 섹션: 여유 있는 상단 여백 부여 */}
      <div style={{ flex: '0 0 auto', paddingTop: '24px' }}>
        
        {/* 상단 메인 카드 - 비율 유지 및 하단 여백 확대 */}
        <div style={{
          background: 'linear-gradient(135deg, #f9fafb 0%, #f2f4f6 100%)',
          borderRadius: '24px',
          padding: '12px 16px',
          marginBottom: '24px',
          border: '1px solid #f2f4f6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          aspectRatio: '2 / 1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <img
            src={main_fish}
            alt="AI 명태"
            onClick={handleDebugReset}
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 0,
              pointerEvents: 'auto'
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

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.9)',
                width: 'fit-content',
                margin: '0 auto',
                padding: '4px 12px',
                borderRadius: '100px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
              <OnlineStatusDot />
              <span style={{ color: '#4e5968', fontSize: '11px', fontWeight: 800 }}>
                {visitorCount.toLocaleString()}명이 위로받는 중
              </span>
            </div>
          </div>
        </div>

        {/* 안내 카드 섹션: 카드 사이 간격(gap) 확대 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { id: 1, title: '토스로 로그인하기', sub: '안전하고 빠르게 서비스를 시작하세요.', icon: <IoFingerPrintOutline size={20} color="#3182f6" />, color: '#e8f3ff' },
            { id: 2, title: '고민 털어놓기', sub: '누구에게도 말 못 한 고민을 적어보세요.', icon: <IoChatbubblesOutline size={20} color="#a25df5" />, color: '#f4edff' },
            { id: 4, title: '행운의 부적 받기', sub: '당신만을 위한 특별한 부적을 드려요.', icon: <IoStarOutline size={20} color="#27ae60" />, color: '#e8f5e9' },
          ].map((item) => (
            <div key={item.id} style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid #f2f4f6',
                boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#191f28', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7684', fontWeight: 600 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 중앙 여백을 채워주는 유동적 공간 */}
      <div style={{ flex: 1 }} />

      {/* 하단 고정 버튼 영역 */}
      <div style={{ width: '100%', paddingBottom: '16px' }}>
        <C.MainButton 
          onClick={handleStart}
          disabled={isLoggingIn}
          style={{ 
            height: '60px', 
            fontSize: '18px', 
            fontWeight: 800,
            borderRadius: '18px',
            boxShadow: '0 8px 20px rgba(49, 130, 246, 0.2)' 
          }}
        >
          {isLoggingIn ? '로그인 중...' : '시작하기'}
        </C.MainButton>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
          <button onClick={() => navigateTo('payment')} style={{ background: 'none', color: '#8b95a1', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IoWalletOutline size={18} /> 충전소
          </button>
          <div style={{ width: '1px', height: '12px', background: '#e5e8eb', alignSelf: 'center' }} />
          <button onClick={() => setIsHelpOpen(true)} style={{ background: 'none', color: '#3182f6', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IoHelpCircleOutline size={18} /> 상세 가이드
          </button>
        </div>
      </div>

      <O.MenuOverlay $show={isHelpOpen} onClick={() => setIsHelpOpen(false)} />
      <O.BottomSheetContainer $show={isHelpOpen}>
        <div style={{ width: '36px', height: '5px', background: '#e5e8eb', borderRadius: '10px', margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#191f28', marginBottom: '20px' }}>액막이 AI 가이드</h3>
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
