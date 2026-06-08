import React from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import * as O from '../styles/overlayStyles';
import * as C from '../styles/commonStyles';
import { type Talisman } from '../types/index';
import { GRADE_COLORS } from '../constants/talisman';

export const TalismanDetailModal: React.FC<{
  talisman: Talisman;
  onClose: () => void;
}> = ({ talisman, onClose }) => {
  const [showLetter, setShowLetter] = React.useState(false);
  const theme = GRADE_COLORS[talisman.grade];
  const isHiddenGrade = talisman.grade === 'hidden';
  
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
          padding: '24px',
          overflow: 'hidden' // 스크롤 절대 금지
        }}
      >
        <div
          style={{
            alignSelf: 'flex-end',
            cursor: 'pointer',
            marginTop: '-10px',
            marginRight: '-10px',
            flexShrink: 0
          }}
          onClick={onClose}
        >
          <IoCloseCircle size={32} color="#000000" />
        </div>

        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <O.ModalImageContainer
              $isHidden={isHiddenGrade}
              $unlocked={talisman.unlocked}
              $bg={talisman.unlocked ? theme.bg : '#f2f4f6'}
              style={{ flexShrink: 0, width: '180px', height: '180px' }} // 이미지 크기 고정으로 스크롤 방지
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
                fontWeight: 800,
                marginBottom: '12px',
                marginTop: '16px',
                color: '#191f28',
                textAlign: 'center'
              }}
            >
              {talisman.unlocked ? talisman.name : '숨겨져 있는 부적'}
            </h2>

            <O.DescriptionBox style={{ width: '100%', padding: '0 10px' }}>
              <p
                style={{
                  fontSize: '15px',
                  color: '#4e5968',
                  lineHeight: '1.5',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  wordBreak: 'keep-all'
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
                fontSize: '15px'
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
              fontSize: '15px'
            }}
          >
            확인
          </C.MainButton>
        </div>
      </O.ModalContent>
    </O.ModalOverlay>
  );
};
