import { AdminUserItem, DeliveryReportSummary, getAdminUsers, getDeliveryReport, OrderStatus } from '@/src/features/orders/services/orders.service';
import { AppHeader, Card, StaffBottomNavbar } from '@/src/shared/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_BG = '#F2F1EE';
const BRAND_GREEN = '#67BB28';
const TITLE_TEXT = '#1F2120';
const SUBTITLE_TEXT = '#626560';

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; chipBg: string; chipColor: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: { label: 'بانتظار', chipBg: '#F4E8BE', chipColor: '#6A5A10', icon: 'time-outline' },
  confirmed: { label: 'مؤكد', chipBg: '#DCEEFF', chipColor: '#3D6F9A', icon: 'checkmark-done-outline' },
  preparing: { label: 'تحضير', chipBg: '#CFF3D2', chipColor: '#4D821F', icon: 'construct-outline' },
  shipped: { label: 'مشحون', chipBg: '#D8F1D8', chipColor: '#296A2E', icon: 'car-outline' },
  delivered: { label: 'تم التوصيل', chipBg: '#B8E8BE', chipColor: '#2F6D34', icon: 'checkmark-circle-outline' },
  cancelled: { label: 'ملغي', chipBg: '#F3D9CF', chipColor: '#C93206', icon: 'close-circle-outline' },
};

