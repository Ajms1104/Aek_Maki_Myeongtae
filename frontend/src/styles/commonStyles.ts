import styled from 'styled-components';

export const MainButton = styled.button`
  width: 100%;
  height: 58px;
  border: none;
  border-radius: 18px;
  background: ${(props) =>
    props.disabled
      ? '#e5e8eb'
      : 'linear-gradient(90deg, #3182f6 0%, #3182f6 100%)'};
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active {
    transform: ${(props) => (props.disabled ? 'none' : 'scale(0.97)')};
  }
`;

export const ToastContainer = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(51, 61, 75, 0.95);
  backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 14px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  
  opacity: ${(props) => (props.$show ? 1 : 0)};
  visibility: ${(props) => (props.$show ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: ${(props) => (props.$show ? 'translate(-50%, 0)' : 'translate(-50%, 20px)')};
`;

export const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 34px;
  z-index: 20;
`;

export const FixedButtonGroup = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 24px 34px;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 1) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CollectionLink = styled.button`
  background: #f2f4f6;
  border: none;
  border-radius: 14px;
  padding: 10px 18px;
  color: #4e5968;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.96);
  }
`;
