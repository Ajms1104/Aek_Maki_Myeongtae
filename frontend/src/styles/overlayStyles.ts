import styled, { css, keyframes } from 'styled-components';

const rainbowSweep = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  width: 340px;
  max-height: 90%;
  background: white;
  border-radius: 32px;
  padding: 32px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

interface ModalImageContainerProps {
  $isHidden: boolean;
  $unlocked: boolean;
  $bg: string;
}

export const ModalImageContainer = styled.div<ModalImageContainerProps>`
  width: 100%;
  aspect-ratio: 1 / 1.1;
  border-radius: 24px;
  background: ${(props) =>
    props.$isHidden && props.$unlocked
      ? 'linear-gradient(135deg, #ffb3ba, #ffdfba, #ffffba, #baffc9, #bae1ff, #e0baff, #ffb3ba)'
      : props.$bg};
  background-size: 400% 400%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  overflow: hidden;
  animation: ${(props) =>
    props.$isHidden && props.$unlocked
      ? css`
          ${rainbowSweep} 6s ease infinite
        `
      : 'none'};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

export const TalismanCard = styled.div<{
  $unlocked: boolean;
  $bgColor: string;
  $isHidden?: boolean;
}>`
  width: 100%;
  aspect-ratio: 1 / 1.3;
  border-radius: 22px;
  position: relative;
  background: ${(props) =>
    props.$isHidden && props.$unlocked
      ? 'linear-gradient(135deg, #ffb3ba, #ffdfba, #ffffba, #baffc9, #bae1ff, #e0baff, #ffb3ba)'
      : props.$bgColor};
  background-size: 400% 400%;
  animation: ${(props) =>
    props.$isHidden && props.$unlocked
      ? css`
          ${rainbowSweep} 6s ease infinite
        `
      : 'none'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  img {
    width: 90%;
    height: 90%;
    object-fit: contain;
    filter: ${(props) =>
      props.$unlocked ? 'none' : 'grayscale(100%) brightness(0.8)'};
    opacity: ${(props) => (props.$unlocked ? 1 : 0.3)};
  }
  .lock {
    position: absolute;
    color: rgba(0, 0, 0, 0.15);
    font-size: 24px;
    z-index: 2;
  }
  &:active {
    transform: scale(0.94);
  }
`;

export const DescriptionBox = styled.div`
  width: 100%;
  padding: 20px;
  background: #f9fafb;
  border-radius: 20px;
  position: relative;
  margin-top: 8px;
  &::before {
    content: '"';
    position: absolute;
    top: 10px;
    left: 15px;
    color: #e5e8eb;
    font-size: 40px;
    font-family: serif;
  }
  &::after {
    content: '"';
    position: absolute;
    bottom: -10px;
    right: 15px;
    color: #e5e8eb;
    font-size: 40px;
    font-family: serif;
  }
`;

export const BottomSheetContainer = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 32px 32px 0 0;
  padding: 12px 24px 44px;
  z-index: 99999;
  display: ${(props) => (props.$show ? 'flex' : 'none')};
  flex-direction: column;
`;

export const MenuTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: #191f28;
  margin-bottom: 24px;
`;

export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  cursor: pointer;
  .icon {
    width: 44px;
    height: 44px;
    background: #f2f4f6;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5968;
  }
  span {
    font-size: 16px;
    font-weight: 600;
    color: #333d4b;
  }
`;

export const MenuOverlay = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: ${(props) => (props.$show ? 'block' : 'none')};
  z-index: 99998;
`;

export const PaymentItem = styled.div<{ $active?: boolean }>`
  width: 100%;
  padding: 20px;
  border-radius: 24px;
  background: #ffffff;
  border: 2px solid ${(props) => (props.$active ? '#3182f6' : '#f2f4f6')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;