export function AdminDeliveryReportScreen() {
    const router = useRouter();
    const [deliveryUsers, setDeliveryUsers] = useState<AdminUserItem[]>([]);
    const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
    const [report, setReport] = useState<DeliveryReportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const users = await getAdminUsers();
            const deliveryOnly = users.filter((u) => u.role === 'delivery');
            setDeliveryUsers(deliveryOnly);
            if (deliveryOnly.length > 0 && !selectedUser) {
                setSelectedUser(deliveryOnly[0]);
            }
        } catch (error) {
            console.error('Failed to load delivery users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedUser]);

    const loadReport = useCallback(async (userId: string) => {
        setIsReportLoading(true);
        try {
            const data = await getDeliveryReport(userId);
            setReport(data);
        } catch (error) {
            console.error('Failed to load delivery report:', error);
        } finally {
            setIsReportLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUsers();
        }, [loadUsers])
    );

    useFocusEffect(
        useCallback(() => {
            if (selectedUser) {
                loadReport(selectedUser.id);
            }
        }, [selectedUser, loadReport])
    );

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('ar-PS', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <AppHeader
                    logo="transparent"
                    left={<Ionicons name="menu" size={28} color={BRAND_GREEN} />}
                    right={
                        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                            <Feather name="arrow-right" size={24} color={BRAND_GREEN} />
                        </TouchableOpacity>
                    }
                />

                <View style={styles.headerContent}>
                    <Text style={styles.pageTitle}>تقارير المناديب</Text>
                    <Text style={styles.pageSubtitle}>تتبع أداء التوصيل والتحصيلات المالية لكل مندوب.</Text>
                </View>

                {isLoading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator color={BRAND_GREEN} size="large" />
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={styles.userListContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.userListScroll}>
                                {deliveryUsers.map((user) => {
                                    const isActive = selectedUser?.id === user.id;
                                    return (
                                        <TouchableOpacity
                                            key={user.id}
                                            activeOpacity={0.85}
                                            onPress={() => setSelectedUser(user)}
                                            style={[styles.userChip, isActive && styles.userChipActive]}
                                        >
                                            <View style={[styles.avatarSmall, isActive && styles.avatarSmallActive]}>
                                                <Ionicons name="person" size={16} color={isActive ? '#FFF' : BRAND_GREEN} />
                                            </View>
                                            <Text style={[styles.userChipName, isActive && styles.userChipNameActive]}>{user.fullName}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {isReportLoading ? (
                            <View style={styles.centerBox}>
                                <ActivityIndicator color={BRAND_GREEN} size="small" />
                                <Text style={styles.loadingText}>جاري جلب البيانات...</Text>
                            </View>
                        ) : report ? (
                            <FlatList
                                data={report.orders}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListHeaderComponent={
                                    <View style={styles.statsRow}>
                                        <Card className="flex-1 mr-3 rounded-[24px] bg-[#EAF5E1] border border-[#D5E6C7] p-4 items-center">
                                            <View style={styles.statIconBox}>
                                                <Feather name="package" size={20} color={BRAND_GREEN} />
                                            </View>
                                            <Text style={styles.statValue}>{report.totalDelivered}</Text>
                                            <Text style={styles.statLabel}>طلبات موصلة</Text>
                                        </Card>

                                        <Card className="flex-1 rounded-[24px] bg-[#FFF9EB] border border-[#F6E9CC] p-4 items-center">
                                            <View style={[styles.statIconBox, { backgroundColor: '#F9ECD2' }]}>
                                                <Feather name="dollar-sign" size={20} color="#D19E2B" />
                                            </View>
                                            <Text style={[styles.statValue, { color: '#D19E2B' }]}>₪ {report.totalAmount.toFixed(2)}</Text>
                                            <Text style={styles.statLabel}>إجمالي التحصيل</Text>
                                        </Card>
                                    </View>
                                }
                                renderItem={({ item }) => {
                                    const config = ORDER_STATUS_CONFIG[item.status];
                                    return (
                                        <Card className="mb-4 rounded-[26px] border border-[#EBE8E1] bg-[#FCFBF8] p-4">
                                            <View style={styles.reportItemTop}>
                                                <View style={styles.orderIdWrap}>
                                                    <Text style={styles.orderLabel}>طلب رقم</Text>
                                                    <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                                                </View>
                                                <View style={[styles.statusChip, { backgroundColor: config.chipBg }]}>
                                                    <Text style={[styles.statusChipText, { color: config.chipColor }]}>{config.label}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.reportItemBottom}>
                                                <View style={styles.customerMeta}>
                                                    <Text style={styles.customerName}>{item.customerName}</Text>
                                                    <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                                                </View>
                                                <Text style={styles.orderAmount}>₪ {item.total.toFixed(2)}</Text>
                                            </View>
                                        </Card>
                                    );
                                }}
                                ListEmptyComponent={
                                    <View style={styles.emptyBox}>
                                        <Ionicons name="documents-outline" size={48} color="#D1D3CE" />
                                        <Text style={styles.emptyText}>لم يقم هذا المندوب بتوصيل أي طلبات بعد.</Text>
                                    </View>
                                }
                            />
                        ) : null}
                    </View>
                )}
            </SafeAreaView>
            <StaffBottomNavbar role="admin" activeTab="roleHome" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: PAGE_BG },
    safeArea: { flex: 1 },
    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
    headerContent: { paddingHorizontal: 20, marginTop: 10, alignItems: 'flex-end', marginBottom: 15 },
    pageTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 28, color: TITLE_TEXT },
    pageSubtitle: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: SUBTITLE_TEXT, textAlign: 'right', marginTop: 4 },
    loadingText: { fontFamily: 'Tajawal_500Medium', fontSize: 13, color: SUBTITLE_TEXT, marginTop: 10 },
    userListContainer: { marginBottom: 15 },
    userListScroll: { paddingHorizontal: 15, gap: 10, flexDirection: 'row-reverse' },
    userChip: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#EBE8E1',
    },
    userChipActive: { backgroundColor: BRAND_GREEN, borderColor: BRAND_GREEN },
    avatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0F5EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    avatarSmallActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
    userChipName: { fontFamily: 'Tajawal_700Bold', fontSize: 13, color: '#4B4D49' },
    userChipNameActive: { color: '#FFF' },
    statsRow: { flexDirection: 'row-reverse', marginBottom: 15 },
    statIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#D6E8C4', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontFamily: 'Tajawal_700Bold', fontSize: 22, color: BRAND_GREEN },
    statLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#6F736C', marginTop: 2 },
    listContent: { paddingHorizontal: 20, paddingBottom: 160 },
    reportItemTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    orderIdWrap: { alignItems: 'flex-end' },
    orderLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 11, color: '#939690' },
    orderNumber: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: TITLE_TEXT },
    statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    statusChipText: { fontFamily: 'Tajawal_700Bold', fontSize: 11 },
    reportItemBottom: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F0EFEB', paddingTop: 10 },
    customerMeta: { alignItems: 'flex-end' },
    customerName: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: TITLE_TEXT },
    orderDate: { fontFamily: 'Tajawal_500Medium', fontSize: 11, color: '#939690', marginTop: 2 },
    orderAmount: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: BRAND_GREEN },
    emptyBox: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#A5A8A2', textAlign: 'center', marginTop: 15, paddingHorizontal: 40 },
});
