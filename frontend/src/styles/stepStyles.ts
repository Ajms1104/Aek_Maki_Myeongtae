import styled, { css, keyframes } from 'styled-components';
import * as A from './animations';

const cardFlyToInbox = keyframes`
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(132px, 430px) scale(0.1); opacity: 0; }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
`;

const cardGlow = keyframes`
  0% { filter: drop-shadow(0 0 5px rgba(255, 179, 186, 0.4)); }
  50% { filter: drop-shadow(0 0 20px rgba(186, 225, 255, 0.8)); }
  100% { filter: drop-shadow(0 0 5px rgba(255, 179, 186, 0.4)); }
`;

const unlockSweep = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-110%);
    opacity: 0;
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  height: 480px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-top: -10px;
  background-image: url('/writing.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

export const InputField = styled.textarea`
  width: 55%;
  height: 230px;
  margin-top: 110px;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  outline: none;
  resize: none;
  color: #1b1c1d;
  line-height: 1.7;
  text-align: center;
  z-index: 5;
  font-family: inherit;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const StatusChip = styled.div<{ $visible: boolean }>`
  padding: 18px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f9fafb;
  color: ${(props) => (props.$visible ? '#3182f6' : '#8b95a1')};
  border: 1px solid ${(props) => (props.$visible ? '#e8f3ff' : '#f2f4f6')};
  text-align: center;
  flex: 1;
  transition: all 0.3s;
`;

export const LoadingCheckIcon = styled.div<{ $visible: boolean }>`
  color: #3182f6;
  font-size: 18px;
  margin: 0 auto 6px;
  display: block;
  visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
  ${(props) =>
    props.$visible &&
    css`
      animation: ${A.checkAppear} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)
        forwards;
    `}
`;

export const LoadingImage = styled.img`
  width: 260px;
  animation: ${css`
    ${A.brushWork} 2.5s infinite ease-in-out
  `};
`;

export const TalismanGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  width: 100%;
  padding-bottom: 20px;
`;

export const ScrollArea = styled.div`
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 110px;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const ResultCardWrapper = styled.div<{ $isFlying: boolean }>`
  width: 100%;
  aspect-ratio: 1 / 1;
  margin-bottom: 28px;
  position: relative;
  /* 비행 중일 때 최상단으로 올리고 영역 제한 해제 */
  z-index: ${(props) => (props.$isFlying ? 1000 : 1)};
  overflow: visible; 
  pointer-events: ${(props) => (props.$isFlying ? 'none' : 'auto')};
  
  animation: ${(props) =>
    props.$isFlying
      ? css`
          ${cardFlyToInbox} 0.7s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards
        `
      : 'none'};
`;

export const ImageBox = styled.div<{ $bg?: string; $grade?: string; $glow?: boolean }>`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: ${(props) => props.$bg || '#f9fafb'};
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* overflow: hidden을 제거하여 glow와 비행 효과가 잘리지 않게 함 */
  position: relative;
  
  animation: ${css`
    ${bounceIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)
  `};
  ${(props) =>
    props.$grade === 'hidden' &&
    css`
      animation:
        ${bounceIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
        ${cardGlow} 3s infinite ease-in-out;
    `}
  ${(props) =>
    props.$glow &&
    css`
      animation:
        ${bounceIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
        ${A.goldGlow} 3s infinite ease-in-out;
    `}
  img {
    width: 90%;
    height: 90%;
    object-fit: contain;
    transform: scale(1.1);
  }
`;

export const PaymentList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

export const TalismanCard = styled.div<{
  $unlocked: boolean;
  $bgColor: string;
  $isHidden?: boolean;
  $revealStage?: 'none' | 'sealed' | 'shaking' | 'burst' | 'done';
}>`
  width: 100%;
  aspect-ratio: 1 / 1.3;
  border-radius: 22px;
  position: relative;
  background: ${(props) => props.$bgColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s;

  img {
    width: 90%;
    height: 90%;
    object-fit: contain;
    filter: ${(props) =>
      props.$unlocked ? 'none' : 'grayscale(100%) brightness(0.8)'};
    opacity: ${(props) => (props.$unlocked ? 1 : 0.3)};
  }

  ${(props) =>
    props.$isHidden &&
    props.$unlocked &&
    css`
      background: linear-gradient(
        135deg,
        #ffb3ba,
        #ffdfba,
        #ffffba,
        #baffc9,
        #bae1ff,
        #e0baff,
        #ffb3ba
      );
      background-size: 400% 400%;
      animation: ${A.rainbowSweep} 6s ease infinite;
    `}

  /* 해금 연출 단계별 애니메이션 */
  ${(props) =>
    props.$revealStage === 'sealed' &&
    css`
      animation: ${A.sealedFloating} 2s infinite ease-in-out;
      z-index: 100;
    `}

  ${(props) =>
    props.$revealStage === 'shaking' &&
    css`
      animation: ${A.sealedFloating} 2s infinite, ${A.shake} 0.1s infinite;
      z-index: 100;
    `}

  ${(props) =>
    props.$revealStage === 'burst' &&
    css`
      animation: ${A.dramaticReveal} 1s forwards;
      box-shadow: 0 0 50px rgba(255, 215, 0, 0.9);
      z-index: 100;
    `}

  ${(props) =>
    props.$revealStage === 'done' &&
    css`
      animation: ${A.fadeGlow} 1.5s ease-out forwards;
      z-index: 100;
    `}

  &:active {
    transform: scale(0.94);
  }
`;

export const UnlockOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.55),
    rgba(0, 0, 0, 0.25),
    rgba(0, 0, 0, 0)
  );
  animation: ${unlockSweep} 1.8s ease-in-out forwards;
  pointer-events: none;
`;

export const StepContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TitleArea = styled.div`
  padding: 30px 0 20px;
`;

export const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: #191f28;
  line-height: 1.4;
  margin: 0;
  white-space: pre-line;
`;

export const Description = styled.p`
  font-size: 16px;
  color: #4e5968;
  line-height: 1.5;
  margin: 12px 0 0;
  white-space: pre-line;
`;
