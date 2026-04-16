import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { getHomeRouteForRole } from '@/src/shared/constants/role-routes';
import { useAuth } from '@/src/shared/hooks/useAuth';

export function useAppEntry() {
  const { isAuthenticated, isInitializing, session, user, role } = useAuth();

  const destination = useMemo(() => (isAuthenticated ? getHomeRouteForRole(role) : '/(auth)/login'), [isAuthenticated, role]);

  const handleContinue = useCallback(() => {
    const hasAuthenticatedUser = Boolean(session?.user ?? user);
    router.replace(hasAuthenticatedUser ? getHomeRouteForRole(role) : '/(auth)/login');
  }, [session, user, role]);

  const handleLoginPress = () => {
    router.replace('/(auth)/login');
  };

  return {
    destination,
    handleContinue,
    handleLoginPress,
    isAuthenticated,
    isInitializing,
  };
}