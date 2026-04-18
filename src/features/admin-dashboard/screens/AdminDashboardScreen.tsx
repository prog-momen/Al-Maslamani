import { adminAssignDeliveryToOrder, AdminOrderItem, adminSetUserRole, AdminUserItem, AppRole, getAdminOrders, getAdminUsers, OrderStatus, setOrderStatus } from '@/src/features/orders/services/orders.service';
import { getHomeRouteForRole } from '@/src/shared/constants/role-routes';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, Card, StaffBottomNavbar } from '@/src/shared/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterTab = 'all' | OrderStatus;

const PAGE_BG = '#F2F1EE';
const BRAND_GREEN = '#67BB28';
const BRAND_TEXT = '#30312F';

const FILTERS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'بانتظار' },
  { key: 'preparing', label: 'تحضير' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'delivered', label: 'تم التوصيل' },
  { key: 'cancelled', label: 'ملغي' },
];

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; chipBg: string; chipColor: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: { label: 'بانتظار', chipBg: '#F4E8BE', chipColor: '#6A5A10', icon: 'time-outline' },
  confirmed: { label: 'مؤكد', chipBg: '#DCEEFF', chipColor: '#3D6F9A', icon: 'checkmark-done-outline' },
  preparing: { label: 'قيد التحضير', chipBg: '#CFF3D2', chipColor: '#4D821F', icon: 'construct-outline' },
  shipped: { label: 'تم الشحن', chipBg: '#D8F1D8', chipColor: '#296A2E', icon: 'car-outline' },
  delivered: { label: 'مكتمل', chipBg: '#B8E8BE', chipColor: '#2F6D34', icon: 'checkmark-circle-outline' },
  cancelled: { label: 'ملغي', chipBg: '#F3D9CF', chipColor: '#C93206', icon: 'close-circle-outline' },
};

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
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.filterChip, selected && styles.filterChipActive]}>
      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RoleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.roleChip, active && styles.roleChipActive]} onPress={onPress} activeOpacity={0.9}>
      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AdminDashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, isInitializing, role } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [pickerOrder, setPickerOrder] = useState<AdminOrderItem | null>(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [deliverySearch, setDeliverySearch] = useState('');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersData, usersData] = await Promise.all([getAdminOrders(), getAdminUsers()]);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
      setOrders([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || role !== 'admin') {
        return;
      }
      loadDashboardData();
    }, [isAuthenticated, role, loadDashboardData])
  );

  if (!isInitializing && (!isAuthenticated || role !== 'admin')) {
    router.replace(isAuthenticated ? getHomeRouteForRole(role) : '/(auth)/login');
    return null;
  }

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

  const deliveryUsers = useMemo(() => users.filter((user) => user.role === 'delivery'), [users]);

  const updateOrder = async (orderId: string, status: OrderStatus) => {
    try {
      await setOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const changeUserRole = async (targetUserId: string, nextRole: AppRole) => {
    setIsSaving(targetUserId);
    try {
      await adminSetUserRole(targetUserId, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: nextRole } : u)));
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      setIsSaving(null);
    }
  };

  const openDeliveryPicker = (order: AdminOrderItem) => {
    if (deliveryUsers.length === 0) {
      Alert.alert('تنبيه', 'لا يوجد حسابات مندوبين حالياً.');
      return;
    }

    setPickerOrder(order);
    setSelectedDeliveryId(order.assignedDeliveryUserId ?? deliveryUsers[0]?.id ?? null);
    setDeliverySearch('');
  };

  const assignDelivery = async () => {
    if (!pickerOrder || !selectedDeliveryId) {
      return;
    }

    setIsSaving(pickerOrder.id);
    try {
      await adminAssignDeliveryToOrder(pickerOrder.id, selectedDeliveryId);
      const delivery = deliveryUsers.find((user) => user.id === selectedDeliveryId);

      setOrders((prev) =>
        prev.map((item) =>
          item.id === pickerOrder.id
            ? {
                ...item,
                status: item.status === 'pending' ? 'confirmed' : item.status,
                assignedDeliveryUserId: selectedDeliveryId,
                assignedDeliveryName: delivery?.fullName ?? delivery?.email ?? 'مندوب',
              }
            : item
        )
      );

      setPickerOrder(null);
      setSelectedDeliveryId(null);
    } catch (error) {
      console.error('Failed to assign delivery:', error);
      Alert.alert('تعذر التعيين', 'تعذر تعيين المندوب، حاول مرة أخرى.');
    } finally {
      setIsSaving(null);
    }
  };

  const filteredDeliveryUsers = useMemo(() => {
    const normalizedSearch = deliverySearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return deliveryUsers;
    }

    return deliveryUsers.filter((user) => user.fullName.toLowerCase().includes(normalizedSearch));
  }, [deliveryUsers, deliverySearch]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          logo="transparent"
          withSidebar
          sidebarActiveItem="dashboard"
          sidebarSide="left"
          left={<Ionicons name="menu" size={28} color={BRAND_GREEN} />}
          right={
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/contact-us')}>
              <Ionicons name="help-circle-outline" size={28} color={BRAND_GREEN} />
            </TouchableOpacity>
          }
        />

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={BRAND_GREEN} />
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.headerSection}>
                <Text style={styles.pageTitle}>إدارة الطلبات الواردة</Text>
                <Text style={styles.pageSubtitle}>متابعة الطلبات وإدارة صلاحيات المستخدمين من نفس الشاشة.</Text>

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
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setSearch('')}>
                    <Feather name="search" size={20} color="#7A7E78" />
                  </TouchableOpacity>
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="بحث برقم الطلب أو اسم العميل"
                    placeholderTextColor="#9CA09A"
                    textAlign="right"
                    style={styles.searchInput}
                  />
                </View>
              </View>
            }
            renderItem={({ item }) => {
              const statusConfig = ORDER_STATUS_CONFIG[item.status];
              const isCancelledOrDelivered = item.status === 'cancelled' || item.status === 'delivered';
              const isLockedForAssignment = item.status === 'shipped' || item.status === 'cancelled' || item.status === 'delivered';
              const canShip =
                Boolean(item.assignedDeliveryUserId) &&
                (item.status === 'confirmed' || item.status === 'preparing' || item.status === 'pending');

              return (
                <Card className="mb-5 rounded-[30px] border border-[#EBE8E1] bg-[#FCFBF8] px-4 py-4">
                  <View style={styles.orderTopRow}>
                    <View style={styles.orderInfoWrap}>
                      <Text style={styles.orderNumberLabel}>طلب رقم</Text>
                      <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                    </View>

                    <View style={[styles.statusChip, { backgroundColor: statusConfig.chipBg }]}>
                      <Ionicons name={statusConfig.icon} size={16} color={statusConfig.chipColor} style={{ marginLeft: 4 }} />
                      <Text style={[styles.statusChipText, { color: statusConfig.chipColor }]}>{statusConfig.label}</Text>
                    </View>
                  </View>

                  <View style={styles.customerRow}>
                    <View style={styles.customerAvatar}>
                      <Ionicons name="person" size={24} color="#FFFFFF" />
                    </View>

                    <View style={styles.customerMeta}>
                      <Text style={styles.customerName}>{item.customerName}</Text>
                      <Text style={styles.totalText}>₪ {item.total.toFixed(2)} {item.customerPhone ? ` • ${item.customerPhone}` : ''}</Text>
                      <Text style={styles.deliveryAssignedText}>
                        {item.assignedDeliveryName ? `المندوب: ${item.assignedDeliveryName}` : 'المندوب: غير معين'}
                      </Text>
                    </View>

                    {item.customerPhone && (
                      <TouchableOpacity 
                        style={styles.customerPhoneBtn} 
                        onPress={() => Linking.openURL(`tel:${item.customerPhone}`)}
                      >
                        <Feather name="phone" size={16} color={BRAND_GREEN} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      disabled={isCancelledOrDelivered}
                      onPress={() => updateOrder(item.id, 'cancelled')}
                      style={[styles.actionButton, styles.actionCancel, isCancelledOrDelivered && styles.actionDisabled]}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={isCancelledOrDelivered ? '#B9B9B9' : '#C93206'} />
                      <Text style={[styles.actionText, styles.actionCancelText, isCancelledOrDelivered && styles.actionDisabledText]}>إلغاء</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      disabled={isSaving === item.id || isLockedForAssignment}
                      onPress={() => openDeliveryPicker(item)}
                      style={[styles.actionButton, styles.actionSuccess, (isSaving === item.id || isLockedForAssignment) && styles.actionDisabled]}
                    >
                      <Ionicons name="person-add-outline" size={20} color={isLockedForAssignment ? '#B9B9B9' : '#FFFFFF'} />
                      <Text style={[styles.actionText, styles.actionSuccessText, (isSaving === item.id || isLockedForAssignment) && styles.actionDisabledText]}>
                        {isSaving === item.id ? 'جارٍ التعيين...' : item.assignedDeliveryUserId ? 'تغيير المندوب' : 'تعيين مندوب'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      disabled={!canShip}
                      onPress={() => updateOrder(item.id, 'shipped')}
                      style={[styles.actionButton, styles.actionNeutral, !canShip && styles.actionDisabled]}
                    >
                      <Ionicons name="car-outline" size={20} color={!canShip ? '#B9B9B9' : '#67BB28'} />
                      <Text style={[styles.actionText, styles.actionNeutralText, !canShip && styles.actionDisabledText]}>تم الشحن</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>لا توجد طلبات مطابقة.</Text>}
            ListFooterComponent={
              <View style={styles.userRolesSection}>
                <Text style={styles.userRolesTitle}>إدارة رتب المستخدمين</Text>

                {users.map((item) => (
                  <Card key={item.id} className="mb-3 rounded-[20px] border border-[#ECE8E1] bg-[#FCFBF8] px-4 py-3">
                    <View style={styles.userRoleHeader}>
                      <View style={styles.userRoleMeta}>
                        <Text style={styles.userRoleName}>{item.fullName}</Text>
                        <Text style={styles.userRoleEmail}>{item.email}</Text>
                      </View>
                    </View>

                    <View style={styles.roleActionsRow}>
                      <RoleChip label="Member" active={item.role === 'member'} onPress={() => changeUserRole(item.id, 'member')} />
                      <RoleChip label="Delivery" active={item.role === 'delivery'} onPress={() => changeUserRole(item.id, 'delivery')} />
                      <RoleChip label="Admin" active={item.role === 'admin'} onPress={() => changeUserRole(item.id, 'admin')} />
                    </View>

                    {isSaving === item.id ? <Text style={styles.savingText}>جاري حفظ التعديل...</Text> : null}
                  </Card>
                ))}
              </View>
            }
          />
        )}
      </SafeAreaView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.88} onPress={loadDashboardData}>
        <Ionicons name="refresh" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={Boolean(pickerOrder)} transparent animationType="fade" onRequestClose={() => setPickerOrder(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>اختيار مندوب للتوصيل</Text>

            <View style={styles.modalSearchBox}>
              <TextInput
                value={deliverySearch}
                onChangeText={setDeliverySearch}
                placeholder="ابحث باسم المندوب"
                placeholderTextColor="#9BA09A"
                textAlign="right"
                style={styles.modalSearchInput}
              />
            </View>

            {filteredDeliveryUsers.map((deliveryUser) => {
              const isSelected = selectedDeliveryId === deliveryUser.id;
              return (
                <TouchableOpacity
                  key={deliveryUser.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDeliveryId(deliveryUser.id)}
                  style={[styles.modalDeliveryItem, isSelected && styles.modalDeliveryItemActive]}
                >
                  <Text style={[styles.modalDeliveryText, isSelected && styles.modalDeliveryTextActive]}>{deliveryUser.fullName}</Text>
                </TouchableOpacity>
              );
            })}

            {filteredDeliveryUsers.length === 0 ? <Text style={styles.modalEmptyText}>لا يوجد نتائج مطابقة.</Text> : null}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setPickerOrder(null)} activeOpacity={0.85}>
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, (!selectedDeliveryId || isSaving === pickerOrder?.id) && styles.actionDisabled]}
                onPress={assignDelivery}
                activeOpacity={0.85}
                disabled={!selectedDeliveryId || isSaving === pickerOrder?.id}
              >
                <Text style={styles.modalConfirmText}>{isSaving === pickerOrder?.id ? 'جارٍ الحفظ...' : 'تأكيد التعيين'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StaffBottomNavbar role="admin" activeTab="roleHome" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  safeArea: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 18, paddingBottom: 160 },
  headerSection: { marginTop: 2, marginBottom: 14 },
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
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 14,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#E9E7E1',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  filterChipActive: { backgroundColor: BRAND_GREEN },
  filterChipText: { color: '#656760', fontSize: 14, lineHeight: 20, fontFamily: 'Tajawal_500Medium' },
  filterChipTextActive: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold' },
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
  orderTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderInfoWrap: { alignItems: 'flex-end' },
  orderNumberLabel: {
    color: '#6A6D69',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  orderNumber: {
    color: BRAND_GREEN,
    fontFamily: 'Tajawal_700Bold',
    fontSize: 26,
    lineHeight: 32,
    marginTop: 1,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statusChipText: { fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  customerRow: { marginTop: 10, flexDirection: 'row-reverse', alignItems: 'center' },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: BRAND_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerMeta: { marginRight: 10, alignItems: 'flex-end', flex: 1 },
  customerName: { fontFamily: 'Tajawal_700Bold', color: '#2F302F', fontSize: 16, lineHeight: 22 },
  customerPhoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  totalText: {
    color: '#6E716D',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 1,
  },
  deliveryAssignedText: {
    marginTop: 2,
    color: '#5A5D57',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FCFBF8',
    borderRadius: 24,
    padding: 16,
  },
  modalSearchBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DFD6',
    backgroundColor: '#F5F3ED',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalSearchInput: {
    height: 40,
    fontFamily: 'Tajawal_500Medium',
    color: '#454943',
    fontSize: 14,
  },
  modalTitle: {
    textAlign: 'right',
    color: '#1F2120',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 18,
    marginBottom: 10,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: '#7A7D78',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 13,
    marginVertical: 6,
  },
  modalDeliveryItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DFD6',
    backgroundColor: '#F5F3ED',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  modalDeliveryItemActive: {
    backgroundColor: '#67BB28',
    borderColor: '#67BB28',
  },
  modalDeliveryText: {
    textAlign: 'right',
    color: '#3F433D',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
  },
  modalDeliveryTextActive: {
    color: '#FFFFFF',
  },
  modalActionsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DFD6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3ED',
  },
  modalCancelText: {
    color: '#646962',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#67BB28',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 14,
    columnGap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCancel: { backgroundColor: '#F3DDD4' },
  actionSuccess: { backgroundColor: '#67BB28' },
  actionNeutral: { backgroundColor: '#DCE3D2' },
  actionText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 19, marginTop: 2 },
  actionCancelText: { color: '#C93206' },
  actionSuccessText: { color: '#FFFFFF' },
  actionNeutralText: { color: '#67BB28' },
  actionDisabled: { backgroundColor: '#EFEEE9' },
  actionDisabledText: { color: '#B9B9B9' },
  emptyText: {
    marginTop: 28,
    textAlign: 'center',
    fontFamily: 'Tajawal_500Medium',
    color: '#7A7D78',
    fontSize: 16,
  },
  userRolesSection: {
    marginTop: 8,
    paddingBottom: 24,
  },
  userRolesTitle: {
    textAlign: 'right',
    color: BRAND_TEXT,
    fontFamily: 'Tajawal_700Bold',
    fontSize: 21,
    marginBottom: 10,
  },
  userRoleHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRoleMeta: {
    alignItems: 'flex-end',
    flex: 1,
  },
  userRoleName: {
    color: '#1F2120',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
  },
  userRoleEmail: {
    color: '#6F736D',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
  },
  roleActionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  roleChip: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8D8D3',
    backgroundColor: '#F5F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  roleChipActive: {
    backgroundColor: BRAND_GREEN,
    borderColor: BRAND_GREEN,
  },
  roleChipText: {
    color: '#5A5D57',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 12,
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  savingText: {
    marginTop: 8,
    textAlign: 'right',
    color: '#6F736D',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    left: 24,
    bottom: 92,
    width: 60,
    height: 60,
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
});
