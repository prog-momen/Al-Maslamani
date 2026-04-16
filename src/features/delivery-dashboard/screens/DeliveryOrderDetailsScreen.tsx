import { AppHeader, Card } from '@/src/shared/ui';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DeliveryProduct = {
  id: string;
  name: string;
  size: string;
  quantity: number;
  image: any;
};

const PAGE_BG = '#F2EFE9';
const SURFACE = '#FCFBF8';
const PRIMARY = '#67BB28';
const TITLE = '#1F2120';

const PRODUCTS: DeliveryProduct[] = [
  {
    id: '1',
    name: 'بزر مفرغ',
    size: '160 غرام',
    quantity: 1,
    image: require('@/assets/images/mixed_nuts.png'),
  },
  {
    id: '2',
    name: 'بزر مشام',
    size: '300 غرام',
    quantity: 2,
    image: require('@/assets/images/corn.png'),
  },
];

function DeliveryBottomNav() {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.bottomItem} activeOpacity={0.9}>
        <Feather name="home" size={19} color={PRIMARY} />
        <Text style={styles.bottomItemActive}>الرئيسية</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.bottomItem, styles.bottomItemCenter]} activeOpacity={0.9}>
        <View style={styles.centerTabCircle}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.bottomItemText}>طلباتي</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bottomItem} activeOpacity={0.9}>
        <Feather name="user" size={19} color="#5B5D59" />
        <Text style={styles.bottomItemText}>حسابي</Text>
      </TouchableOpacity>
    </View>
  );
}

export function DeliveryOrderDetailsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          logo="none"
          left={<Text style={styles.orderId}>#SAM-1239</Text>}
          right={
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
              <Feather name="arrow-right" size={20} color={PRIMARY} />
            </TouchableOpacity>
          }
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.topTitleRow}>
            <Text style={styles.pageTitle}>تفاصيل الطلب</Text>
            <Text style={styles.helperText}>اطلبها</Text>
          </View>

          <View style={styles.callRow}>
            <TouchableOpacity style={styles.callButton} activeOpacity={0.9}>
              <Feather name="phone" size={14} color="#FFFFFF" />
              <Text style={styles.callButtonText}>اتصال</Text>
            </TouchableOpacity>
          </View>

          <Card className="rounded-[22px] border border-[#ECE7DD] bg-[#FCFBF8] px-4 py-4">
            <View style={styles.customerHeader}>
              <View style={styles.customerAvatar}>
                <Ionicons name="chatbubble" size={18} color="#FFFFFF" />
              </View>

              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>احمد عامر</Text>
                <Text style={styles.customerMeta}>عميل مميز منذ 2022</Text>
              </View>

              <View style={styles.phoneIconCircle}>
                <Feather name="phone" size={15} color={PRIMARY} />
              </View>
            </View>

            <View style={styles.addressCard}>
              <View style={styles.addressTitleRow}>
                <Ionicons name="location-outline" size={15} color={PRIMARY} />
                <Text style={styles.addressTitle}>عنوان التوصيل</Text>
              </View>
              <Text style={styles.addressText}>شارع رفيديا، قرب شارع القدس، مبنى 21</Text>
              <Text style={styles.addressHint}>الطابق 2، شقة 15</Text>

              <View style={styles.mapBox}>
                <Image source={require('@/assets/images/hero-products.png')} style={styles.mapImage} contentFit="cover" />
                <TouchableOpacity style={styles.mapButton} activeOpacity={0.9}>
                  <Feather name="navigation" size={13} color="#FFFFFF" />
                  <Text style={styles.mapButtonText}>فتح الخرائط</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <Card className="mt-4 rounded-[22px] border border-[#ECE7DD] bg-[#FCFBF8] px-4 py-4">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionCount}>2 اصناف</Text>
              <Text style={styles.sectionTitle}>المنتجات</Text>
            </View>

            {PRODUCTS.map((product) => (
              <View key={product.id} style={styles.productRow}>
                <View style={styles.productQtyBadge}>
                  <Text style={styles.productQtyText}>{product.quantity}x</Text>
                </View>

                <View style={styles.productImageWrap}>
                  <Image source={product.image} style={styles.productImage} contentFit="contain" />
                </View>

                <View style={styles.productMeta}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSize}>{product.size}</Text>
                </View>
              </View>
            ))}

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>ملاحظة: يرجى التأكيد عند الباب...</Text>
            </View>
          </Card>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.successBtn} activeOpacity={0.9}>
              <Text style={styles.successBtnText}>تم التوصيل</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.failBtn} activeOpacity={0.9}>
              <Text style={styles.failBtnText}>لم يتم التوصيل</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <DeliveryBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 130,
  },
  topTitleRow: {
    marginTop: 2,
    marginBottom: 8,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 22,
    color: TITLE,
  },
  helperText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
    color: '#A8ABA3',
  },
  orderId: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 18,
    color: TITLE,
  },
  callRow: {
    flexDirection: 'row-reverse',
    marginBottom: 8,
  },
  callButton: {
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 12,
  },
  customerHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInfo: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'flex-end',
  },
  customerName: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 17,
    color: '#2B2D2A',
  },
  customerMeta: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    color: '#8A8D85',
  },
  phoneIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#E6ECDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    marginTop: 10,
    backgroundColor: '#F5F3ED',
    borderRadius: 14,
    padding: 10,
  },
  addressTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  addressTitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 12,
    color: '#2D2F2C',
  },
  addressText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    color: '#636860',
    textAlign: 'right',
    marginTop: 4,
  },
  addressHint: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    color: '#636860',
    textAlign: 'right',
    marginTop: 2,
  },
  mapBox: {
    marginTop: 8,
    borderRadius: 16,
    height: 92,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#CFE7E9',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionCount: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    color: '#8A8D85',
  },
  sectionTitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 21,
    color: TITLE,
  },
  productRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  productQtyBadge: {
    width: 26,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#BFE5A6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  productQtyText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 9,
    color: '#3A7A2A',
  },
  productImageWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1EEE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  productImage: {
    width: 26,
    height: 26,
  },
  productMeta: {
    flex: 1,
    alignItems: 'flex-end',
  },
  productName: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
    color: '#252724',
  },
  productSize: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    color: '#7F847D',
  },
  noteBox: {
    marginTop: 4,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E8E6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    color: '#7B7D79',
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 10,
  },
  successBtn: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
  },
  failBtn: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#F0DCD4',
    borderWidth: 1,
    borderColor: '#E7C1B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failBtnText: {
    color: '#C93206',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 78,
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: '#E9E4D9',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomItemCenter: {
    marginTop: -22,
  },
  centerTabCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomItemActive: {
    marginTop: 2,
    color: PRIMARY,
    fontFamily: 'Tajawal_700Bold',
    fontSize: 12,
  },
  bottomItemText: {
    marginTop: 2,
    color: '#5C605A',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
  },
});
