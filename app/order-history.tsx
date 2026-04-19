import { getMyOrders, OrderHistoryItem, reorderOrder } from '@/src/features/orders/services/orders.service';
import { useCart } from '@/src/shared/contexts/CartContext';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

  const PRIMARY_GREEN = '#67BB28';
  const PAGE_BG = '#F5F4F0';

const STATUS_CONFIG = {
  delivered: {
    label: 'مكتمل',
    color: '#2F6D34',
    bgColor: '#B8E8BE',
  },
  cancelled: {
    label: 'ملغي',
    color: '#A61E23',
    bgColor: '#F7CCCA',
  },
  preparing: {
    label: 'قيد التحضير',
    color: '#1565C0',
    bgColor: '#E3F2FD',
  },
  pending: {
    label: 'قيد الانتظار',
    color: '#6A5A10',
    bgColor: '#F4E8BE',
  },
  confirmed: {
    label: 'مؤكد',
    color: '#3D6F9A',
    bgColor: '#DCEEFF',
  },
  shipped: {
    label: 'تم الشحن',
    color: '#296A2E',
    bgColor: '#D8F1D8',
  },
} as const;

type OrderCardProps = {
  order: OrderHistoryItem;
  onPress: (order: OrderHistoryItem) => void;
  onReorder: (order: OrderHistoryItem) => void;
  isReordering?: boolean;
};

  function OrderCard({ order, onPress, onReorder, isReordering }: OrderCardProps) {
  const statusInfo = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const imageSource = order.productImageUrl
    ? { uri: order.productImageUrl }
    : require('@/assets/images/mixed_nuts.png');

  return (
      <TouchableOpacity style={styles.orderCard} onPress={() => onPress(order)} activeOpacity={0.9}>
        <View style={styles.cardTopRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

          <View style={styles.productInfoRow}>
            <View style={styles.productImageWrap}>
              <Image source={imageSource} style={styles.productImage} contentFit="contain" />
            </View>
            <View style={styles.productTextWrap}>
              <Text style={styles.productWeight}>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</Text>
              <Text style={styles.productName}>{order.productName}</Text>
              {order.productSubtitle ? <Text style={styles.productSubtitle}>{order.productSubtitle}</Text> : null}
            </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={[styles.reorderButton, isReordering && { opacity: 0.7 }]} 
            activeOpacity={0.85} 
            onPress={() => onReorder(order)}
            disabled={isReordering}
          >
            {isReordering ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
            )}
          <Text style={styles.reorderText}>{isReordering ? 'جاري الإضافة...' : 'إعادة الطلب'}</Text>
        </TouchableOpacity>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
            <Text style={styles.totalValue}>{order.total.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const ordersSignal = useRealtimeSignal('orders');
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getMyOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load order history:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  React.useEffect(() => {
    if (!user?.id) {
      return;
    }
    loadOrders();
  }, [loadOrders, ordersSignal, user?.id]);

  const statusStepMap = useMemo(
    () => ({
      pending: 0,
      confirmed: 1,
      preparing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: 1,
    }),
    []
  );

  const handleOrderPress = (order: OrderHistoryItem) => {
    const currentStep = statusStepMap[order.status] ?? 0;
    const isPreviousOrder = order.status !== 'pending' && order.status !== 'confirmed' && order.status !== 'preparing';

    router.push({
      pathname: '/order-tracking',
      params: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        currentStep,
        previous: isPreviousOrder ? '1' : '0',
        allowReorder: isPreviousOrder ? '1' : '0',
        productName: order.productName,
        productSubtitle: order.productSubtitle || '-',
        productWeight: '-',
        total: order.total.toFixed(2),
      },
    });
  };

  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const handleReorder = async (order: OrderHistoryItem) => {
    if (!user?.id) return;
    
    setReorderingId(order.id);
    try {
      await reorderOrder(order.id, user.id);
      await refreshCart();
      router.push('/cart');
    } catch (error) {
      console.error('Reorder failed:', error);
      alert('فشلت عملية إعادة الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setReorderingId(null);
    }
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
          left={<Ionicons name="menu" size={34} color={PRIMARY_GREEN} />}
          right={
            <TouchableOpacity onPress={() => router.push('/contact-us')} activeOpacity={0.8}>
              <Ionicons name="help-circle-outline" size={30} color={PRIMARY_GREEN} />
            </TouchableOpacity>
          }
        />

          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>سجل الطلبات</Text>
            <Text style={styles.pageSubtitle}>تتبع مشترياتك السابقة من متجرنا</Text>
            <Text style={styles.pageSubtitle}>المنسق</Text>
        </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={PRIMARY_GREEN} size="large" />
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <OrderCard 
                  order={item} 
                  onPress={handleOrderPress} 
                  onReorder={handleReorder}
                  isReordering={reorderingId === item.id}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyText}>لا توجد طلبات حالياً.</Text>}
            />
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
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    paddingHorizontal: 34,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  pageTitle: {
    fontSize: 29,
    lineHeight: 36,
    color: '#0F0F0F',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: '#6E6D6A',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: 28,
    paddingTop: 6,
    paddingBottom: 150,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6E6D6A',
    fontFamily: 'Tajawal_500Medium',
    marginTop: 24,
  },
  orderCard: {
    backgroundColor: '#F9F7F2',
    borderRadius: 26,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  cardTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    marginTop: 4,
    borderRadius: 999,
    minWidth: 90,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: 'Tajawal_700Bold',
  },
  productInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 10,
    flex: 1,
  },
  productImageWrap: {
    width: 82,
    height: 82,
    borderRadius: 20,
    backgroundColor: '#ECEBE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 68,
    height: 68,
  },
  productTextWrap: {
    alignItems: 'flex-end',
    flexShrink: 1,
    maxWidth: 190,
  },
  productWeight: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6E6D6A',
    fontFamily: 'Tajawal_500Medium',
    marginBottom: 4,
    textAlign: 'right',
  },
  productName: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1D1D1D',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
    marginTop: 1,
  },
  productSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: '#1D1D1D',
    fontFamily: 'Tajawal_700Bold',
    marginTop: 2,
    textAlign: 'right',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E9E6DF',
    marginTop: 14,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reorderButton: {
    backgroundColor: PRIMARY_GREEN,
    minWidth: 172,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reorderText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Tajawal_700Bold',
  },
  totalRow: {
    alignItems: 'flex-end',
    minWidth: 76,
  },
  totalLabel: {
    fontSize: 15,
    lineHeight: 18,
    color: '#75736F',
    fontFamily: 'Tajawal_500Medium',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 32,
    lineHeight: 30,
    color: PRIMARY_GREEN,
    fontFamily: 'Tajawal_700Bold',
  },
});
