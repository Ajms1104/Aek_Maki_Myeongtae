import React from 'react';
import * as C from '../../styles/commonStyles';
import * as S from '../../styles/stepStyles';

export const MainButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  return <C.MainButton {...props} />;
};

export const ImageBox: React.FC<{
  bg?: string;
  children: React.ReactNode;
}> = ({ bg, children }) => {
  // ImageBox는 stepStyles에 정의되어 있습니다.
  return <S.ImageBox $bg={bg}>{children}</S.ImageBox>;
};

export const FixedButtonGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <C.FixedButtonGroup>{children}</C.FixedButtonGroup>;
};
