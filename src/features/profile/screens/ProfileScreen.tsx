import { getMyOrders } from '@/src/features/orders/services/orders.service';
import { getFavoriteProductIds } from '@/src/features/products/services/products.service';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, CARD_BASE_CLASS } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from '@/src/shared/contexts/NotificationContext';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

const Icons = {
  Menu: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Line x1="4" x2="20" y1="12" y2="12" />
      <Line x1="4" x2="20" y1="6" y2="6" />
      <Line x1="4" x2="20" y1="18" y2="18" />
    </Svg>
  ),
  Edit: (props: any) => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </Svg>
  ),
  Bag: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <Line x1="3" x2="21" y1="6" y2="6" />
      <Path d="M16 10a4 4 0 0 1-8 0" />
    </Svg>
  ),
  MapPin: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  Bell: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  ),
  Info: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 16v-4" />
      <Path d="M12 8h.01" />
    </Svg>
  ),
  Headset: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Zm-9 6v3Zm-4 3h8" />
    </Svg>
  ),
  ChevronLeft: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="m15 18-6-6 6-6" />
    </Svg>
  ),
  Logout: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" x2="9" y1="12" y2="12" />
    </Svg>
  ),
  Home: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  ),
  Category: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Rect width="7" height="7" x="3" y="3" rx="1" />
      <Rect width="7" height="7" x="14" y="3" rx="1" />
      <Rect width="7" height="7" x="14" y="14" rx="1" />
      <Path d="M6 14 L9 21 L3 21 Z" />
    </Svg>
  ),
  Cart: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx="8" cy="21" r="1" />
      <Circle cx="19" cy="21" r="1" />
      <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </Svg>
  ),
  Heart: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Svg>
  ),
  User: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" {...props}>
      <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </Svg>
  )
};

