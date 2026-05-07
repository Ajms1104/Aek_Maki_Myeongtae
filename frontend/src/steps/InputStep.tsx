import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { IoChatbubbles, IoShieldCheckmarkOutline } from 'react-icons/io5'; 
import main_fish from '../assets/main_image.png'; 
import * as L from '../styles/layoutStyles';
import * as S from '../styles/stepStyles';
import * as C from '../styles/commonStyles';
import { useTalisman } from '../hooks/useTalisman';
import { useNavigation } from '../hooks/useNavigation';
import { useUI } from '../hooks/useUI';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const listenPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(49, 130, 246, 0.2); }
  70% { box-shadow: 0 0 0 15px rgba(49, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(49, 130, 246, 0); }
`;

const WritingContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  min-height: 0;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const MyeongtaeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
  margin-bottom: 20px;
  position: relative;
  flex-shrink: 0;
`;

const PulseBackground = styled.div<{ $active: boolean }>`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  z-index: 0;
  ${props => props.$active && css`
    animation: ${listenPulse} 2s infinite;
  `}
`;

const FishImage = styled.img<{ $isTyping: boolean }>`
  width: 90px;
  height: 90px;
  object-fit: contain;
  animation: ${float} 3s ease-in-out infinite;
  transition: all 0.3s ease;
  z-index: 1;
  ${props => props.$isTyping && css`
    filter: drop-shadow(0 0 10px rgba(49, 130, 246, 0.3));
  `}
`;

const SpeechBubble = styled.div`
  background: #ffffff;
  padding: 10px 18px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 800;
  color: #3182f6; 
  margin-top: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e8f3ff;
  position: relative;
  z-index: 1;
  &::after {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 8px 8px;
    border-style: solid;
    border-color: transparent transparent #ffffff;
  }
`;

const PaperInput = styled.div<{ $focused: boolean }>`
  width: 100%;
  background: #fdfbf0;
  border-radius: 24px;
  padding: 20px;
  box-shadow: ${props => props.$focused 
    ? '0 12px 30px rgba(0,0,0,0.08)' 
    : '0 4px 12px rgba(0,0,0,0.03)'};
  border: 2px solid ${props => props.$focused ? '#3182f6' : 'transparent'};
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  flex: 1;
  max-height: 240px; 
  position: relative;
  margin-bottom: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: linear-gradient(#e5e1d1 1px, transparent 1px);
    background-size: 100% 32px;
    opacity: 0.3;
    pointer-events: none;
    border-radius: 24px;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  resize: none;
  outline: none;
  font-size: 17px;
  line-height: 32px;
  color: #191f28;
  font-weight: 600;
  z-index: 1;
  font-family: inherit;
  &::placeholder {
    color: #adb5bd;
    font-weight: 500;
  }
`;

const HeaderSection = styled.div`
  padding: 12px 24px 16px; // ✅ 상단 여백 축소 (상단 바 아래 자연스럽게 위치)
  flex-shrink: 0;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const InputStep: React.FC = () => {
  const { wish, setWish, submitWish } = useTalisman();
  const { navigateTo, replaceTo } = useNavigation();
  const { triggerToast } = useUI();
  const [isFocused, setIsFocused] = React.useState(false);

  const isTyping = wish.length > 0;

  const handleStartConsultation = async () => {
    if (wish.length < 10) return;

    navigateTo('loading');

    try {
      await Promise.all([
        submitWish(),
        new Promise(resolve => setTimeout(resolve, 3800))
      ]);
      setWish('');
      replaceTo('result');
    } catch (err) {
      console.error('[InputStep] 에러:', err);
      triggerToast('액운을 쫓는 데 실패했어요.', 'error');
      replaceTo('input');
    }
  };

  return (
    <L.Content style={{ padding: 0, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <HeaderSection>
        <L.Title style={{ 
          textAlign: 'left', 
          fontSize: '24px', 
          fontWeight: 800, 
          lineHeight: '1.4',
          color: '#191f28',
        }}>
          물리치고 싶은 고민을{'\n'}
          모두 적어주세요
        </L.Title>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#3182f6' }}>
          <IoShieldCheckmarkOutline size={16} />
          <span style={{ fontSize: '15px', fontWeight: 700 }}>명태 AI가 액운을 담아 부적을 만듭니다</span>
        </div>
      </HeaderSection>

      <WritingContainer>
        <MyeongtaeSection>
          <PulseBackground $active={isTyping} />
          <FishImage src={main_fish} alt="명태" $isTyping={isTyping} />
          <SpeechBubble>
            {wish.length === 0 ? "어떤 액운을 쫓아낼까요?" : 
             wish.length < 10 ? "조금 더 구체적으로 적어주세요." : "제가 다 가져갈게요."}
          </SpeechBubble>
        </MyeongtaeSection>

        <PaperInput $focused={isFocused}>
          <StyledTextarea
            placeholder="이곳에 고민을 적어보세요.&#10;당신의 액운은 제가 가져갈게요."
            value={wish}
            onChange={(e) => setWish(e.target.value.slice(0, 200))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', zIndex: 1, gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: wish.length >= 200 ? '#f04452' : '#adb5bd' }}>
              {wish.length}/200
            </span>
          </div>
        </PaperInput>
      </WritingContainer>
      
      <C.FixedButtonGroup style={{ paddingBottom: '36px', position: 'relative', background: '#fff' }}>
        <C.MainButton
          disabled={wish.length < 10}
          onClick={handleStartConsultation}
          style={{ height: '60px', borderRadius: '18px', fontSize: '18px' }}
        >
          액막이 부적 만들기
        </C.MainButton>
      </C.FixedButtonGroup>
    </L.Content>
  );
};

export default InputStep;
