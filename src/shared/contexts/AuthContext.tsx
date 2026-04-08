import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/src/lib/supabase/client';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isInitializing: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session ?? null);
        setIsInitializing(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsInitializing(false);
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
      isInitializing,
      isAuthenticated: Boolean(session?.user),
    }),
    [session, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
