import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SidebarDrawer, SidebarItemKey } from './SidebarDrawer';

type AppHeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  title?: string;
  logo?: 'logo2' | 'transparent' | 'none';
  className?: string;
  withSidebar?: boolean;
  sidebarActiveItem?: SidebarItemKey;
  sidebarSide?: 'left' | 'right';
};

const logoSourceMap = {
  logo2: require('../../../assets/images/logo2.png'),
  transparent: require('../../../assets/images/logo-transparent.png'),
};

export function AppHeader({
  left,
  right,
  title,
  logo = 'transparent',
  className = '',
  withSidebar = false,
  sidebarActiveItem,
  sidebarSide = 'right',
}: AppHeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);

  const leftNode = withSidebar && sidebarSide === 'left' ? (
    <Pressable onPress={openSidebar} hitSlop={10} className="w-11 h-11 items-center justify-center">
      {left ?? <Ionicons name="menu" size={28} color="#67BB28" />}
    </Pressable>
  ) : (
    left
  );

  const rightNode = withSidebar && sidebarSide === 'right' ? (
    <Pressable onPress={openSidebar} hitSlop={10} className="w-11 h-11 items-center justify-center">
      {right ?? <Ionicons name="menu" size={28} color="#67BB28" />}
    </Pressable>
  ) : (
    right
  );

  return (
    <>
      <View className={`flex-row items-center justify-between px-6 pt-2 pb-2 min-h-[64px] ${className}`}>
        <View className="w-11 h-11 items-center justify-center">{leftNode}</View>
        <View className="flex-1 items-center justify-center">
          {title ? (
            <Text className="font-tajawal-bold text-[20px] text-brand-title">{title}</Text>
          ) : logo === 'none' ? null : (
            <Image
              source={logoSourceMap[logo]}
              style={logo === 'transparent' ? { width: 170, height: 72 } : { width: 84, height: 34 }}
              contentFit="contain"
              transition={200}
            />
          )}
        </View>
        <View className="w-11 h-11 items-center justify-center">{rightNode}</View>
      </View>
      {withSidebar ? (
        <SidebarDrawer
          visible={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem={sidebarActiveItem}
        />
      ) : null}
    </>
  );
}
