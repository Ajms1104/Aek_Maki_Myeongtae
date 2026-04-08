import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  IoArchiveOutline,
  IoHelpCircleOutline,
  IoWalletOutline,
  IoSparkles,
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
  const { credits } = useTalisman();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(37421);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 2));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <L.Content style={{ paddingBottom: '120px', justifyContent: 'flex-start' }}>
      <div style={{ width: '100%', paddingTop: '12px' }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #f9fafb 0%, #f2f4f6 100%)',
          borderRadius: '32px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #f2f4f6',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}>
            <C.CollectionLink
              onClick={() => navigateTo('collection')}
              style={{
                margin: 0,
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.03)',
                padding: '8px 12px',
                borderRadius: '14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IoArchiveOutline size={16} color="#3182f6" />
                <span style={{ marginLeft: '6px', fontWeight: 700, color: '#4e5968', fontSize: '12px' }}>
                  보관함
                </span>
              </div>
            </C.CollectionLink>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              padding: '8px 12px',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,0.03)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <IoColorWandOutline size={14} color="#3182f6" />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#3182f6' }}>
                {credits}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', position: 'relative', padding: '4px 0' }}>
            <div
              style={{
                position: 'relative',
                width: '76px',
                height: '76px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/main_fish.png"
                alt="AI 명태"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-6px',
                background: '#3182f6',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(49, 130, 246, 0.2)'
              }}>
                <IoSparkles color="white" size={12} />
              </div>
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.85)',
                width: 'fit-content',
                margin: '12px auto 0',
                padding: '6px 14px',
                borderRadius: '100px',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <OnlineStatusDot />
              <span style={{ color: '#4e5968', fontSize: '11px', fontWeight: 800, letterSpacing: '-0.2px' }}>
                {visitorCount.toLocaleString()}명이 위로받는 중
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {
              id: 1,
              title: '토스로 로그인하기',
              sub: '안전하고 빠르게 서비스를 시작하세요.',
              icon: <IoFingerPrintOutline size={20} color="#3182f6" />,
              color: '#e8f3ff'
            },
            {
              id: 2,
              title: '고민 털어놓기',
              sub: '누구에게도 말 못 한 고민을 적어보세요.',
              icon: <IoChatbubblesOutline size={20} color="#a25df5" />,
              color: '#f4edff'
            },
            {
              id: 3,
              title: '마음 정리하기',
              sub: 'AI 명태가 당신의 마음을 차분히 정리해요.',
              icon: <IoHardwareChipOutline size={20} color="#fcc419" />,
              color: '#fff9e6'
            },
            {
              id: 4,
              title: '행운의 부적 받기',
              sub: '당신만을 위한 특별한 부적을 드려요.',
              icon: <IoStarOutline size={20} color="#27ae60" />,
              color: '#e8f5e9'
            },
          ].map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid #f2f4f6',
                boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#191f28',
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7684',
                    fontWeight: 500,
                  }}
                >
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <C.FixedButtonGroup style={{ paddingBottom: '32px' }}>
        <C.MainButton 
          onClick={() => navigateTo('input')}
          style={{ 
            height: '52px', 
            fontSize: '16px', 
            boxShadow: '0 4px 16px rgba(49, 130, 246, 0.15)' 
          }}
        >
          고민 털어놓기
        </C.MainButton>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '14px',
          }}
        >
          <button
            onClick={() => navigateTo('payment')}
            style={{
              background: 'none',
              color: '#8b95a1',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IoWalletOutline size={17} /> 충전
          </button>
          <div
            style={{
              width: '1px',
              height: '12px',
              background: '#e5e8eb',
              alignSelf: 'center',
            }}
          />
          <button
            onClick={() => setIsHelpOpen(true)}
            style={{
              background: 'none',
              color: '#3182f6',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IoHelpCircleOutline size={17} /> 상세 가이드
          </button>
        </div>
      </C.FixedButtonGroup>

      <O.MenuOverlay $show={isHelpOpen} onClick={() => setIsHelpOpen(false)} />
      <O.BottomSheetContainer $show={isHelpOpen}>
        <div
          style={{
            width: '36px',
            height: '5px',
            background: '#e5e8eb',
            borderRadius: '10px',
            margin: '0 auto 24px',
          }}
        />
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#191f28',
            marginBottom: '20px',
          }}
        >
          액막이 AI 가이드
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            paddingBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: '#e8f3ff',
                borderRadius: '12px',
              }}
            >
              <IoShieldCheckmarkOutline size={22} color="#3182f6" />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#333d4b',
                  marginBottom: '4px',
                }}
              >
                비밀은 철저히 보장해요
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#6b7684',
                  lineHeight: '1.5',
                }}
              >
                작성하신 고민 내용은 부적 생성 후 즉시 파기되며, 누구도 열람할
                수 없으니 안심하세요.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: '#f4edff',
                borderRadius: '12px',
              }}
            >
              <IoImageOutline size={22} color="#a25df5" />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#333d4b',
                  marginBottom: '4px',
                }}
              >
                부적 저장 및 수집
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#6b7684',
                  lineHeight: '1.5',
                }}
              >
                완성된 부적은 이미지로 저장하거나 내 보관함에 영구히 소장하여
                언제든 다시 꺼내볼 수 있습니다.
              </div>
            </div>
          </div>
        </div>
        <C.MainButton onClick={() => setIsHelpOpen(false)}>
          확인했습니다
        </C.MainButton>
      </O.BottomSheetContainer>
    </L.Content>
  );
};

export default MainStep;
