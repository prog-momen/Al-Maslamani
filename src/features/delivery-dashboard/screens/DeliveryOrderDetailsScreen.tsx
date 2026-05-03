import { DeliveryOrderDetails, getDeliveryOrderDetails, setOrderStatus } from '@/src/features/orders/services/orders.service';
import { getHomeRouteForRole } from '@/src/shared/constants/role-routes';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, Card, StaffBottomNavbar } from '@/src/shared/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_BG = '#F2EFE9';
const PRIMARY = '#84BD00';
const TITLE = '#1F2120';

export function DeliveryOrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, role, isAuthenticated, isInitializing } = useAuth();
  const ordersSignal = useRealtimeSignal('orders');
  const [order, setOrder] = useState<DeliveryOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/delivery-dashboard');
    }
  };

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  const loadOrder = useCallback(async () => {
    if (!user?.id) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getDeliveryOrderDetails({ deliveryUserId: user.id, orderId });
      setOrder(data);
    } catch (error) {
      console.error('Failed to load delivery order details:', error);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || (role !== 'delivery' && role !== 'admin')) {
        return;
      }
      loadOrder();
    }, [isAuthenticated, role, loadOrder])
  );

  useEffect(() => {
    if (!isAuthenticated || (role !== 'delivery' && role !== 'admin')) {
      return;
    }
    loadOrder();
  }, [isAuthenticated, role, loadOrder, ordersSignal]);

  if (!isInitializing && (!isAuthenticated || (role !== 'delivery' && role !== 'admin'))) {
    router.replace(isAuthenticated ? getHomeRouteForRole(role) : '/(auth)/login');
    return null;
  }

  const canConfirmDelivery = order?.status === 'shipped';
  const isOrderClosed = order?.status === 'delivered' || order?.status === 'cancelled';

  const openCustomerPhone = async () => {
    if (!order?.customerPhone) {
      Alert.alert('تنبيه', 'لا يوجد رقم هاتف متوفر.');
      return;
    }

    const phoneLink = `tel:${order.customerPhone}`;
    const canOpen = await Linking.canOpenURL(phoneLink);
    if (!canOpen) {
      Alert.alert('تعذر التنفيذ', 'تعذر فتح تطبيق الاتصال على هذا الجهاز.');
      return;
    }

    await Linking.openURL(phoneLink);
  };

  const openMaps = async () => {
    if (!order) {
      return;
    }

    const query = encodeURIComponent(`${order.addressTitle} ${order.addressDetails}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('تعذر التنفيذ', 'تعذر فتح الخرائط على هذا الجهاز.');
      return;
    }

    await Linking.openURL(url);
  };

  const getErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const msg = (error as { message?: unknown }).message;
      return typeof msg === 'string' && msg.trim().length > 0 ? msg : null;
    }
    return null;
  };

  const markDelivered = async () => {
    if (!order) {
      return;
    }

    setIsSaving(true);
    try {
      await setOrderStatus(order.id, 'delivered', 'تم التأكيد من المندوب');
      setOrder({ ...order, status: 'delivered' });
      Alert.alert('نجاح', 'تم توصيل الطلب بنجاح!', [
        { text: 'موافق', onPress: () => router.replace('/delivery-order-details') }
      ]);
    } catch (error) {
      console.error('Failed to mark as delivered:', error);
      Alert.alert('تعذر تحديث الحالة', getErrorMessage(error) ?? 'حدث خطأ أثناء تأكيد التوصيل. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  const markFailed = async () => {
    if (!order) {
      return;
    }

    setIsSaving(true);
    try {
      await setOrderStatus(order.id, 'cancelled', 'تعذر التوصيل');
      setOrder({ ...order, status: 'cancelled' });
      Alert.alert('تم الإلغاء', 'تم تحديث حالة الطلب إلى ملغي بانتظار مراجعة الإدارة.', [
        { text: 'موافق', onPress: () => router.replace('/delivery-order-details') }
      ]);
    } catch (error) {
      console.error('Failed to mark as not delivered:', error);
      Alert.alert('تعذر تحديث الحالة', getErrorMessage(error) ?? 'حدث خطأ أثناء تحديث الطلب. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          logo="none"
          withSidebar
          sidebarActiveItem="dashboard"
          sidebarSide="left"
          left={
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center" 
              onPress={handleGoBack}
            >
              <Ionicons name="chevron-forward" size={28} color={PRIMARY} />
            </TouchableOpacity>
          }
        />

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : !order ? (
          <View style={styles.loadingBox}>
            <Text style={styles.emptyText}>لا يوجد طلب مخصص حالياً.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.topTitleRow}>
              <Text style={styles.pageTitle}>تفاصيل الطلب</Text>
              <Text style={styles.helperText}>{order.orderNumber}</Text>
            </View>

            <View style={styles.callRow}>
              <TouchableOpacity style={styles.callButton} activeOpacity={0.9} onPress={openCustomerPhone}>
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
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  <Text style={styles.customerMeta}>{order.customerPhone ? `هاتف: ${order.customerPhone}` : 'عميل'}</Text>
                </View>

                <TouchableOpacity style={styles.phoneIconCircle} activeOpacity={0.9} onPress={openCustomerPhone}>
                  <Feather name="phone" size={15} color={PRIMARY} />
                </TouchableOpacity>
              </View>

              <View style={styles.addressCard}>
                <View style={styles.addressTitleRow}>
                  <Ionicons name="location-outline" size={15} color={PRIMARY} />
                  <Text style={styles.addressTitle}>{order.addressTitle}</Text>
                </View>
                <Text style={styles.addressText}>{order.addressDetails}</Text>
                {order.notes ? <Text style={styles.addressHint}>{order.notes}</Text> : null}

                <View style={styles.mapBox}>
                  <Image source={require('@/assets/images/hero-products.png')} style={styles.mapImage} contentFit="cover" />
                  <TouchableOpacity style={styles.mapButton} activeOpacity={0.9} onPress={openMaps}>
                    <Feather name="navigation" size={13} color="#FFFFFF" />
                    <Text style={styles.mapButtonText}>فتح الخرائط</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>

            <Card className="mt-4 rounded-[22px] border border-[#ECE7DD] bg-[#FCFBF8] px-4 py-4">
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionCount}>{order.items.length} اصناف</Text>
                <Text style={styles.sectionTitle}>المنتجات</Text>
              </View>

              {order.items.map((product) => (
                <View key={product.id} style={styles.productRow}>
                  <View style={styles.productQtyBadge}>
                    <Text style={styles.productQtyText}>{product.quantity}x</Text>
                  </View>

                  <View style={styles.productImageWrap}>
                    <Image
                      source={product.imageUrl ? { uri: product.imageUrl } : require('@/assets/images/mixed_nuts.png')}
                      style={styles.productImage}
                      contentFit="contain"
                    />
                  </View>

                  <View style={styles.productMeta}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productSize}>₪ {product.unitPrice.toFixed(2)}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.noteBox}>
                <Text style={styles.noteText}>إجمالي الطلب: ₪ {order.total.toFixed(2)}</Text>
              </View>
            </Card>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.successBtn, (!canConfirmDelivery || isSaving || isOrderClosed) && styles.disabledBtn]}
                activeOpacity={0.9}
                disabled={isSaving || !canConfirmDelivery || isOrderClosed}
                onPress={markDelivered}
              >
                <Text style={styles.successBtnText}>تم التوصيل</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.failBtn, (!canConfirmDelivery || isSaving || isOrderClosed) && styles.disabledBtn]}
                activeOpacity={0.9}
                disabled={isSaving || !canConfirmDelivery || isOrderClosed}
                onPress={markFailed}
              >
                <Text style={styles.failBtnText}>لم يتم التوصيل</Text>
              </TouchableOpacity>
            </View>

            {!canConfirmDelivery && !isOrderClosed ? (
              <Text style={styles.statusHintText}>يمكن تأكيد التوصيل بعد أن يغيّر الادمن الحالة إلى تم الشحن.</Text>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>

      <StaffBottomNavbar role="delivery" activeTab="roleHome" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  safeArea: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: {
    color: '#6D716A',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
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
  pageTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 22, color: TITLE },
  helperText: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#A8ABA3' },
  orderId: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: TITLE },
  callRow: { flexDirection: 'row-reverse', marginBottom: 8 },
  callButton: {
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  callButtonText: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 12 },
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
  customerInfo: { flex: 1, marginHorizontal: 10, alignItems: 'flex-end' },
  customerName: { fontFamily: 'Tajawal_700Bold', fontSize: 17, color: '#2B2D2A' },
  customerMeta: { fontFamily: 'Tajawal_500Medium', fontSize: 11, color: '#8A8D85' },
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
  addressTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  addressTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: '#2D2F2C' },
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
  mapImage: { width: '100%', height: '100%' },
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
  mapButtonText: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 10 },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionCount: { fontFamily: 'Tajawal_500Medium', fontSize: 11, color: '#8A8D85' },
  sectionTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 21, color: TITLE },
  productRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 10 },
  productQtyBadge: {
    width: 26,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#BFE5A6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  productQtyText: { fontFamily: 'Tajawal_700Bold', fontSize: 9, color: '#3A7A2A' },
  productImageWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1EEE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  productImage: { width: 26, height: 26 },
  productMeta: { flex: 1, alignItems: 'flex-end' },
  productName: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#252724' },
  productSize: { fontFamily: 'Tajawal_500Medium', fontSize: 11, color: '#7F847D' },
  noteBox: {
    marginTop: 4,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E8E6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { fontFamily: 'Tajawal_500Medium', fontSize: 11, color: '#7B7D79' },
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
  successBtnText: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 14 },
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
  failBtnText: { color: '#C93206', fontFamily: 'Tajawal_700Bold', fontSize: 14 },
  disabledBtn: {
    opacity: 0.55,
  },
  statusHintText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6E716A',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
  },
});
