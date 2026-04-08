import React, { useState } from 'react';
import { IoArchiveOutline, IoSparkles } from 'react-icons/io5';
import styled, { keyframes, css } from 'styled-components';
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';

import { useNavigation } from '../hooks/useNavigation';
import { useUI } from '../hooks/useUI';
import { useTypingEffect } from '../hooks/useTypingEffect';

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const cursorBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const SpeechBubble = styled.div`
  position: relative;
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 24px;
  width: 100%;
  margin-bottom: 24px;
  border: 1px solid #f2f4f6;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  
  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 10px 10px;
    border-style: solid;
    border-color: transparent transparent #ffffff;
    filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.02));
  }
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
  margin-bottom: 20px;
  ${(props) =>
    !props.$isFlying &&
    css`
      animation: ${floatingAnimation} 3s ease-in-out infinite;
    `}
`;

const ResultStep: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { triggerToast } = useUI();
  const [isFlying, setIsFlying] = useState(false);
  const comment = "이 부적이 불운을 끊어줄 거예요.\n걱정은 명태에게 맡기고 푹 쉬세요.";
  const { displayedText } = useTypingEffect(comment, 60);

  return (
    <L.Content style={{ display: 'flex', flexDirection: 'column', overflow: 'visible', paddingTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 24px',
          backgroundColor: '#3182f6',
          borderRadius: '100px',
          color: 'white',
          fontSize: '15px',
          fontWeight: 800,
          boxShadow: '0 6px 16px rgba(49, 130, 246, 0.25)'
        }}>
          <IoSparkles size={16} color="rgba(255,255,255,0.9)" />
          부적 완성
        </div>
      </div>

      <AnimatedCardWrapper $isFlying={isFlying} style={{ marginBottom: '40px' }}>
        <S.ImageBox $bg="#fff9e6" $glow={true}>
          <img src="/talisman_sun.png" alt="부적" style={{ width: '85%' }} />
        </S.ImageBox>
      </AnimatedCardWrapper>

      <SpeechBubble style={{ marginTop: '10px' }}>
        <p
          style={{
            color: '#191f28',
            textAlign: 'center',
            lineHeight: 1.6,
            fontSize: '16px',
            fontWeight: 600,
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {displayedText}
          <TypingCursor $visible={displayedText.length < comment.length} />
        </p>
      </SpeechBubble>

      <div style={{ flex: 1 }} />

      <C.FixedButtonGroup>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <C.MainButton
            onClick={triggerToast}
            style={{ flex: 1, height: '58px' }}
          >
            이미지 저장하기
          </C.MainButton>
          <button
            onClick={() => {
              if (isFlying) return;
              setIsFlying(true);
              setTimeout(() => navigateTo('collection'), 700);
            }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              border: '2px solid #3182f6',
              background: 'linear-gradient(135deg, #ffffff 0%, #e8f3ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 4px 14px rgba(49, 130, 246, 0.15)',
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = 'scale(0.92)')
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <IoArchiveOutline size={28} color="#3182f6" />
            <IoSparkles
              size={12}
              color="#fcc419"
              style={{ position: 'absolute', top: '8px', right: '8px' }}
            />
          </button>
        </div>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default ResultStep;
