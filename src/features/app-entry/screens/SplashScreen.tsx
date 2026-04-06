import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { Loader, ScreenWrapper } from '@/src/shared/ui';

export function SplashScreen() {
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;

    const targetRoute = user ? '/home' : '/login';
    const timer = setTimeout(() => {
      router.replace(targetRoute);
    }, 500);

    return () => clearTimeout(timer);
  }, [isInitializing, user]);

  return (
    <ScreenWrapper>
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827' }}>Al-Maslamani</Text>
      <Loader />
    </ScreenWrapper>
  );
}
