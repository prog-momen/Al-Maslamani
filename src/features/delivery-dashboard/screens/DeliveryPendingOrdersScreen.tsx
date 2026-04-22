import { getDeliveryPendingOrders } from "@/src/features/orders/services/orders.service";
import { useAuth } from "@/src/shared/hooks/useAuth";
import { AppHeader } from "@/src/shared/ui";
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
  pending: "#FF9800",
  confirmed: "#2196F3",
  preparing: "#2196F3",
  shipped: "#4CAF50",
  delivered: "#8BC34A",
  cancelled: "#9E9E9E",
} as const;

export function DeliveryPendingOrdersScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPendingOrders = useCallback(async () => {
    !user?.id || !isAuthenticated ? (setOrders([]), setIsLoading(false)) : null;
    if (!user?.id || !isAuthenticated) return;

    try {
      setOrders(await getDeliveryPendingOrders(user.id));
    } catch (error) {
      console.error("Failed to load pending orders:", error);
      Alert.alert("خطأ", "فشل تحميل الطلبات المعلقة");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadPendingOrders();
    }, [loadPendingOrders]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPendingOrders();
    setIsRefreshing(false);
  }, [loadPendingOrders]);

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/delivery-order-details",
      params: { orderId },
    });
  };

  const statusLabel = (status: string) =>
    STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;

  const statusColor = (status: string) =>
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#9E9E9E";

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AppHeader
          logo="transparent"
          left={
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />
      <AppHeader
        logo="transparent"
        left={
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>الطلبات المعلقة</Text>
          <Text style={styles.headerSubtitle}>
            {orders.length} طلبات بانتظار التسليم
          </Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color={PRIMARY_GREEN} />
            <Text style={styles.emptyStateText}>لا توجد طلبات معلقة</Text>
            <Text style={styles.emptyStateSubtext}>
              جميع الطلبات تم تسليمها بنجاح{" "}
            </Text>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => router.push("/delivery-dashboard")}
            >
              <Text style={styles.returnButtonText}>العودة للوحة التحكم</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => handleOrderPress(order.id)}
                activeOpacity={0.85}
              >
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderNumberContainer}>
                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor(order.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusColor(order.status) },
                      ]}
                    >
                      {statusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.customerName}>{order.customerName}</Text>

                {order.customerPhone && (
                  <View style={styles.contactRow}>
                    <TouchableOpacity>
                      <Ionicons name="call" size={18} color={PRIMARY_GREEN} />
                    </TouchableOpacity>
                    <Text style={styles.phone}>{order.customerPhone}</Text>
                  </View>
                )}

                <Text numberOfLines={2} style={styles.addressText}>
                  {order.addressDetails}
                </Text>

                <View style={styles.orderFooter}>
                  <Text style={styles.totalAmount}>
                    {order.total.toFixed(2)} شيقل
                  </Text>
                  <Text style={styles.timeAgo}>
                    {getTimeAgo(new Date(order.createdAt))}
                  </Text>
                </View>

                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>عرض التفاصيل</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={PRIMARY_GREEN}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "للتو";
  if (diffMins < 60) return `${diffMins}د`;
  if (diffHours < 24) return `${diffHours}س`;
  return `${diffDays}ي`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    marginBottom: 20,
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
  emptyState: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: TITLE,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: SUBTITLE,
    marginTop: 8,
  },
  returnButton: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  returnButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumberContainer: {
    flex: 1,
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: TITLE,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  phone: {
    fontSize: 13,
    color: PRIMARY_GREEN,
    fontWeight: "500",
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
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: PRIMARY_GREEN,
  },
  timeAgo: {
    fontSize: 12,
    color: SUBTITLE,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: PRIMARY_GREEN + "15",
    borderRadius: 8,
    paddingVertical: 10,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY_GREEN,
  },
});
