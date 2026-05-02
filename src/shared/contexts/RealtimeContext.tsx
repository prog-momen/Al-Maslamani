import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/useAuth';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type RealtimeDomain = 'cart' | 'orders' | 'notifications' | 'profiles' | 'products';

type RealtimeContextValue = {
  signals: Record<RealtimeDomain, number>;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  signals: {
    cart: 0,
    orders: 0,
    notifications: 0,
    profiles: 0,
    products: 0,
  },
});

export function RealtimeProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [signals, setSignals] = useState<Record<RealtimeDomain, number>>({
    cart: 0,
    orders: 0,
    notifications: 0,
    profiles: 0,
    products: 0,
  });

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const bump = (domain: RealtimeDomain) => {
      setSignals((prev) => ({ ...prev, [domain]: prev[domain] + 1 }));
    };

    const channel = supabase
      .channel(`app-realtime-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items' }, () => bump('cart'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => bump('notifications'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => bump('orders'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => bump('orders'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_status_history' }, () => bump('orders'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => bump('profiles'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => bump('products'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => bump('products'))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const value = useMemo(() => ({ signals }), [signals]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeSignal(domain: RealtimeDomain) {
  const context = useContext(RealtimeContext);
  return context.signals[domain];
}
