import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomTabKey = 'home' | 'categories' | 'cart' | 'favorites' | 'profile';

type BottomNavbarProps = {
  activeTab: BottomTabKey;
};

export function BottomNavbar({ activeTab }: BottomNavbarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const iconColor = (tab: BottomTabKey) => (activeTab === tab ? '#67BB28' : '#A3A3A3');
  const textWeight = (tab: BottomTabKey) => (activeTab === tab ? 'font-tajawal-bold' : 'font-tajawal-medium');

  const navigate = (tab: BottomTabKey) => {
    if (tab === 'home') {
      router.replace('/home');
      return;
    }
    if (tab === 'favorites') {
      router.replace('/favorites');
      return;
    }
    if (tab === 'profile') {
      router.replace('/profile');
      return;
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-[#FCFBFA] flex-row-reverse items-center justify-around rounded-t-[30px] border border-[#EBEBEB] pt-4"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <Pressable className="items-center w-[60px]" onPress={() => navigate('home')}>
        <Ionicons name="home-outline" size={24} color={iconColor('home')} />
        <Text className={`${textWeight('home')} text-[10px] mt-1`} style={{ color: iconColor('home') }}>الرئيسية</Text>
      </Pressable>

      <Pressable className="items-center w-[60px]">
        <Feather name="grid" size={22} color={iconColor('categories')} />
        <Text className={`${textWeight('categories')} text-[10px] mt-1`} style={{ color: iconColor('categories') }}>الفئات</Text>
      </Pressable>

      <Pressable className="items-center w-[60px]">
        <Ionicons name="cart-outline" size={24} color={iconColor('cart')} />
        <Text className={`${textWeight('cart')} text-[10px] mt-1`} style={{ color: iconColor('cart') }}>السلة</Text>
      </Pressable>

      <Pressable className="items-center w-[60px]" onPress={() => navigate('favorites')}>
        {activeTab === 'favorites' ? (
          <View className="w-10 h-10 bg-[#67BB28] rounded-full items-center justify-center mb-1">
            <Ionicons name="heart" size={20} color="white" />
          </View>
        ) : (
          <Ionicons name="heart-outline" size={24} color={iconColor('favorites')} />
        )}
        <Text className={`${textWeight('favorites')} text-[10px] mt-1`} style={{ color: iconColor('favorites') }}>المفضلة</Text>
      </Pressable>

      <Pressable className="items-center w-[60px]" onPress={() => navigate('profile')}>
        {activeTab === 'profile' ? (
          <View className="w-10 h-10 bg-[#67BB28] rounded-full items-center justify-center mb-1">
            <Feather name="user" size={20} color="white" />
          </View>
        ) : (
          <Feather name="user" size={24} color={iconColor('profile')} />
        )}
        <Text className={`${textWeight('profile')} text-[10px] mt-1`} style={{ color: iconColor('profile') }}>حسابي</Text>
      </Pressable>
    </View>
  );
}
