import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { AppRole } from '@/src/features/orders/services/orders.service';
import { supabase } from '@/src/lib/supabase/client';
import { Database } from '@/src/lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole;
  isInitializing: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDelivery: boolean;
  isMember: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  role: 'member',
  isInitializing: true,
  isAuthenticated: false,
  isAdmin: false,
  isDelivery: false,
  isMember: true,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async (nextSession: Session | null) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);

      if (nextSession?.user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', nextSession.user.id)
          .maybeSingle();

        if (mounted) {
          setProfile(data ?? null);
        }
      } else if (mounted) {
        setProfile(null);
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

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role: profile?.role ?? 'member',
      isInitializing,
      isAuthenticated: Boolean(session?.user),
      isAdmin: (profile?.role ?? 'member') === 'admin',
      isDelivery: (profile?.role ?? 'member') === 'delivery',
      isMember: (profile?.role ?? 'member') === 'member',
    }),
    [session, profile, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
