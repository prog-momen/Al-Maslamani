import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { getHomeRouteForRole } from '@/src/shared/constants/role-routes';
import { useAuth } from '@/src/shared/hooks/useAuth';

export function useAppEntry() {
  const { isAuthenticated, isInitializing, session, user, role, setGuestMode } = useAuth();

  const destination = useMemo(() => (isAuthenticated ? getHomeRouteForRole(role) : '/(auth)/login'), [isAuthenticated, role]);

  const handleContinue = useCallback(async () => {
    const hasAuthenticatedUser = Boolean(session?.user ?? user);
    if (!hasAuthenticatedUser) {
      await setGuestMode(true);
      router.replace('/home');
    } else {
      router.replace(getHomeRouteForRole(role));
    }
  }, [session, user, role, setGuestMode]);

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