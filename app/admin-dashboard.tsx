import { AdminDashboardScreen } from '@/src/features/admin-dashboard';
import { getHomeRouteForRole } from '@/src/shared/constants/role-routes';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AdminDashboardRoute() {
  const router = useRouter();
  const { isInitializing, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    if (role !== 'admin') {
      router.replace(getHomeRouteForRole(role));
    }
  }, [isAuthenticated, isInitializing, role, router]);

  if (isInitializing || !isAuthenticated || role !== 'admin') {
    return null;
  }

  return <AdminDashboardScreen />;
}
