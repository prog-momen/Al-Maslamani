import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useAuth } from '../src/shared/hooks/useAuth';
import { User } from '@supabase/supabase-js';
import { useLoyaltyHistory, useLoyaltyPoints } from '../src/shared/hooks/useLoyalty';
import { AppHeader } from '../src/shared/ui';
import { BottomNavbar } from '../src/shared/ui/BottomNavbar';
import { NotificationBell } from '../src/shared/ui/NotificationBell';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND_GREEN = '#84BD00';
const PAGE_BG = '#F5F4F0';
const CARD_BG = '#FFFFFF';

function LoyaltyPointsHistoryPreview({ user }: { user: User | null }) {
  const router = useRouter();
  const { data: history = [], isLoading } = useLoyaltyHistory(user);

  if (!user) return null;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 0, marginBottom: 24 }}>
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontFamily: 'Tajawal_700Bold', color: '#1B1C1C' }}>سجل النقاط</Text>
        <TouchableOpacity onPress={() => router.push('/loyalty-points-history')}>
          <Text style={{ color: BRAND_GREEN, fontFamily: 'Tajawal_700Bold', fontSize: 14 }}>عرض الكل</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: 'Tajawal_500Medium' }}>جاري التحميل...</Text>
      ) : history.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 16, color: '#8B948D', fontFamily: 'Tajawal_500Medium' }}>لا يوجد عمليات نقاط بعد.</Text>
      ) : (
        history.slice(0, 3).map((item, idx) => {
          const pointsAmount = item.points ?? item.amount ?? 0;
          const isPositive = pointsAmount > 0;
          return (
            <View key={item.id || idx} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#E5E2DB' }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontFamily: 'Tajawal_700Bold', color: isPositive ? BRAND_GREEN : '#DC2626', textAlign: 'right' }}>
                  {isPositive ? `حصلت على ${pointsAmount} نقطة` : `تم خصم ${Math.abs(pointsAmount)} نقطة`}
                </Text>
                <View style={{ backgroundColor: isPositive ? '#EEF6E8' : '#FEE2E2', borderRadius: 10, padding: 6 }}>
                  <Ionicons name={isPositive ? "add-circle-outline" : "remove-circle-outline"} size={18} color={isPositive ? BRAND_GREEN : '#DC2626'} />
                </View>
              </View>
              <Text style={{ color: '#445047', marginTop: 8, fontFamily: 'Tajawal_500Medium', textAlign: 'right' }}>{item.description || (isPositive ? 'تم إضافة نقاط' : 'تم خصم نقاط')}</Text>
              <Text style={{ color: '#8B948D', marginTop: 4, fontSize: 11, fontFamily: 'Tajawal_500Medium', textAlign: 'right' }}>{new Date(item.created_at).toLocaleString('ar-EG')}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

export default function LoyaltyPointsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: points = 0, isLoading: loadingPoints } = useLoyaltyPoints(user);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  if (!user) {
    return null;
  }

  if (loadingPoints) {
    return (
      <View style={{ flex: 1, backgroundColor: PAGE_BG, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#8B948D', fontFamily: 'Tajawal_500Medium' }}>جاري تحميل النقاط...</Text>
      </View>
    );
  }

  const nextTarget = 500 * (Math.floor(points / 500) + 1);
  const pointsToNext = nextTarget - points;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAGE_BG }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <AppHeader
        logo="transparent"
        withSidebar={true}
        sidebarActiveItem="profile"
        sidebarSide="left"
        right={
          <View className="flex-row items-center gap-2">
            <NotificationBell />
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center" 
              onPress={handleGoBack}
            >
              <Ionicons name="chevron-forward" size={28} color={BRAND_GREEN} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 16, marginTop: 12, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 24, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#E5E2DB' }}>
            <View style={{ backgroundColor: '#EEF6E8', borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ionicons name="star" size={24} color={BRAND_GREEN} />
            </View>
            <Text style={{ fontSize: 32, color: BRAND_GREEN, fontFamily: 'Tajawal_700Bold', marginBottom: 4 }}>{points} نقطة</Text>
            <Text style={{ color: '#445047', fontSize: 16, fontFamily: 'Tajawal_500Medium', marginBottom: 12 }}>كل 1₪ مشتريات = 1 نقطة</Text>
            
            <View style={{ width: '100%', height: 10, backgroundColor: '#ECEBE9', borderRadius: 5, marginVertical: 8, overflow: 'hidden' }}>
              <View style={{ width: `${Math.min((points / nextTarget) * 100, 100)}%`, height: '100%', backgroundColor: BRAND_GREEN, borderRadius: 5 }} />
            </View>
            <Text style={{ color: '#8B948D', fontSize: 13, marginTop: 4, fontFamily: 'Tajawal_500Medium' }}>باقي {pointsToNext} نقطة لتحصل على 20₪ خصم</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#E5E2DB' }}>
            <Text style={{ fontSize: 18, fontFamily: 'Tajawal_700Bold', color: '#1B1C1C', marginBottom: 8, textAlign: 'right' }}>كيف تجمع النقاط</Text>
            <Text style={{ color: '#445047', fontSize: 14, fontFamily: 'Tajawal_500Medium', marginBottom: 14, textAlign: 'right', lineHeight: 22 }}>النقاط تنحسب تلقائيًا بعد ما يصير الطلب مكتمل. كل شيكل على الطلب يعطيك نقطة واحدة، وبعدها يتقرب الرقم للأسفل إذا فيه كسور.</Text>
            
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#EEF6E8', borderRadius: 12, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                <Ionicons name="gift-outline" size={20} color={BRAND_GREEN} />
              </View>
              <Text style={{ color: '#1B1C1C', fontSize: 14, fontFamily: 'Tajawal_500Medium', flex: 1, textAlign: 'right' }}>مثال: طلب بـ <Text style={{ color: BRAND_GREEN, fontFamily: 'Tajawal_700Bold' }}>57.80₪</Text> يعطيك <Text style={{ color: BRAND_GREEN, fontFamily: 'Tajawal_700Bold' }}>57 نقطة</Text></Text>
            </View>
            
            <View style={{ height: 1, backgroundColor: '#ECEBE9', marginVertical: 14 }} />
            
            <Text style={{ color: '#8B948D', fontSize: 13, fontFamily: 'Tajawal_500Medium', textAlign: 'right' }}>كل 500 نقطة = 20₪ خصم، والخصم ينعمل فقط في صفحة الدفع.</Text>
          </View>
        </View>

        <LoyaltyPointsHistoryPreview user={user} />
      </ScrollView>
      <BottomNavbar activeTab="profile" />
    </SafeAreaView>
  );
}
