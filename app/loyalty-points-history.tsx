import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../src/shared/hooks/useAuth';
import { useLoyaltyHistory } from '../src/shared/hooks/useLoyalty';
import { AppHeader } from '../src/shared/ui';
import { BottomNavbar } from '../src/shared/ui/BottomNavbar';

export default function LoyaltyPointsHistoryScreen() {
  const { user } = useAuth();
  const { data: history = [], isLoading } = useLoyaltyHistory(user);

  if (!user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#fafaf7' }}>
      <AppHeader logo="transparent" withSidebar sidebarActiveItem="profile" sidebarSide="left" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#4CAF50', alignSelf: 'center' }}>
          سجل النقاط
        </Text>
        {isLoading ? (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>جاري التحميل...</Text>
        ) : history.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>لا يوجد عمليات نقاط بعد.</Text>
        ) : (
          history.map((item, idx) => (
            <View key={item.id || idx} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: item.points > 0 ? '#388e3c' : '#d32f2f' }}>
                {item.points > 0 ? `+${item.points}` : item.points} نقطة
              </Text>
              <Text style={{ color: '#555', marginTop: 4 }}>{item.description || (item.points > 0 ? 'تم إضافة نقاط' : 'تم خصم نقاط')}</Text>
              <Text style={{ color: '#aaa', marginTop: 4, fontSize: 13 }}>{new Date(item.created_at).toLocaleString('ar-EG')}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <BottomNavbar activeTab="profile" />
    </View>
  );
}
