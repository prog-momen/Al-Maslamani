import { useAuth } from '@/src/shared/hooks/useAuth';
import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useRealtimeTable } from '../hooks/useRealtimeTable';

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

  const bump = (domain: RealtimeDomain) => {
    setSignals((prev) => ({ ...prev, [domain]: prev[domain] + 1 }));
  };

  // We use the same centralized realtime logic to bump signals
  // This ensures we only have ONE subscription per table globally
  useRealtimeTable('cart_items', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('cart') 
  });
  
  useRealtimeTable('notifications', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('notifications') 
  });

  useRealtimeTable('orders', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('orders') 
  });

  useRealtimeTable('order_items', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('orders') 
  });

  useRealtimeTable('order_status_history', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('orders') 
  });

  useRealtimeTable('profiles', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('profiles') 
  });

  useRealtimeTable('products', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('products') 
  });

  useRealtimeTable('categories', { 
    enabled: !!user?.id, 
    fetchInitial: false,
    onDataChange: () => bump('products') 
  });

  const value = useMemo(() => ({ signals }), [signals]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeSignal(domain: RealtimeDomain) {
  const context = useContext(RealtimeContext);
  return context.signals[domain];
}
