import { AppRole } from "@/src/features/orders/services/orders.service";

export function getHomeRouteForRole(role: AppRole) {
  if (role === "admin") {
    return "/admin-dashboard" as const;
  }

  if (role === "delivery") {
    return "/delivery-dashboard" as const;
  }

  return "/home" as const;
}
