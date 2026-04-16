import { AppHeader, Card } from '@/src/shared/ui';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type AdminOrderStatus = 'processing' | 'shipped' | 'cancelled';
type FilterTab = 'all' | AdminOrderStatus;

type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: AdminOrderStatus;
};

const PAGE_BG = '#F2F1EE';
const BRAND_GREEN = '#67BB28';
const BRAND_TEXT = '#30312F';

const FILTERS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'processing', label: 'قيد التحضير' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'cancelled', label: 'ملغي' },
];

const ORDER_STATUS_CONFIG: Record<
  AdminOrderStatus,
  { label: string; chipBg: string; chipColor: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  processing: {
    label: 'قيد التحضير',
    chipBg: '#CFF3D2',
    chipColor: '#4D821F',
    icon: 'time-outline',
  },
  shipped: {
    label: 'تم الشحن',
    chipBg: '#67BB28',
    chipColor: '#FFFFFF',
    icon: 'car-outline',
  },
  cancelled: {
    label: 'ملغي',
    chipBg: '#F3D9CF',
    chipColor: '#C93206',
    icon: 'close-circle-outline',
  },
};

const INITIAL_ORDERS: AdminOrder[] = [
  { id: '1', orderNumber: '#SAM-1234', customerName: 'احمد علي', total: 240, status: 'processing' },
  { id: '2', orderNumber: '#SAM-1235', customerName: 'رعد خالد', total: 115.5, status: 'shipped' },
  { id: '3', orderNumber: '#SAM-1236', customerName: 'مجاهد محمد', total: 380, status: 'processing' },
  { id: '4', orderNumber: '#SAM-1237', customerName: 'اية سامي', total: 45, status: 'cancelled' },
];

function StatusFilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function OrderActionButton({
  title,
  icon,
  variant,
  disabled,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: 'cancel' | 'success' | 'neutral';
  disabled?: boolean;
  onPress: () => void;
}) {
  const variantStyle =
    variant === 'cancel'
      ? styles.actionCancel
      : variant === 'neutral'
      ? styles.actionNeutral
      : styles.actionSuccess;

  const textVariantStyle =
    variant === 'cancel'
      ? styles.actionCancelText
      : variant === 'neutral'
      ? styles.actionNeutralText
      : styles.actionSuccessText;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[styles.actionButton, variantStyle, disabled && styles.actionDisabled]}
    >
      <Ionicons name={icon} size={20} color={disabled ? '#B9B9B9' : (textVariantStyle.color as string)} />
      <Text style={[styles.actionText, textVariantStyle, disabled && styles.actionDisabledText]}>{title}</Text>
    </TouchableOpacity>
  );
}

function BottomAdminNav() {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomItem}>
        <Feather name="home" size={22} color={BRAND_GREEN} />
        <Text style={styles.bottomItemActive}>الرئيسية</Text>
      </View>

      <View style={styles.bottomItem}>
        <Ionicons name="list" size={22} color="#5B5C59" />
        <Text style={styles.bottomItemText}>الطلبات</Text>
      </View>

      <View style={styles.bottomItem}>
        <MaterialCommunityIcons name="chart-box-outline" size={22} color="#5B5C59" />
        <Text style={styles.bottomItemText}>التقارير</Text>
      </View>

      <View style={styles.bottomItem}>
        <Feather name="user" size={22} color="#5B5C59" />
        <Text style={styles.bottomItemText}>الملف</Text>
      </View>
    </View>
  );
}

