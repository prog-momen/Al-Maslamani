import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const CARD_BASE_CLASS = 'rounded-[24px] border border-[#EBEBEB] bg-[#FCFBFA] shadow-sm';

export function Card({ children, className = '' }: CardProps) {
  return <View className={`${CARD_BASE_CLASS} ${className}`}>{children}</View>;
}