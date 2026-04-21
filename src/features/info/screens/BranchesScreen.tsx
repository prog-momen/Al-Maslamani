import { AppHeader, BottomNavbar, CARD_BASE_CLASS } from '@/src/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const branches = [
  { name: 'محل نابلس - حوارة بجانب KFC', phone: '0599000101' },
  { name: 'محل نابلس - دوار الشهداء', phone: '0599000102' },
  { name: 'محل جنين - مبنى الغرفة التجارية', phone: '0599000103' },
  { name: 'محل رام الله - ايكون مول', phone: '0599000104' },
  { name: 'محل قلقيلية - بجانب ابو العيال مول', phone: '0599000105' },
];

const Icons = {
  Menu: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Line x1="4" x2="20" y1="12" y2="12" />
      <Line x1="4" x2="20" y1="6" y2="6" />
      <Line x1="4" x2="20" y1="18" y2="18" />
    </Svg>
  ),
  Pin: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  ),
};

export function BranchesScreen() {
  const router = useRouter();

  const openCall = async (phone: string) => {
    const telUrl = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(telUrl);
    if (canOpen) {
      await Linking.openURL(telUrl);
    }
  };

  const openWhatsApp = async (phone: string) => {
    const normalized = phone.replace(/\D/g, '');
    const intl = normalized.startsWith('0') ? `972${normalized.slice(1)}` : normalized;
    const whatsappUrl = `https://wa.me/${intl}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F2EC]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']}>
          <AppHeader
            logo="transparent"
            withSidebar
            sidebarActiveItem="branches"
            sidebarSide="left"
            left={<Icons.Menu color="#84BD00" />}
            right={
              <Pressable onPress={() => router.back()} hitSlop={10} className="items-center justify-center w-10 h-10">
                <Ionicons name="chevron-forward" size={28} color="#84BD00" />
              </Pressable>
            }
          />

          <View className="px-6 mt-4 items-end">
            <Text className="font-tajawal-bold text-[32px] text-brand-title">فروعنا</Text>
            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right mt-2">
              تفضل بزيارتنا في أقرب فرع إليك.
            </Text>
          </View>

          <View className="px-4 mt-6 gap-3">
            {branches.map((branch, index) => (
              <View key={branch.name} className={`${CARD_BASE_CLASS} p-4 flex-row-reverse items-center gap-3`}>
                <View className="w-10 h-10 rounded-full bg-[#84BD00] items-center justify-center">
                  <Icons.Pin color="white" />
                </View>
                <View className="flex-1 items-end">
                  <Text className="font-tajawal-bold text-[16px] text-brand-title">الفرع {index + 1}</Text>
                  <Text className="font-tajawal-medium text-[14px] text-brand-text text-right mt-1">{branch.name}</Text>
                  <Text className="font-tajawal-bold text-[14px] text-[#374151] mt-1">رقم الفرع: {branch.phone}</Text>
                  <View className="flex-row-reverse mt-3 gap-2">
                    <TouchableOpacity
                      className="bg-[#E8F7EA] rounded-full px-3 py-2 flex-row-reverse items-center gap-1"
                      onPress={() => openCall(branch.phone)}
                    >
                      <Ionicons name="call-outline" size={16} color="#2E7D32" />
                      <Text className="font-tajawal-bold text-[12px] text-[#2E7D32]">اتصال</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-[#DCFCE7] rounded-full px-3 py-2 flex-row-reverse items-center gap-1"
                      onPress={() => openWhatsApp(branch.phone)}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color="#15803D" />
                      <Text className="font-tajawal-bold text-[12px] text-[#15803D]">واتساب</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>

      <BottomNavbar activeTab="profile" />
    </View>
  );
}
