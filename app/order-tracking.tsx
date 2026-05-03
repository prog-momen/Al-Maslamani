import { getOrderTrackingDetails, OrderTrackingDetails, reorderOrder } from '@/src/features/orders/services/orders.service';
import { useCart } from '@/src/shared/contexts/CartContext';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, BottomNavbar } from '@/src/shared/ui';
import MapView, { Marker, Polyline } from '@/src/shared/ui/Maps/MapViewCustom';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#84BD00';
const PAGE_BG = '#F5F4F0';
const LIGHT_GREEN = '#B8E8BE';

const getParamString = (value: string | string[] | undefined, fallback: string) => {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
};

const googleMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const ordersSignal = useRealtimeSignal('orders');
  const [tracking, setTracking] = useState<OrderTrackingDetails | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [palestineNowTime, setPalestineNowTime] = useState(() =>
    new Intl.DateTimeFormat('ar-PS', {
      timeZone: 'Asia/Hebron',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date())
  );

  const orderId = getParamString(params.orderId as string | string[] | undefined, '');

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  const formatPalestineTime = (date: Date) =>
    new Intl.DateTimeFormat('ar-PS', {
      timeZone: 'Asia/Hebron',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);

  const statusToStep = (status: string) => {
    if (status === 'pending') return 0;
    if (status === 'confirmed' || status === 'preparing' || status === 'cancelled') return 1;
    if (status === 'shipped') return 2;
    if (status === 'delivered') return 3;
    return 0;
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      setPalestineNowTime(formatPalestineTime(new Date()));
    }, 30000);

    return () => clearInterval(timerId);
  }, []);

  const loadTracking = useCallback(async () => {
    if (!orderId) {
      setTracking(null);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getOrderTrackingDetails(orderId);
      setTracking(data);
    } catch (error) {
      console.error('Failed to load order tracking data:', error);
      setTracking(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      loadTracking();
    }, [loadTracking])
  );

  useEffect(() => {
    if (!orderId) {
      return;
    }
    loadTracking();
  }, [loadTracking, orderId, ordersSignal]);

  const currentStepRaw = parseInt(getParamString(params.currentStep as string | string[] | undefined, '2'), 10);
  const currentStepFromParams = Number.isNaN(currentStepRaw) ? 2 : Math.max(0, Math.min(3, currentStepRaw));
  const currentStep = tracking ? statusToStep(tracking.status) : currentStepFromParams;

  const orderNumber = tracking?.orderNumber ?? getParamString(params.orderNumber as string | string[] | undefined, '#123456');
  const eta = palestineNowTime;
  const total = tracking ? tracking.total.toFixed(2) : getParamString(params.total as string | string[] | undefined, '0.00');
  const productName = tracking?.productName ?? getParamString(params.productName as string | string[] | undefined, 'شوكلاته مشكّلة');
  const productSubtitle = getParamString(params.productSubtitle as string | string[] | undefined, '-');
  const productWeight = tracking ? `${tracking.productQuantity}x` : getParamString(params.productWeight as string | string[] | undefined, '1x');

  const allowReorderFromParams = getParamString(params.allowReorder as string | string[] | undefined, '0') === '1';
  const allowReorder = tracking
    ? tracking.status === 'cancelled' || tracking.status === 'delivered'
    : allowReorderFromParams;
  const deliveryName = tracking?.deliveryName ?? 'لم يتم تعيين مندوب بعد';
  const deliveryPhone = tracking?.deliveryPhone ?? '-';
  const createdAtTime = useMemo(() => {
    if (!tracking?.createdAt) {
      return palestineNowTime;
    }

    return formatPalestineTime(new Date(tracking.createdAt));
  }, [tracking?.createdAt, palestineNowTime]);

  const ORDER_STEPS = [
    {
      id: 0,
      title: 'تم الطلب',
      subtitle: `استلمنا طلبك رقم ${orderNumber}`,
      time: createdAtTime,
      icon: 'checkmark',
    },
    {
      id: 1,
      title: 'قيد المعالجة',
      subtitle: 'يتم الآن تحضير وتغليف طلبك بعناية',
      time: currentStep >= 1 ? palestineNowTime : '',
      icon: 'checkmark',
    },
    {
      id: 2,
      title: 'في الطريق',
      subtitle: 'المندوب في طريقه إلى موقعك حالياً',
      time: 'مباشر',
      icon: 'bicycle-outline',
    },
    {
      id: 3,
      title: 'تم التوصيل',
      subtitle: 'بالهنا والشفا!',
      time: '',
      icon: 'home-outline',
    },
  ];

  const statusBanner = currentStep >= 3 ? 'تم توصيل الطلب بنجاح' : 'آخر تحديث الآن';

  const callDelivery = async () => {
    if (!tracking?.deliveryPhone) {
      return;
    }

    const phoneUrl = `tel:${tracking.deliveryPhone}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (!canOpen) {
      return;
    }

    await Linking.openURL(phoneUrl);
  };

  const handleReorder = async () => {
    if (!user?.id || !orderId) return;

    setIsReordering(true);
    try {
      await reorderOrder(orderId, user.id);
      await refreshCart();
      router.push('/cart');
    } catch (error) {
      console.error('Reorder failed from tracking:', error);
      alert('فشلت عملية إعادة الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsReordering(false);
    }
  };

  const renderStep = (step: (typeof ORDER_STEPS)[number], index: number) => {
    const isCurrent = index === currentStep;
    const isPending = index > currentStep;

    const circleStyle = isPending
      ? styles.timelineCirclePending
      : isCurrent
        ? styles.timelineCircleCurrent
        : styles.timelineCircleCompleted;

    const iconColor = isPending ? '#BFC5BC' : '#FFFFFF';
    const textStyle = isPending ? styles.timelineTitlePending : styles.timelineTitle;
    const subtitleStyle = isPending ? styles.timelineSubtitlePending : styles.timelineSubtitle;

    return (
      <View key={step.id} style={styles.timelineRow}>
        <View style={styles.timelineIconColumn}>
          <View style={[styles.timelineCircle, circleStyle]}>
            <Ionicons name={step.icon as any} size={16} color={iconColor} />
          </View>
          {index < ORDER_STEPS.length - 1 ? (
            <View style={[styles.timelineLine, isPending ? styles.timelineLinePending : styles.timelineLineActive]} />
          ) : null}
        </View>

        <View style={styles.timelineTextColumn}>
          <Text style={textStyle}>{step.title}</Text>
          <Text style={subtitleStyle}>{step.subtitle}</Text>
          {step.time ? (
            <View style={isCurrent && step.time === 'مباشر' ? styles.liveBadge : undefined}>
              <Text style={isCurrent && step.time === 'مباشر' ? styles.liveBadgeText : styles.timelineTime}>{step.time}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          logo="transparent"
          withSidebar
          sidebarActiveItem="orders"
          sidebarSide="left"
          left={
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center" 
              onPress={handleGoBack}
            >
              <Ionicons name="chevron-forward" size={28} color="#84BD00" />
            </TouchableOpacity>
          }
          right={
            <TouchableOpacity style={styles.headerAction} activeOpacity={0.8} onPress={() => router.push('/contact-us')}>
              <Ionicons name="help-circle-outline" size={26} color="#84BD00" />
            </TouchableOpacity>
          }
        />

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTracking} tintColor={PRIMARY_GREEN} />}
          >
            <View style={styles.etaCard}>
              <View style={styles.etaShape} />
              <Text style={styles.etaLabel}>وقت التوصيل المتوقع</Text>
              <Text style={styles.etaValue}>{eta}</Text>
              <View style={styles.speedBadge}>
                <Text style={styles.speedBadgeText}>{statusBanner}</Text>
              </View>
            </View>

            <View style={styles.mapCard}>
              <MapView
                style={styles.mapView}
                initialRegion={{
                  latitude: tracking?.deliveryLat || 31.9029,
                  longitude: tracking?.deliveryLng || 35.2062,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }}
                region={tracking?.deliveryLat ? {
                  latitude: (tracking.deliveryLat + (tracking.customerLat || tracking.deliveryLat)) / 2,
                  longitude: (tracking.deliveryLng! + (tracking.customerLng || tracking.deliveryLng!)) / 2,
                  latitudeDelta: Math.abs(tracking.deliveryLat - (tracking.customerLat || tracking.deliveryLat)) * 2 + 0.01,
                  longitudeDelta: Math.abs(tracking.deliveryLng! - (tracking.customerLng || tracking.deliveryLng!)) * 2 + 0.01,
                } : undefined}
                customMapStyle={googleMapStyle}
              >
                {/* Delivery Rider Marker */}
                {tracking?.deliveryLat && (
                  <Marker
                    coordinate={{ latitude: tracking.deliveryLat, longitude: tracking.deliveryLng! }}
                    title={deliveryName || 'المندوب'}
                  >
                    <View style={styles.riderPin}>
                      <Ionicons name="bicycle-outline" size={20} color="#FFFFFF" />
                    </View>
                  </Marker>
                )}

                {/* Customer Destination Marker */}
                {tracking?.customerLat && (
                  <Marker
                    coordinate={{ latitude: tracking.customerLat, longitude: tracking.customerLng! }}
                    pinColor="#000"
                  >
                    <View style={styles.destinationPin}>
                      <Ionicons name="home" size={18} color="#FFFFFF" />
                    </View>
                  </Marker>
                )}

                {/* Path */}
                {tracking?.deliveryLat && tracking?.customerLat && (
                  <Polyline
                    coordinates={[
                      { latitude: tracking.deliveryLat, longitude: tracking.deliveryLng! },
                      { latitude: tracking.customerLat, longitude: tracking.customerLng! },
                    ]}
                    strokeColor={PRIMARY_GREEN}
                    strokeWidth={3}
                  />
                )}
              </MapView>

              <View style={styles.riderTag}>
                <Text style={styles.riderTagText}>({deliveryName})</Text>
              </View>
            </View>

            {tracking?.deliveryName ? (
              <View style={styles.driverRow}>
                <TouchableOpacity style={styles.callCircle} activeOpacity={0.8} onPress={callDelivery}>
                  <Ionicons name="call-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{deliveryName}</Text>
                  <Text style={styles.driverPhone}>رقم مندوب التوصيل: {deliveryPhone}</Text>
                </View>

                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={18} color="#5B5B5B" />
                </View>
              </View>
            ) : (
              <View style={styles.driverRowPlaceholder}>
                <Text style={styles.driverPlaceholderText}>جاري تعيين مندوب لتوصيل طلبك...</Text>
              </View>
            )}

            <View style={styles.timelineCard}>{ORDER_STEPS.map(renderStep)}</View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>ملخص الطلب</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{`${productWeight} ${productName}`}</Text>
                <Text style={styles.summaryLabel}>الصنف</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{productSubtitle}</Text>
                <Text style={styles.summaryLabel}>الوصف</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryFooter}>
                <Text style={styles.summaryTotalValue}>{total} ₪</Text>
                <Text style={styles.summaryTotalLabel}>الإجمالي</Text>
              </View>

              {allowReorder ? (
                <TouchableOpacity
                  style={[styles.reorderButton, isReordering && { opacity: 0.7 }]}
                  activeOpacity={0.85}
                  onPress={handleReorder}
                  disabled={isReordering}
                >
                  {isReordering ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  )}
                  <Text style={styles.reorderText}>{isReordering ? 'جاري الإضافة...' : 'إعادة الطلب'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      <BottomNavbar activeTab="profile" />
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
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 118,
  },
  etaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 9,
    overflow: 'hidden',
  },
  etaShape: {
    width: 120,
    height: 120,
    backgroundColor: '#EEF1EE',
    position: 'absolute',
    top: -44,
    right: -36,
    borderRadius: 60,
  },
  etaLabel: {
    fontSize: 13,
    lineHeight: 17,
    color: '#44484B',
    textAlign: 'center',
    fontFamily: 'Tajawal_500Medium',
  },
  etaValue: {
    marginTop: 2,
    fontSize: 26,
    lineHeight: 31,
    color: '#2C2F33',
    textAlign: 'center',
    fontFamily: 'Tajawal_700Bold',
  },
  speedBadge: {
    height: 32,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  speedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  mapCard: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: '#EBEBEB',
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  riderPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY_GREEN,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderTag: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  riderTagText: {
    fontSize: 10,
    lineHeight: 13,
    color: '#2B2B2B',
    fontFamily: 'Tajawal_700Bold',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  callCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: 10,
  },
  driverName: {
    fontSize: 12,
    lineHeight: 16,
    color: '#2A2D2E',
    fontFamily: 'Tajawal_700Bold',
  },
  driverPhone: {
    fontSize: 9,
    lineHeight: 13,
    color: '#666C67',
    fontFamily: 'Tajawal_500Medium',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9DBD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverRowPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EAE4',
    borderStyle: 'dashed',
  },
  driverPlaceholderText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 13,
    color: '#8A8D85',
  },
  timelineCard: {
    paddingTop: 2,
  },
  timelineRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  timelineIconColumn: {
    alignItems: 'center',
    width: 40,
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleCompleted: {
    backgroundColor: PRIMARY_GREEN,
  },
  timelineCircleCurrent: {
    backgroundColor: PRIMARY_GREEN,
    borderWidth: 3,
    borderColor: '#0B7B26',
  },
  timelineCirclePending: {
    backgroundColor: '#E6EAE4',
  },
  timelineLine: {
    width: 2,
    height: 44,
    marginVertical: 2,
  },
  timelineLineActive: {
    backgroundColor: PRIMARY_GREEN,
  },
  timelineLinePending: {
    backgroundColor: '#D9DEDA',
  },
  timelineTextColumn: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 2,
    paddingLeft: 4,
  },
  timelineTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: '#222629',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  timelineTitlePending: {
    fontSize: 20,
    lineHeight: 24,
    color: '#C7D1C5',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  timelineSubtitle: {
    fontSize: 10,
    lineHeight: 14,
    color: '#555C59',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
    marginTop: 2,
  },
  timelineSubtitlePending: {
    fontSize: 10,
    lineHeight: 14,
    color: '#BCC5BA',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
    marginTop: 2,
  },
  timelineTime: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 12,
    color: '#626865',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
  },
  liveBadge: {
    marginTop: 4,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    color: '#2E7035',
    fontFamily: 'Tajawal_700Bold',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryTitle: {
    fontSize: 15,
    lineHeight: 19,
    color: '#202428',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: '#5F6561',
    fontFamily: 'Tajawal_500Medium',
  },
  summaryValue: {
    flex: 1,
    fontSize: 10,
    lineHeight: 13,
    color: '#202428',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
    marginLeft: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8E9E5',
    marginVertical: 6,
  },
  summaryFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 17,
    lineHeight: 21,
    color: '#202428',
    fontFamily: 'Tajawal_700Bold',
  },
  summaryTotalValue: {
    fontSize: 17,
    lineHeight: 21,
    color: PRIMARY_GREEN,
    fontFamily: 'Tajawal_700Bold',
  },
  reorderButton: {
    marginTop: 8,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 14,
    height: 32,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reorderText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: 'Tajawal_700Bold',
  },
});
