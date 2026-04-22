import { DeliveryPendingOrdersScreen } from "@/src/features/delivery-dashboard/screens/DeliveryPendingOrdersScreen";
import { getHomeRouteForRole } from "@/src/shared/constants/role-routes";
import { useAuth } from "@/src/shared/hooks/useAuth";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function DeliveryPendingOrdersRoute() {
  const router = useRouter();
  const { isInitializing, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    if (role !== "delivery" && role !== "admin") {
      router.replace(getHomeRouteForRole(role));
    }
  }, [isAuthenticated, isInitializing, role, router]);

  if (
    isInitializing ||
    !isAuthenticated ||
    (role !== "delivery" && role !== "admin")
  ) {
    return null;
  }

  return <DeliveryPendingOrdersScreen />;
}
