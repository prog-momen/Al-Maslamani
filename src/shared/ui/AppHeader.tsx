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

export function AppHeader({ left, right, logo = 'transparent', className = '' }: AppHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between px-6 pt-2 pb-2 ${className}`}>
      <View className="w-11 h-11 items-center justify-center">{left}</View>
      <View className="flex-1 items-center justify-center">
        {logo === 'none' ? null : (
          <Image
            source={logoSourceMap[logo]}
            className={logo === 'transparent' ? 'w-[170px] h-[90px]' : 'w-[84px] h-[36px]'}
            contentFit="contain"
            transition={200}
          />
        )}
      </View>
      <View className="w-11 h-11 items-center justify-center">{right}</View>
    </View>
  );
}
