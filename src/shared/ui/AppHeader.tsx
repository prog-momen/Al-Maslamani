import { Image } from 'expo-image';
import React, { ReactNode } from 'react';
import { View } from 'react-native';

type AppHeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  logo?: 'logo2' | 'transparent' | 'none';
  className?: string;
};

const logoSourceMap = {
  logo2: require('@/assets/images/logo2.png'),
  transparent: require('@/assets/images/logo-transparent.png'),
};

export function AppHeader({ left, right, logo = 'logo2', className = '' }: AppHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between px-6 pt-4 pb-2 ${className}`}>
      <View className="w-10 h-10 items-center justify-center">{left}</View>
      {logo === 'none' ? (
        <View className="flex-1" />
      ) : (
        <Image
          source={logoSourceMap[logo]}
          className={logo === 'transparent' ? 'w-56 h-20' : 'w-[100px] h-[40px]'}
          contentFit="contain"
          transition={200}
        />
      )}
      <View className="w-10 h-10 items-center justify-center">{right}</View>
    </View>
  );
}
