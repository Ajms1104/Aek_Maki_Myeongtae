import React from 'react';
import {
  IoChatbubbleEllipsesOutline,
  IoDocumentTextOutline,
  IoReceiptOutline,
} from 'react-icons/io5';
import * as O from '../styles/overlayStyles';
import { useNavigation } from '../hooks/useNavigation';
import { useUI } from '../hooks/useUI';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { navigateTo } = useNavigation();
  const { openDialog } = useUI();

  return (
    <>
      <O.MenuOverlay $show={isOpen} onClick={onClose} />
      <O.BottomSheetContainer $show={isOpen}>
        <div
          style={{
            width: '40px',
            height: '5px',
            background: '#e5e8eb',
            borderRadius: '10px',
            margin: '0 auto 24px',
          }}
        />
        <O.MenuTitle>서비스 메뉴</O.MenuTitle>
        <O.MenuList>
          <O.MenuItem
            onClick={() => {
              navigateTo('customer_service');
              onClose();
            }}
          >
            <div className="icon">
              <IoChatbubbleEllipsesOutline size={22} />
            </div>
            <span>고객센터 문의하기</span>
          </O.MenuItem>

          <O.MenuItem
            onClick={() => {
              onClose();
              openDialog('결제 내역', '최근 30일 동안\n결제한 내역이 없습니다.');
            }}
          >
            <div className="icon">
              <IoReceiptOutline size={22} />
            </div>
            <span>내 결제 내역</span>
          </O.MenuItem>

          <O.MenuItem onClick={onClose}>
            <div className="icon">
              <IoDocumentTextOutline size={22} />
            </div>
            <span>이용약관 및 정책</span>
          </O.MenuItem>
        </O.MenuList>
      </O.BottomSheetContainer>
    </>
  );
};
