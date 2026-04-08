import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useAuth } from '@/src/shared/hooks/useAuth';

export function useAppEntry() {
  const { isAuthenticated, isInitializing, session, user } = useAuth();

  const destination = useMemo(() => (isAuthenticated ? '/home' : '/login'), [isAuthenticated]);

  const handleContinue = useCallback(() => {
    // TODO: Replace this snapshot check with the final Supabase auth/session source if needed.
    const hasAuthenticatedUser = Boolean(session?.user ?? user);
    router.replace(hasAuthenticatedUser ? '/home' : '/login');
  }, [session, user]);

  const handleLoginPress = () => {
    router.replace('/login');
  };

  return {
    destination,
    handleContinue,
    handleLoginPress,
    isAuthenticated,
    isInitializing,
  };
}