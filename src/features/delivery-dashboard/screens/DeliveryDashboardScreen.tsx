import { getDeliveryDashboard } from "@/src/features/orders/services/orders.service";
import { useAuth } from "@/src/shared/hooks/useAuth";
import { AppHeader, StaffBottomNavbar } from "@/src/shared/ui";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_BG = "#F2EFE9";
const PRIMARY_GREEN = "#84BD00";
const TITLE = "#1F2120";
const SUBTITLE = "#4E554F";
const CARD_BG = "#FFFFFF";

const STATUS_LABELS = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  preparing: "تحت الإعداد",
  shipped: "في الطريق",
  delivered: "مسلّم",
  cancelled: "ملغي",
} as const;

const STATUS_COLORS = {
  pending: "statusBadgePending",
  confirmed: "statusBadgeConfirmed",
  preparing: "statusBadgeConfirmed",
  shipped: "statusBadgeShipped",
  delivered: "statusBadgeDelivered",
  cancelled: "statusBadgePending",
} as const;

export function DeliveryDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    !user?.id || !isAuthenticated ? (setData(null), setIsLoading(false)) : null;
    if (!user?.id || !isAuthenticated) return;

    try {
      setData((await getDeliveryDashboard(user.id)) as any);
    } catch (error) {
      console.error("Failed to load delivery dashboard:", error);
      Alert.alert("خطأ", "فشل تحميل لوحة التحكم");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
  }, [loadDashboard]);

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/delivery-order-details",
      params: { orderId },
    });
  };

  const handleViewPending = () => {
    router.push("/delivery-pending-orders");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AppHeader logo="transparent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusLabel = (status: string) =>
    STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />
      <AppHeader logo="transparent" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>لوحة التحكم</Text>
          <Text style={styles.headerSubtitle}>أهلاً بك أيها المندوب</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStat]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cube-outline" size={28} color={PRIMARY_GREEN} />
            </View>
            <Text style={styles.statValue}>{data?.ordersCount || 0}</Text>
            <Text style={styles.statLabel}>طلبات اليوم</Text>
          </View>

          <View style={[styles.statCard, styles.successStat]}>
            <View style={styles.statIconContainer}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={28}
                color="#00AA44"
              />
            </View>
            <Text style={styles.statValue}>{data?.deliveredCount || 0}</Text>
            <Text style={styles.statLabel}>مسلّمة اليوم</Text>
          </View>

          <View style={[styles.statCard, styles.earningsStat]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={28} color="#FFB800" />
            </View>
            <Text style={[styles.statValue, { color: "#FFB800" }]}>
              {(data?.dailyEarnings || 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>شيقل</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={handleViewPending}>
              <Text style={styles.viewAllLink}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>الطلبات قيد الانتظار</Text>
          </View>

          {(data?.pendingOrders || []).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={PRIMARY_GREEN}
              />
              <Text style={styles.emptyStateText}>
                لا توجد طلبات قيد الانتظار
              </Text>
              <Text style={styles.emptyStateSubtext}>
                أنت بصدد إكمال جميع المهام!{" "}
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {(data?.pendingOrders || []).slice(0, 3).map((order: any) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => handleOrderPress(order.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.orderCardContent}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderNumber}>
                        #{order.orderNumber}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          styles[
                            STATUS_COLORS[
                              order.status as keyof typeof STATUS_COLORS
                            ]
                          ],
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getStatusLabel(order.status)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.customerName}>
                      {order.customerName}
                    </Text>
                    <Text numberOfLines={2} style={styles.addressText}>
                      {order.addressDetails}
                    </Text>

                    <View style={styles.orderFooter}>
                      <Text style={styles.totalAmount}>
                        {order.total.toFixed(2)} شيقل
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={PRIMARY_GREEN}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewPending}
          >
            <Ionicons name="list-outline" size={20} color={PRIMARY_GREEN} />
            <Text style={styles.actionButtonText}>جميع الطلبات</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-outline" size={20} color={PRIMARY_GREEN} />
            <Text style={styles.actionButtonText}>تقرير اليوم</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <StaffBottomNavbar role="delivery" activeTab="roleHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: TITLE,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: SUBTITLE,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryStat: {
    borderTopWidth: 4,
    borderTopColor: PRIMARY_GREEN,
  },
  successStat: {
    borderTopWidth: 4,
    borderTopColor: "#00AA44",
  },
  earningsStat: {
    borderTopWidth: 4,
    borderTopColor: "#FFB800",
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: TITLE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: SUBTITLE,
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TITLE,
  },
  viewAllLink: {
    fontSize: 14,
    color: PRIMARY_GREEN,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: TITLE,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: SUBTITLE,
    marginTop: 6,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderCardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: TITLE,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgePending: {
    backgroundColor: "#FFF3E0",
  },
  statusBadgeConfirmed: {
    backgroundColor: "#E8F5E9",
  },
  statusBadgeShipped: {
    backgroundColor: "#E3F2FD",
  },
  statusBadgeDelivered: {
    backgroundColor: "#F1F8E9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: SUBTITLE,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: TITLE,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    color: SUBTITLE,
    lineHeight: 18,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: PRIMARY_GREEN,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_GREEN,
  },
});
