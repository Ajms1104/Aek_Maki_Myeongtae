import { keyframes } from 'styled-components';

export const brushWork = keyframes`
  0% { transform: translate(0, 0) rotate(0deg) scale(1.2); }
  25% { transform: translate(5px, -5px) rotate(1deg) scale(1.2); }
  50% { transform: translate(0, 0) rotate(0deg) scale(1.2); }
  75% { transform: translate(-5px, 5px) rotate(-1deg) scale(1.2); }
  100% { transform: translate(0, 0) rotate(0deg) scale(1.2); }
`;

export const checkAppear = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`;

export const shake = keyframes`
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-3px, -4px) rotate(-3deg); }
  20% { transform: translate(-6px, 0px) rotate(3deg); }
  30% { transform: translate(6px, 4px) rotate(0deg); }
  40% { transform: translate(3px, -2px) rotate(3deg); }
  50% { transform: translate(-3px, 6px) rotate(-3deg); }
  60% { transform: translate(-6px, 2px) rotate(0deg); }
  70% { transform: translate(6px, 2px) rotate(-3deg); }
  80% { transform: translate(-3px, -2px) rotate(3deg); }
  90% { transform: translate(3px, 4px) rotate(0deg); }
  100% { transform: translate(1px, -4px) rotate(-3deg); }
`;

export const dramaticReveal = keyframes`
  0% { transform: scale(1) rotate(0); filter: brightness(1) blur(0); }
  30% { transform: scale(1.1) rotate(5deg); filter: brightness(2) blur(2px); }
  60% { transform: scale(0.9) rotate(-5deg); filter: brightness(4) blur(4px); }
  100% { transform: scale(1.6); filter: brightness(1) blur(0); opacity: 1; }
`;

export const sealedFloating = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.08); }
`;

export const fadeGlow = keyframes`
  0% { box-shadow: 0 0 0 rgba(255, 215, 0, 0); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
  100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
`;

export const rainbowSweep = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const goldGlow = keyframes`
  0% { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); }
  50% { filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.9)); }
  100% { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); }
`;

export const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

export const ripple = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
`;

export const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.2; }
  100% { transform: scale(1); opacity: 0.5; }
`;