export function AdminDashboardScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);

  const filteredOrders = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return orders.filter((order) => {
      const passFilter = activeFilter === 'all' ? true : order.status === activeFilter;
      const passSearch =
        normalized.length === 0 ||
        order.orderNumber.toLowerCase().includes(normalized) ||
        order.customerName.toLowerCase().includes(normalized);

      return passFilter && passSearch;
    });
  }, [activeFilter, orders, search]);

  const updateOrderStatus = (orderId: string, status: AdminOrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
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
          left={<Ionicons name="menu" size={28} color={BRAND_GREEN} />}
          right={
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/contact-us')}>
              <Ionicons name="help-circle-outline" size={28} color={BRAND_GREEN} />
            </TouchableOpacity>
          }
        />

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <Text style={styles.pageTitle}>إدارة الطلبات الواردة</Text>
              <Text style={styles.pageSubtitle}>تتبع وتحديث حالة الطلبات لضمان تجربة عميل مميزة.</Text>

              <View style={styles.filtersRow}>
                {FILTERS.map((filter) => (
                  <StatusFilterChip
                    key={filter.key}
                    label={filter.label}
                    selected={activeFilter === filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                  />
                ))}
              </View>

              <View style={styles.searchBox}>
                <TouchableOpacity activeOpacity={0.8}>
                  <Feather name="calendar" size={22} color="#7A7E78" />
                </TouchableOpacity>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="بحث بالتاريخ أو رقم الطلب..."
                  placeholderTextColor="#9CA09A"
                  textAlign="right"
                  style={styles.searchInput}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const statusConfig = ORDER_STATUS_CONFIG[item.status];
            const isCancelled = item.status === 'cancelled';

            return (
              <Card className="mb-5 rounded-[30px] border border-[#EBE8E1] bg-[#FCFBF8] px-4 py-4">
                <View style={styles.orderTopRow}>
                  <View style={styles.orderInfoWrap}>
                    <Text style={styles.orderNumberLabel}>طلب رقم</Text>
                    <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                  </View>

                  <View style={[styles.statusChip, { backgroundColor: statusConfig.chipBg }]}>
                    <Ionicons
                      name={statusConfig.icon}
                      size={16}
                      color={statusConfig.chipColor}
                      style={{ marginLeft: 4 }}
                    />
                    <Text style={[styles.statusChipText, { color: statusConfig.chipColor }]}>{statusConfig.label}</Text>
                  </View>
                </View>

                <View style={styles.customerRow}>
                  <View style={styles.customerAvatar}>
                    <Ionicons name="person" size={24} color="#FFFFFF" />
                  </View>

                  <View style={styles.customerMeta}>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <Text style={styles.totalText}>₪ {item.total.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <OrderActionButton
                    title="ملفي"
                    icon="close-circle-outline"
                    variant="cancel"
                    disabled={isCancelled}
                    onPress={() => updateOrderStatus(item.id, 'cancelled')}
                  />

                  <OrderActionButton
                    title="تم التوصيل"
                    icon="checkmark-circle-outline"
                    variant="success"
                    disabled={isCancelled}
                    onPress={() => updateOrderStatus(item.id, 'processing')}
                  />

                  <OrderActionButton
                    title="تم الشحن"
                    icon="car-outline"
                    variant="neutral"
                    disabled={isCancelled}
                    onPress={() => updateOrderStatus(item.id, 'shipped')}
                  />
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>لا توجد طلبات مطابقة لنتائج البحث.</Text>}
        />
      </SafeAreaView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.88}>
        <Ionicons name="add" size={36} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomAdminNav />
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
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 160,
  },
  headerSection: {
    marginTop: 2,
    marginBottom: 14,
  },
  pageTitle: {
    textAlign: 'right',
    color: BRAND_TEXT,
    fontSize: 31,
    lineHeight: 38,
    fontFamily: 'Tajawal_700Bold',
  },
  pageSubtitle: {
    textAlign: 'right',
    color: '#626560',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Tajawal_500Medium',
    marginTop: 4,
  },
  filtersRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#E9E7E1',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: BRAND_GREEN,
  },
  filterChipText: {
    color: '#656760',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Tajawal_500Medium',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Tajawal_700Bold',
  },
  searchBox: {
    borderRadius: 20,
    backgroundColor: '#F1EFEB',
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE8DF',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Tajawal_500Medium',
    fontSize: 15,
    color: '#444845',
    marginRight: 8,
  },
  orderTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfoWrap: {
    alignItems: 'flex-end',
  },
  orderNumberLabel: {
    color: '#6A6D69',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  orderNumber: {
    color: BRAND_GREEN,
    fontFamily: 'Tajawal_700Bold',
    fontSize: 32,
    lineHeight: 36,
    marginTop: 1,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statusChipText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 13,
    lineHeight: 18,
  },
  customerRow: {
    marginTop: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: BRAND_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerMeta: {
    marginRight: 10,
    alignItems: 'flex-end',
  },
  customerName: {
    fontFamily: 'Tajawal_700Bold',
    color: '#2F302F',
    fontSize: 18,
    lineHeight: 24,
  },
  totalText: {
    color: '#6E716D',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 16,
    lineHeight: 20,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 14,
    columnGap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCancel: {
    backgroundColor: '#F3DDD4',
  },
  actionSuccess: {
    backgroundColor: '#67BB28',
  },
  actionNeutral: {
    backgroundColor: '#DCE3D2',
  },
  actionText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  actionCancelText: {
    color: '#C93206',
  },
  actionSuccessText: {
    color: '#FFFFFF',
  },
  actionNeutralText: {
    color: '#67BB28',
  },
  actionDisabled: {
    backgroundColor: '#EFEEE9',
  },
  actionDisabledText: {
    color: '#B9B9B9',
  },
  emptyText: {
    marginTop: 28,
    textAlign: 'center',
    fontFamily: 'Tajawal_500Medium',
    color: '#7A7D78',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    left: 24,
    bottom: 92,
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: BRAND_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 86,
    backgroundColor: '#F3F1E9',
    borderTopWidth: 1,
    borderTopColor: '#E7E3D8',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomItemActive: {
    color: BRAND_GREEN,
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  bottomItemText: {
    color: '#5B5C59',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
});
