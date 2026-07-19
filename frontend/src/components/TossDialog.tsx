import React from 'react';
import * as O from '../styles/overlayStyles';
import * as C from '../styles/commonStyles';

interface TossDialogProps {
  title: string;
  description: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
  cancelText?: string;
  confirmText?: string;
}

export const TossDialog: React.FC<TossDialogProps> = ({
  title,
  description,
  showCancel,
  onConfirm,
  onClose,
  cancelText = '닫기',
  confirmText,
}) => {
  const displayConfirmText = confirmText || (showCancel ? '나가기' : '확인했습니다');

  return (
    <O.ModalOverlay onClick={onClose}>
      <O.ModalContent onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#191f28',
            margin: '0 0 12px 0',
            textAlign: 'left',
            width: '100%',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: '#4e5968',
            lineHeight: '1.6',
            margin: '0 0 28px 0',
            textAlign: 'left',
            width: '100%',
            whiteSpace: 'pre-wrap',
          }}
        >
          {description}
        </p>

        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          {showCancel && (
            <C.MainButton
              onClick={onClose}
              style={{
                flex: 1,
                background: '#f2f4f6',
                color: '#4e5968',
              }}
            >
              {cancelText}
            </C.MainButton>
          )}
          <C.MainButton
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            style={{ flex: 1 }}
          >
            {displayConfirmText}
          </C.MainButton>
        </div>
      </O.ModalContent>
    </O.ModalOverlay>
  );
};
