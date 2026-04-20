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
  const isHidden = talisman.grade === 'legend';
  const theme = GRADE_COLORS[talisman.grade];
  const description = talisman.unlocked
    ? '이 부적은 당신의 길에 찬란한 행운과 긍정적인 에너지를 불러올 거예요.'
    : '아직 숨겨져 있는 신비로운 부적입니다.';

  return (
    <O.ModalOverlay onClick={onClose}>
      <O.ModalContent onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            alignSelf: 'flex-end',
            cursor: 'pointer',
            marginTop: '-10px',
            marginRight: '-10px',
          }}
          onClick={onClose}
        >
          {/* 모달 우측 상단 X 표시 색상을 진하게 변경 */}
          <IoCloseCircle size={32} color="#000000" />
        </div>

        <O.ModalImageContainer
          $isHidden={isHidden}
          $unlocked={talisman.unlocked}
          $bg={talisman.unlocked ? theme.bg : '#f2f4f6'}
        >
          <img
            src={talisman.img}
            alt={talisman.name}
            style={{
              width: '85%',
              filter: talisman.unlocked ? 'none' : 'grayscale(1)',
            }}
          />
        </O.ModalImageContainer>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 800,
            marginBottom: '8px',
            color: '#191f28',
          }}
        >
          {talisman.unlocked ? talisman.name : '숨겨져 있는 부적'}
        </h2>

        <O.DescriptionBox>
          <p
            style={{
              fontSize: '15px',
              color: '#4e5968',
              lineHeight: '1.6',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {description}
          </p>
        </O.DescriptionBox>

        <C.MainButton
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '24px',
            background: isHidden
              ? 'linear-gradient(90deg, #ffb3ba 0%, #bae1ff 100%)'
              : '#3182f6',
          }}
        >
          확인
        </C.MainButton>
      </O.ModalContent>
    </O.ModalOverlay>
  );
};
