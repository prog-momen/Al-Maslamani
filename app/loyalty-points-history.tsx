import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useAuth } from '../src/shared/hooks/useAuth';
import { useLoyaltyHistory } from '../src/shared/hooks/useLoyalty';
import { AppHeader, GuestLoginPrompt } from '../src/shared/ui';
import { BottomNavbar } from '../src/shared/ui/BottomNavbar';
import { NotificationBell } from '../src/shared/ui/NotificationBell';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND_GREEN = '#84BD00';
const PAGE_BG = '#F5F4F0';

export default function LoyaltyPointsHistoryScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { data: history = [], isLoading } = useLoyaltyHistory(user);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/loyalty-points');
    }
  };

  if (!user && !isGuest) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAGE_BG }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <AppHeader
        logo="transparent"
        withSidebar={true}
        sidebarActiveItem="profile"
        sidebarSide="left"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <NotificationBell />
            <TouchableOpacity 
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} 
              onPress={handleGoBack}
            >
              <Ionicons name="chevron-forward" size={28} color={BRAND_GREEN} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}>
        {isGuest ? (
          <View style={{ marginTop: 24 }}>
            <GuestLoginPrompt message="يجب تسجيل الدخول لعرض سجل نقاط الولاء الخاص بك" />
          </View>
        ) : (
          <>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontFamily: 'Tajawal_700Bold', color: '#1B1C1C', textAlign: 'right' }}>سجل النقاط</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Tajawal_500Medium', color: '#8B948D', textAlign: 'right', marginTop: 4 }}>تاريخ عمليات جمع واستهلاك النقاط</Text>
            </View>

            {isLoading ? (
              <View style={{ marginTop: 40, alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', fontFamily: 'Tajawal_500Medium', color: '#8B948D' }}>جاري التحميل...</Text>
              </View>
            ) : history.length === 0 ? (
              <View style={{ marginTop: 40, alignItems: 'center' }}>
                <Ionicons name="receipt-outline" size={48} color="#ECEBE9" />
                <Text style={{ textAlign: 'center', marginTop: 16, color: '#8B948D', fontFamily: 'Tajawal_500Medium' }}>لا يوجد عمليات نقاط بعد.</Text>
              </View>
            ) : (
          history.map((item, idx) => {
            const pointsAmount = item.points ?? item.amount ?? 0;
            const isPositive = pointsAmount > 0;
            return (
              <View key={item.id || idx} style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#E5E2DB' }}>
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 17, fontFamily: 'Tajawal_700Bold', color: isPositive ? BRAND_GREEN : '#DC2626' }}>
                    {isPositive ? `حصلت على ${pointsAmount} نقطة` : `تم خصم ${Math.abs(pointsAmount)} نقطة`}
                  </Text>
                  <View style={{ backgroundColor: isPositive ? '#EEF6E8' : '#FEE2E2', borderRadius: 10, padding: 6 }}>
                    <Ionicons name={isPositive ? "add-circle-outline" : "remove-circle-outline"} size={18} color={isPositive ? BRAND_GREEN : '#DC2626'} />
                  </View>
                </View>
                <Text style={{ color: '#445047', marginTop: 8, fontFamily: 'Tajawal_500Medium', textAlign: 'right' }}>{item.description || (isPositive ? 'تم إضافة نقاط' : 'تم خصم نقاط')}</Text>
                <View style={{ height: 1, backgroundColor: '#ECEBE9', marginVertical: 12 }} />
                <Text style={{ color: '#8B948D', fontSize: 12, fontFamily: 'Tajawal_500Medium', textAlign: 'right' }}>{new Date(item.created_at).toLocaleString('ar-EG')}</Text>
              </View>
            );
          })
        )}
        </>
        )}
      </ScrollView>
      <BottomNavbar activeTab="profile" />
    </SafeAreaView>
  );
}
