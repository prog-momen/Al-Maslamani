import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SidebarItemKey =
  | 'home'
  | 'categories'
  | 'cart'
  | 'favorites'
  | 'orders'
  | 'profile'
  | 'about'
  | 'contact';

type SidebarDrawerProps = {
  visible: boolean;
  onClose: () => void;
  activeItem?: SidebarItemKey;
};

const items: {
  key: SidebarItemKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}[] = [
  { key: 'home', label: 'الصفحة الرئيسية', icon: 'grid-outline', route: '/home' },
  { key: 'profile', label: 'الملف الشخصي', icon: 'person-outline', route: '/profile' },
  { key: 'categories', label: 'التصنيفات', icon: 'apps-outline', route: '/categories' },
  { key: 'cart', label: 'السلة', icon: 'cart-outline', route: '/home' },
  { key: 'favorites', label: 'المفضلة', icon: 'heart-outline', route: '/favorites' },
  { key: 'orders', label: 'الطلبات', icon: 'receipt-outline', route: '/order-history' },
  { key: 'about', label: 'عن الشركة', icon: 'information-circle-outline', route: '/about-us' },
  { key: 'contact', label: 'تواصل معنا', icon: 'help-circle-outline', route: '/contact-us' },
];

export function SidebarDrawer({ visible, onClose, activeItem }: SidebarDrawerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const handleNavigate = (route: string) => {
    onClose();
    router.replace(route as never);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error(error);
    }
  };

  const displayName = user?.user_metadata?.full_name || 'أحمد العامري';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <View
          className="bg-[#F5F4F0]"
          style={{ width: '82%', paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 14) }}
        >
          <Pressable onPress={onClose} hitSlop={10} className="w-10 h-10 items-center justify-center mr-3 mb-2">
            <Ionicons name="close" size={24} color="#3F3F3F" />
          </Pressable>

          <View className="items-center mb-5">
            <View className="w-[68px] h-[68px] rounded-full bg-[#67BB28] border-2 border-white items-center justify-center">
              <Ionicons name="person" size={40} color="#F2F6EA" />
            </View>
            <Text className="font-tajawal-bold text-[26px] text-[#67BB28] mt-2">{displayName}</Text>
          </View>

          <View className="px-4">
            {items.map((item) => {
              const isActive = item.key === activeItem;
              return (
                <TouchableOpacity
                  key={item.key}
                  className={`h-[44px] rounded-full mb-2 px-4 flex-row-reverse items-center justify-between ${
                    isActive ? 'bg-[#67BB28]' : ''
                  }`}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.85}
                >
                  <Text className={`font-tajawal-medium text-[20px] ${isActive ? 'text-white' : 'text-[#2E3133]'}`}>
                    {item.label}
                  </Text>
                  <Ionicons name={item.icon} size={20} color={isActive ? '#FFFFFF' : '#2E3133'} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="mt-auto px-4 pt-3 border-t border-[#E8E3DB]">
            <TouchableOpacity
              className="h-[42px] rounded-full bg-[#F1E6DD] flex-row-reverse items-center justify-center gap-2"
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text className="font-tajawal-bold text-[18px] text-[#D94716]">تسجيل الخروج</Text>
              <Ionicons name="log-out-outline" size={20} color="#D94716" />
            </TouchableOpacity>
          </View>
        </View>

        <Pressable className="flex-1 bg-black/25" onPress={onClose} />
      </View>
    </Modal>
  );
}
