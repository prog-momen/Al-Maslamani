import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PRIMARY_GREEN = '#2E7D32';
const LIGHT_GREEN = '#E8F5E9';

// بيانات وهمية للطلبات السابقة
const MOCK_ORDERS = [
  {
    id: '1',
    orderNumber: '#100245',
    date: '12 أبريل 2026',
    total: '145.50',
    status: 'delivered',
    itemsCount: 5,
    items: 'مكسرات مشكلة، تمر مجدول...',
  },
  {
    id: '2',
    orderNumber: '#100198',
    date: '05 أبريل 2026',
    total: '89.00',
    status: 'processing',
    itemsCount: 3,
    items: 'لوز، فستق، كاجو',
  },
  {
    id: '3',
    orderNumber: '#100150',
    date: '28 مارس 2026',
    total: '220.00',
    status: 'delivered',
    itemsCount: 8,
    items: 'سلة هدايا فاخرة...',
  },
  {
    id: '4',
    orderNumber: '#100099',
    date: '15 مارس 2026',
    total: '60.00',
    status: 'cancelled',
    itemsCount: 2,
    items: 'بسكويت، شوكولاتة',
  },
  {
    id: '5',
    orderNumber: '#100050',
    date: '02 مارس 2026',
    total: '175.00',
    status: 'delivered',
    itemsCount: 6,
    items: 'تمر، مكسرات، عصير',
  },
];

// بيانات الحالات
const STATUS_CONFIG = {
  delivered: {
    label: 'تم التوصيل',
    color: PRIMARY_GREEN,
    bgColor: LIGHT_GREEN,
    icon: 'checkmark-circle',
  },
  processing: {
    label: 'جاري التنفيذ',
    color: '#1565C0',
    bgColor: '#E3F2FD',
    icon: 'hourglass-outline',
  },
  cancelled: {
    label: 'ملغي',
    color: '#C62828',
    bgColor: '#FFEBEE',
    icon: 'close-circle',
  },
};

// مكون بطاقة الطلب
function OrderCard({ order, onPress }) {
  const statusInfo = STATUS_CONFIG[order.status];

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => onPress(order)}
      activeOpacity={0.85}
    >
      {/* رأس البطاقة */}
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Ionicons
            name={statusInfo.icon}
            size={13}
            color={statusInfo.color}
            style={{ marginLeft: 4 }}
          />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
        <View style={styles.orderNumberRow}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Ionicons name="receipt-outline" size={16} color={PRIMARY_GREEN} style={{ marginLeft: 6 }} />
        </View>
      </View>

      {/* فاصل */}
      <View style={styles.cardDivider} />

      {/* تفاصيل الطلب */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="fast-food-outline" size={15} color="#888" />
          <Text style={styles.itemsText} numberOfLines={1}>
            {order.items}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={15} color="#888" />
          <Text style={styles.infoText}>{order.itemsCount} منتجات</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={15} color="#888" />
          <Text style={styles.infoText}>{order.date}</Text>
        </View>
      </View>

      {/* ذيل البطاقة */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.reorderButton}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Text style={styles.reorderText}>إعادة الطلب</Text>
        </TouchableOpacity>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
          <Text style={styles.totalValue}>{order.total} ر.س</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// مكون الشاشة الرئيسي
export default function OrderHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');

  // تصفية الطلبات حسب الفلتر
  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const handleOrderPress = (order) => {
    // يمكن الانتقال لشاشة التتبع إذا كان الطلب قيد التنفيذ
    if (order.status === 'processing') {
      router.push({
        pathname: '/order-tracking',
        params: {
          orderNumber: order.orderNumber,
          currentStep: 1,
        }
      });
    }
  };

  const FILTERS = [
    { id: 'all', label: 'الكل' },
    { id: 'delivered', label: 'مُوصَّل' },
    { id: 'processing', label: 'جاري' },
    { id: 'cancelled', label: 'ملغي' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_GREEN} barStyle="light-content" />

      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سجل الطلبات</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* أزرار الفلترة */}
      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* قائمة الطلبات */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>لا توجد طلبات</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handleOrderPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: PRIMARY_GREEN,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // الفلاتر
  filterContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  filterText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // قائمة الطلبات
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  // بطاقة الطلب
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  orderNumberRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  itemsText: {
    fontSize: 13,
    color: '#555555',
    flex: 1,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
  },
  cardFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  totalRow: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
  },
  reorderButton: {
    borderWidth: 1.5,
    borderColor: PRIMARY_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  reorderText: {
    color: PRIMARY_GREEN,
    fontSize: 13,
    fontWeight: '600',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#AAAAAA',
    fontWeight: '500',
  },
});
