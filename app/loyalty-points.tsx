
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/shared/hooks/useAuth';
import { useLoyaltyHistory, useLoyaltyPoints } from '../src/shared/hooks/useLoyalty';
import { AppHeader } from '../src/shared/ui';
import { BottomNavbar } from '../src/shared/ui/BottomNavbar';

function LoyaltyPointsHistoryPreview({ user }: { user: any }) {
  const router = useRouter();
  const { data: history = [], isLoading } = useLoyaltyHistory(user);

  if (!user) return null;

  return (
    <View style={{ marginHorizontal: 24, marginTop: 0, marginBottom: 24, maxWidth: 400, alignSelf: 'center', width: '100%' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#388e3c' }}>سجل النقاط</Text>
        <TouchableOpacity onPress={() => router.push('/loyalty-points-history')}>
          <Text style={{ color: '#388e3c', fontWeight: 'bold', fontSize: 15 }}>عرض الكل</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <Text style={{ textAlign: 'center', marginTop: 16 }}>جاري التحميل...</Text>
      ) : history.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 16, color: '#888' }}>لا يوجد عمليات نقاط بعد.</Text>
      ) : (
        history.slice(0, 3).map((item, idx) => (
          <View key={item.id || idx} style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: item.points > 0 ? '#388e3c' : '#d32f2f' }}>
              {item.points > 0 ? `+${item.points}` : item.points} نقطة
            </Text>
            <Text style={{ color: '#555', marginTop: 2 }}>{item.description || (item.points > 0 ? 'تم إضافة نقاط' : 'تم خصم نقاط')}</Text>
            <Text style={{ color: '#aaa', marginTop: 2, fontSize: 12 }}>{new Date(item.created_at).toLocaleString('ar-EG')}</Text>
          </View>
        ))
      )}
    </View>
  );
}

export default function LoyaltyPointsScreen() {
  const { user } = useAuth();
  const { data: points = 0, isLoading: loadingPoints } = useLoyaltyPoints(user);

  if (!user) {
    return null; // أو يمكن إرجاع شاشة تحميل
  }

  if (loadingPoints) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fafaf7', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#666' }}>جاري تحميل النقاط...</Text>
      </View>
    );
  }

  const nextTarget = 500 * (Math.floor(points / 500) + 1);
  const pointsToNext = nextTarget - points;

  return (
    <View style={{ flex: 1, backgroundColor: '#fafaf7' }}>
      <AppHeader logo="transparent" withSidebar sidebarActiveItem="profile" sidebarSide="left" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ margin: 24, marginTop: 40, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <View style={{ backgroundColor: '#E8F5E9', borderRadius: 50, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 28, color: '#4CAF50' }}>★</Text>
            </View>
            <Text style={{ fontSize: 32, color: '#4CAF50', fontWeight: 'bold', marginBottom: 8 }}>{points} نقطة</Text>
            <Text style={{ color: '#222', fontSize: 18, marginBottom: 8 }}>كل 1₪ مشتريات = 1 نقطة</Text>
            <View style={{ width: '100%', height: 8, backgroundColor: '#E0E0E0', borderRadius: 8, marginVertical: 12 }}>
              <View style={{ width: `${Math.min((points / nextTarget) * 100, 100)}%`, height: 8, backgroundColor: '#4CAF50', borderRadius: 8 }} />
            </View>
            <Text style={{ color: '#666', fontSize: 15, marginTop: 8 }}>باقي {pointsToNext} نقطة لتحصل على 20₪ خصم</Text>
          </View>
        </View>
          <View style={{ marginHorizontal: 24, marginTop: 16, marginBottom: 0, maxWidth: 400, alignSelf: 'center', width: '100%' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#388e3c', marginBottom: 8 }}>كيف تجمع النقاط</Text>
              <Text style={{ color: '#444', fontSize: 15, marginBottom: 10 }}>النقاط تنحسب تلقائيًا بعد ما يصير الطلب delivered. كل شيكل على الطلب يعطيك نقطة واحدة، وبعدها يتقرب الرقم للأسفل إذا فيه كسور.</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <View style={{ backgroundColor: '#E8F5E9', borderRadius: 50, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ fontSize: 20, color: '#4CAF50' }}>★</Text>
                </View>
                <Text style={{ color: '#222', fontSize: 15 }}>مثال: طلب بـ <Text style={{ color: '#388e3c', fontWeight: 'bold' }}>57.80₪</Text> يعطيك <Text style={{ color: '#388e3c', fontWeight: 'bold' }}>57 نقطة</Text></Text>
              </View>
              <Text style={{ color: '#666', fontSize: 14, marginTop: 10 }}>كل 500 نقطة = 20₪ خصم، والخصم ينعمل فقط في صفحة الدفع.</Text>
            </View>
          </View>

          <LoyaltyPointsHistoryPreview user={user} />
      </ScrollView>
      <BottomNavbar activeTab="profile" />
    </View>
  );
}
