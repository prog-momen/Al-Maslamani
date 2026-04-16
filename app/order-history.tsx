import { AppHeader } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

  const PRIMARY_GREEN = '#67BB28';
  const PAGE_BG = '#F5F4F0';

  type OrderStatus = 'completed' | 'cancelled' | 'processing';

type OrderItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  weight: string;
  name: string;
  subtitle: string;
  total: string;
  image: any;
};

const MOCK_ORDERS: OrderItem[] = [
  {
    id: '1',
      orderNumber: '#100245',
      status: 'completed' as OrderStatus,
      weight: '250 غرام',
      name: 'بزر بطيخ محمص',
      subtitle: 'بطعم الباربكيو',
      total: '0.00',
      image: require('@/assets/images/corn.png'),
  },
  {
    id: '2',
      orderNumber: '#100198',
      status: 'cancelled' as OrderStatus,
      weight: '250 غرام',
      name: 'كاشو بقشرة',
      subtitle: '',
      total: '15.00',
      image: require('@/assets/images/chickpeas.png'),
  },
  {
    id: '3',
      orderNumber: '#100150',
      status: 'completed' as OrderStatus,
      weight: '250 غرام',
      name: 'لوز',
      subtitle: '',
      total: '0.00',
      image: require('@/assets/images/mixed_nuts.png'),
  },
  {
    id: '4',
      orderNumber: '#100099',
      status: 'completed' as OrderStatus,
      weight: '400 غرام',
      name: 'مكسرات اكسترا',
      subtitle: '',
      total: '0.00',
      image: require('@/assets/images/pecan.png'),
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
    completed: {
      label: 'مكتمل',
      color: '#2F6D34',
      bgColor: '#B8E8BE',
  },
  cancelled: {
      label: 'ملغي',
      color: '#A61E23',
      bgColor: '#F7CCCA',
    },
    processing: {
      label: 'جاري',
      color: '#1565C0',
      bgColor: '#E3F2FD',
  },
};

type OrderCardProps = {
  order: OrderItem;
  onPress: (order: OrderItem) => void;
};

  function OrderCard({ order, onPress }: OrderCardProps) {
  const statusInfo = STATUS_CONFIG[order.status];

  return (
      <TouchableOpacity style={styles.orderCard} onPress={() => onPress(order)} activeOpacity={0.9}>
        <View style={styles.cardTopRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

          <View style={styles.productInfoRow}>
            <View style={styles.productImageWrap}>
              <Image source={order.image} style={styles.productImage} contentFit="contain" />
            </View>
            <View style={styles.productTextWrap}>
              <Text style={styles.productWeight}>{order.weight}</Text>
              <Text style={styles.productName}>{order.name}</Text>
              {order.subtitle ? <Text style={styles.productSubtitle}>{order.subtitle}</Text> : null}
            </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.reorderButton} activeOpacity={0.85} onPress={() => {}}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.reorderText}>إعادة الطلب</Text>
        </TouchableOpacity>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
            <Text style={styles.totalValue}>{order.total}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrderHistoryScreen() {
  const router = useRouter();

  const handleOrderPress = (order: OrderItem) => {
    const statusStepMap: Record<OrderStatus, number> = {
      processing: 2,
      completed: 3,
      cancelled: 1,
    };

    const isPreviousOrder = order.status !== 'processing';

    router.push({
      pathname: '/order-tracking',
      params: {
        orderNumber: order.orderNumber,
        currentStep: statusStepMap[order.status],
        previous: isPreviousOrder ? '1' : '0',
        allowReorder: isPreviousOrder ? '1' : '0',
        productName: order.name,
        productSubtitle: order.subtitle || '-',
        productWeight: order.weight,
        total: order.total,
      },
    });
  };

  return (
    <View style={styles.container}>
        <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
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

          <FlatList
            data={MOCK_ORDERS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderCard order={item} onPress={handleOrderPress} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
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
