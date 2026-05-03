import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppRole } from '@/src/features/orders/services/orders.service';
import { supabase } from '@/src/lib/supabase/client';
import { Database } from '@/src/lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const GUEST_STORAGE_KEY = 'al_maslamani_is_guest';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole;
  isInitializing: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  isDelivery: boolean;
  isMember: boolean;
  setGuestMode: (val: boolean) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  role: 'member',
  isInitializing: true,
  isAuthenticated: false,
  isGuest: false,
  isAdmin: false,
  isDelivery: false,
  isMember: true,
  setGuestMode: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async (nextSession: Session | null) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);

      if (nextSession?.user?.id) {
        // If logged in, turn off guest mode
        setIsGuest(false);
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', nextSession.user.id)
          .maybeSingle();

        if (mounted) {
          setProfile(data ?? null);
        }
      } else {
        if (mounted) {
            setProfile(null);
            // Check if guest mode was previously enabled
            const guestVal = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
            setIsGuest(guestVal === 'true');
        }
      }

      if (mounted) {
        setIsInitializing(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => hydrateSession(data.session ?? null));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrateSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const setGuestMode = useCallback(async (val: boolean) => {
    setIsGuest(val);
    if (val) {
        await AsyncStorage.setItem(GUEST_STORAGE_KEY, 'true');
    } else {
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role: profile?.role ?? 'member',
      isInitializing,
      isAuthenticated: Boolean(session?.user),
      isGuest,
      isAdmin: (profile?.role ?? 'member') === 'admin',
      isDelivery: (profile?.role ?? 'member') === 'delivery',
      isMember: (profile?.role ?? 'member') === 'member' || isGuest,
      setGuestMode,
    }),
    [session, profile, isInitializing, isGuest, setGuestMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
