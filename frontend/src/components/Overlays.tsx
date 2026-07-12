import React, { useEffect, useRef } from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import * as O from '../styles/overlayStyles';
import * as C from '../styles/commonStyles';
import { type Talisman } from '../types/index';
import { GRADE_COLORS } from '../constants/talisman';
import { useTossBanner } from '../hooks/useTossBanner';

export const TalismanDetailModal: React.FC<{
  talisman: Talisman;
  onClose: () => void;
}> = ({ talisman, onClose }) => {
  const [showLetter, setShowLetter] = React.useState(false);
  const theme = GRADE_COLORS[talisman.grade];
  const isHiddenGrade = talisman.grade === 'hidden';

  // ✅ 토스 광고 배너 연동
  const bannerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !bannerRef.current) return;
    const attached = attachBanner('ait.v2.live.71baf9f8b7fe466d', bannerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: { onAdFailedToRender: (payload) => console.error('모달 광고 렌더링 실패:', payload) },
    });
    return () => { attached?.destroy(); };
  }, [isInitialized, attachBanner]);
  
  // 개별 설명(description)이 있으면 그것을 먼저 보여주고, 없으면 기본 문구 출력
  const displayDescription = (talisman.unlocked && talisman.description)
    ? talisman.description
    : (talisman.unlocked 
        ? '이 부적은 당신의 길에 찬란한 행운과 긍정적인 에너지를 불러올 거예요.' 
        : '아직 숨겨져 있는 신비로운 부적입니다.');

  // --- [감사 편지 뷰] ---
  if (showLetter && talisman.letter) {
    return (
      <O.ModalOverlay onClick={() => setShowLetter(false)}>
        <O.ModalContent 
          onClick={(e) => e.stopPropagation()} 
          style={{ 
            padding: '30px', 
            maxHeight: '85vh', // 스크롤 방지를 위해 높이 축소
            background: '#fff9db',
            border: '2px solid #fab005',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden' // 스크롤 금지
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#e67e22', marginBottom: '10px' }}>FROM. 개발자 명태</div>
          <div style={{ width: '40px', height: '2px', background: '#fab005', marginBottom: '24px' }} />
          
          <p style={{
            fontSize: '18px',
            color: '#191f28',
            lineHeight: '1.7',
            textAlign: 'center',
            wordBreak: 'keep-all',
            fontFamily: talisman.fontFamily || '"Nanum Pen Script", cursive',
            fontWeight: 500,
            margin: 0,
            whiteSpace: 'pre-wrap'
          }}>
            "{talisman.letter}"
          </p>

          <div style={{ width: '100%', height: '1px', background: '#fab005', opacity: 0.3, margin: '30px 0 20px' }} />
          <C.MainButton 
            onClick={() => setShowLetter(false)} 
            style={{ 
              width: '100%', 
              background: 'transparent', 
              color: '#e67e22', 
              border: '1px solid #fab005',
              height: '50px' 
            }}
          >
            돌아가기
          </C.MainButton>
        </O.ModalContent>
      </O.ModalOverlay>
    );
  }

  // --- [기본 부적 상세 뷰] ---
  return (
    <O.ModalOverlay onClick={onClose}>
      <O.ModalContent 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '85vh', // 스크롤 방지를 위해 높이 제한
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          background: '#fdfcf9', // 정갈한 한지 크림색 배경
          border: `2px solid ${talisman.unlocked ? theme.sub : '#e5e8eb'}`,
          borderRadius: '32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          overflow: 'hidden' // 스크롤 절대 금지
        }}
      >
        <div
          style={{
            alignSelf: 'flex-end',
            cursor: 'pointer',
            marginTop: '-6px',
            marginRight: '-6px',
            flexShrink: 0
          }}
          onClick={onClose}
        >
          <IoCloseCircle size={32} color="#8b95a1" />
        </div>

        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* 등급별 전통 미니 배지 */}
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 900, 
              color: talisman.unlocked ? theme.text : '#8b95a1', 
              background: talisman.unlocked ? theme.bg : '#f2f4f6', 
              padding: '4px 10px', 
              borderRadius: '8px', 
              border: `1.5px solid ${talisman.unlocked ? theme.sub : '#e5e8eb'}`,
              marginBottom: '14px',
              letterSpacing: '0.5px',
              flexShrink: 0
            }}>
              {talisman.grade === 'legend' ? '👑 전설 부적' : talisman.grade === 'rare' ? '✨ 희귀 부적' : talisman.grade === 'hidden' ? '🔒 히든 부적' : '🐟 일반 부적'}
            </div>

            <O.ModalImageContainer
              $isHidden={isHiddenGrade}
              $unlocked={talisman.unlocked}
              $bg={talisman.unlocked ? theme.bg : '#f2f4f6'}
              style={{ 
                flexShrink: 0, 
                width: '160px', 
                height: '160px',
                borderRadius: '24px',
                boxShadow: talisman.unlocked ? `0 12px 36px ${theme.sub}40` : 'none'
              }}
            >
              <img
                src={talisman.img}
                alt={talisman.name}
                style={{
                  width: '80%',
                  filter: talisman.unlocked ? 'none' : 'grayscale(1)',
                }}
              />
            </O.ModalImageContainer>

            <h2
              style={{
                fontSize: '22px',
                fontWeight: 900,
                marginBottom: '4px',
                marginTop: '16px',
                color: '#191f28',
                textAlign: 'center',
                fontFamily: '"Pretendard", "Noto Serif KR", sans-serif'
              }}
            >
              {talisman.unlocked ? talisman.name : '숨겨져 있는 부적'}
            </h2>

            {/* 등급 색상 미니 데코 바 */}
            <div style={{ width: '28px', height: '2.5px', background: talisman.unlocked ? theme.sub : '#e5e8eb', borderRadius: '999px', marginBottom: '14px', flexShrink: 0 }} />

            <O.DescriptionBox style={{ 
              width: '100%', 
              padding: '14px 16px',
              background: '#f5f2eb', // 옅은 고서적 한지 질감 박스
              borderRadius: '16px',
              border: '1px solid #eae5db'
            }}>
              <p
                style={{
                  fontSize: '14px',
                  color: '#4e5968',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  wordBreak: 'keep-all',
                  fontWeight: 600
                }}
              >
                {displayDescription}
              </p>
            </O.DescriptionBox>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px', flexShrink: 0 }}>
          {isHiddenGrade && talisman.unlocked && talisman.letter && (
            <C.MainButton
              onClick={() => setShowLetter(true)}
              style={{
                flex: 1,
                background: '#fff9db',
                color: '#e67e22',
                border: '1px solid #fab005',
                fontSize: '15px',
                fontWeight: 800,
                borderRadius: '14px'
              }}
            >
              ✨ 편지 보기
            </C.MainButton>
          )}
          <C.MainButton
            onClick={onClose}
            style={{
              flex: 1,
              background: isHiddenGrade
                ? 'linear-gradient(90deg, #ffb3ba 0%, #bae1ff 100%)'
                : (talisman.grade === 'common' ? '#3182f6' : theme.text),
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              borderRadius: '14px',
              boxShadow: talisman.unlocked ? `0 4px 12px ${theme.sub}20` : 'none'
            }}
          >
            확인
          </C.MainButton>
        </div>
      </O.ModalContent>

      {/* 토스 배너 광고 지면 (모달 카드 바깥 하단에 고정 배치) */}
      <div 
        onClick={(e) => e.stopPropagation()} // 광고 클릭 시 모달이 닫히지 않도록 차단
        ref={bannerRef} 
        style={{ 
          width: 'calc(100% - 48px)', 
          maxWidth: '320px',
          minHeight: '64px', 
          borderRadius: '20px', 
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          backgroundColor: '#ffffff',
          marginTop: '16px',
          flexShrink: 0
        }} 
      />
    </O.ModalOverlay>
  );
};
