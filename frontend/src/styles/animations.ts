import { keyframes } from 'styled-components';

export const brushWork = keyframes`
  0% { transform: translate(0, 0) rotate(0deg) scale(1.2); }
  25% { transform: translate(5px, -5px) rotate(1deg) scale(1.2); }
  50% { transform: translate(0, 5px) rotate(-1deg) scale(1.2); }
  75% { transform: translate(-5px, -5px) rotate(1deg) scale(1.2); }
  100% { transform: translate(0, 0) rotate(0deg) scale(1.2); }
`;

export const checkAppear = keyframes`
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
`;

export const toastUp = keyframes`
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

export const toastFadeOut = keyframes`
  from { opacity: 1; transform: translate(-50%, 0); }
  to { opacity: 0; transform: translate(-50%, 10px); }
`;

export const goldGlow = keyframes`
  0% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4)); }
  50% { filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.7)); }
  100% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4)); }
`;

export const fadeGlow = keyframes`
  0% { filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)); opacity: 1; }
  100% { filter: drop-shadow(0 0 0px rgba(255, 215, 0, 0)); opacity: 1; }
`;

export const rainbowSweep = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const bounceIn = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
`;

export const unlockSweep = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-100%) scale(1.2); opacity: 0; }
`;

export const shake = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-2px, -1px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
`;

export const contentShake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

export const dramaticReveal = keyframes`
  0% { transform: scale(0.9); filter: brightness(0) blur(10px); opacity: 1; }
  40% { transform: scale(1.15); filter: brightness(4) blur(4px); opacity: 1; }
  100% { transform: scale(1); filter: brightness(1) blur(0px); opacity: 1; }
`;

export const sealedFloating = keyframes`
  0%, 100% { transform: translateY(0) scale(1); filter: brightness(0.3) grayscale(1); }
  50% { transform: translateY(-5px) scale(1.02); filter: brightness(0.5) grayscale(1); }
`;

export const lightRadial = keyframes`
  0% { transform: scale(0); opacity: 0; }
  20% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
`;

export const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.2; }
  100% { transform: scale(1); opacity: 0.5; }
`;