export function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const { unreadCount } = useNotifications();

  const loadStats = useCallback(async () => {
    if (!user?.id) {
      setFavoritesCount(0);
      setCompletedOrdersCount(0);
      return;
    }

    try {
      const [favoriteIds, orders] = await Promise.all([
        getFavoriteProductIds(user.id),
        getMyOrders(user.id),
      ]);

      setFavoritesCount(favoriteIds.length);
      setCompletedOrdersCount(orders.filter((order) => order.status === 'delivered').length);
    } catch (error) {
      console.error('Failed to load profile stats:', error);
      setFavoritesCount(0);
      setCompletedOrdersCount(0);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F2EC]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']}>
          {/* Header */}
          <AppHeader
            logo="transparent"
            withSidebar
            sidebarActiveItem="profile"
            sidebarSide="left"
            left={<Icons.Menu color="#67BB28" />}
            right={
              <Pressable className="hit-slop-10" onPress={() => router.push('/contact-us')}>
                <Ionicons name="help-circle-outline" size={28} color="#67BB28" />
              </Pressable>
            }
          />

          {/* Profile Section */}
          <View className="items-center mt-8">
            <View className="relative">
              <View className="w-[120px] h-[120px] rounded-full bg-[#67BB28] items-center justify-center border-4 border-white shadow-sm overflow-hidden pt-6">
                <Svg width="80" height="80" viewBox="0 0 24 24" fill="#F5F2EC">
                  <Circle cx="12" cy="8" r="4" />
                  <Path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z" />
                </Svg>
              </View>
              <Pressable className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#67BB28] border-2 border-white items-center justify-center">
                <Icons.Edit color="white" />
              </Pressable>
            </View>

            <Text className="font-tajawal-bold text-[24px] text-brand-title mt-4">
              {user?.user_metadata?.full_name || 'سعد المسلماني'}
            </Text>
            <Text className="font-tajawal-medium text-[14px] text-[#71717A] mt-1">
              {user?.email || 'saad.almuslemani@gmail.com'}
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="flex-row px-4 mt-8 gap-4">
            <View className={`${CARD_BASE_CLASS} flex-1 py-6 items-center justify-center`}>
              <Text className="font-tajawal-bold text-[20px] text-[#67BB28] mb-1">{favoritesCount}</Text>
              <Text className="font-tajawal-medium text-[14px] text-brand-text">المفضلة</Text>
            </View>
            <View className={`${CARD_BASE_CLASS} flex-1 py-6 items-center justify-center`}>
              <Text className="font-tajawal-bold text-[20px] text-[#67BB28] mb-1">{completedOrdersCount}</Text>
              <Text className="font-tajawal-medium text-[14px] text-brand-text">طلبات مكتملة</Text>
            </View>
          </View>

          {/* Menu List */}
          <View className="px-4 mt-6">
            <View className={`${CARD_BASE_CLASS} p-2`}>
              
              {/* My Orders */}
              <Pressable onPress={() => router.push('/order-history')} className="flex-row-reverse items-center justify-between p-4 border-b border-[#F4F4F5]">
                <View className="flex-row-reverse items-center gap-4">
                  <View className="w-10 h-10 rounded-full bg-[#67BB28] items-center justify-center">
                    <Icons.Bag color="white" />
                  </View>
                  <Text className="font-tajawal-bold text-[16px] text-brand-title">طلباتي</Text>
                </View>
                <Icons.ChevronLeft color="#A1A1AA" />
              </Pressable>

              {/* Notifications */}
              <Pressable 
                onPress={() => router.push('/notifications')}
                className="flex-row-reverse items-center justify-between p-4 border-b border-[#F4F4F5]"
              >
                <View className="flex-row-reverse items-center gap-4">
                  <View className="w-10 h-10 rounded-full bg-[#67BB28] items-center justify-center">
                    <Icons.Bell color="white" />
                  </View>
                  <Text className="font-tajawal-bold text-[16px] text-brand-title">التنبيهات</Text>
                </View>
                <View className="flex-row-reverse items-center gap-2">
                  {unreadCount > 0 && (
                    <View className="bg-[#DC2626] rounded-full px-3 py-1">
                      <Text className="font-tajawal-bold text-[12px] text-white">{unreadCount} جديد</Text>
                    </View>
                  )}
                  <Icons.ChevronLeft color="#A1A1AA" />
                </View>
              </Pressable>

              {/* About Company */}
              <Pressable onPress={() => router.push('/about-us')} className="flex-row-reverse items-center justify-between p-4 border-b border-[#F4F4F5]">
                <View className="flex-row-reverse items-center gap-4">
                  <View className="w-10 h-10 rounded-full bg-[#67BB28] items-center justify-center">
                    <Icons.Info color="white" />
                  </View>
                  <Text className="font-tajawal-bold text-[16px] text-brand-title">عن الشركة</Text>
                </View>
                <Icons.ChevronLeft color="#A1A1AA" />
              </Pressable>

              {/* Contact Us */}
              <Pressable onPress={() => router.push('/contact-us')} className="flex-row-reverse items-center justify-between p-4 border-b-transparent">
                <View className="flex-row-reverse items-center gap-4">
                  <View className="w-10 h-10 rounded-full bg-[#67BB28] items-center justify-center">
                    <Icons.Headset color="white" />
                  </View>
                  <Text className="font-tajawal-bold text-[16px] text-brand-title">اتصل بنا</Text>
                </View>
                <Icons.ChevronLeft color="#A1A1AA" />
              </Pressable>

            </View>
          </View>

          {/* Logout Button */}
          <View className="px-4 mt-6 mb-8">
            <Pressable 
              onPress={handleLogout}
              className="bg-[#FAEDE8] rounded-[24px] h-[54px] flex-row-reverse items-center justify-center gap-2 border border-[#F4E1D8]"
            >
              <Text className="font-tajawal-bold text-[16px] text-[#DC2626]">تسجيل الخروج</Text>
              <Icons.Logout color="#DC2626" />
            </Pressable>
          </View>

        </SafeAreaView>
      </ScrollView>

      <BottomNavbar activeTab="profile" />
    </View>
  );
}
