import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomTabKey = 'home' | 'categories' | 'cart' | 'favorites' | 'profile';

type BottomNavbarProps = {
  activeTab: BottomTabKey;
  cartCount?: number;
};

export function BottomNavbar({ activeTab, cartCount = 0 }: BottomNavbarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const iconColor = (tab: BottomTabKey) => (activeTab === tab ? '#FFFFFF' : '#4E5D50');
  const textWeight = (tab: BottomTabKey) => (activeTab === tab ? 'font-tajawal-bold' : 'font-tajawal-medium');

  const navigate = (tab: BottomTabKey) => {
    if (tab === 'home') {
      router.replace('/home');
      return;
    }
    if (tab === 'categories') {
      router.replace('/categories' as never);
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

  const TabItem = ({
    tab,
    label,
    icon,
    showBadge,
  }: {
    tab: BottomTabKey;
    label: string;
    icon: React.ReactNode;
    showBadge?: boolean;
  }) => {
    const isActive = activeTab === tab;

    return (
      <Pressable
        className={`items-center justify-center min-w-[62px] h-[54px] rounded-full px-3 ${isActive ? 'bg-brand-primary' : ''}`}
        onPress={() => navigate(tab)}
      >
        <View className="relative">
          {icon}
          {showBadge && cartCount > 0 ? (
            <View className="absolute -top-2 -left-3 min-w-[18px] h-[18px] rounded-full bg-[#C53673] items-center justify-center px-1">
              <Text className="text-white text-[10px] font-tajawal-bold">{cartCount}</Text>
            </View>
          ) : null}
        </View>
        <Text className={`${textWeight(tab)} text-[11px] mt-1`} style={{ color: isActive ? '#FFFFFF' : '#4E5D50' }}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-[#FCFBFA] flex-row-reverse items-center justify-around rounded-t-[30px] border border-[#EBEBEB] pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <TabItem tab="home" label="الرئيسية" icon={<Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={23} color={iconColor('home')} />} />
      <TabItem tab="categories" label="الفئات" icon={<Feather name="grid" size={22} color={iconColor('categories')} />} />
      <TabItem tab="cart" label="السلة" icon={<Ionicons name="cart-outline" size={23} color={iconColor('cart')} />} showBadge />
      <TabItem tab="favorites" label="المفضلة" icon={<Ionicons name={activeTab === 'favorites' ? 'heart' : 'heart-outline'} size={23} color={iconColor('favorites')} />} />
      <TabItem tab="profile" label="حسابي" icon={<Feather name="user" size={22} color={iconColor('profile')} />} />
    </View>
  );
}
