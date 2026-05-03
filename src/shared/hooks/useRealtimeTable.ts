import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { Database } from '@/src/lib/supabase/database.types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = keyof Database['public']['Tables'];

/**
 * Registry to ensure only one subscription per table globally.
 */
const subscriptionRegistry: Record<string, {
  channel: RealtimeChannel;
  refCount: number;
  listeners: Set<(payload: RealtimePostgresChangesPayload<any>) => void>;
}> = {};

export function useRealtimeTable<T extends TableName>(
  tableName: T,
  options: { 
    enabled?: boolean;
    fetchInitial?: boolean;
    onDataChange?: (payload: RealtimePostgresChangesPayload<Database['public']['Tables'][T]['Row']>) => void;
  } = {}
) {
  const { enabled = true, fetchInitial = true, onDataChange } = options;
  const [data, setData] = useState<Database['public']['Tables'][T]['Row'][]>([]);
  const [loading, setLoading] = useState(fetchInitial);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !fetchInitial) return;
    try {
      setLoading(true);
      const { data: initialData, error: fetchError } = await supabase
        .from(tableName)
        .select('*');

      if (fetchError) throw fetchError;
      if (isMounted.current) {
        setData((initialData as any) || []);
        setError(null);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [tableName, enabled, fetchInitial]);

  useEffect(() => {
    isMounted.current = true;
    if (enabled && fetchInitial) {
      fetchData();
    }
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, enabled, fetchInitial]);

  useEffect(() => {
    if (!enabled) return;

    const handlePayload = (payload: RealtimePostgresChangesPayload<any>) => {
      // Internal state update only if we are tracking data
      if (fetchInitial) {
        setData((current) => {
          const { eventType, new: newItem, old: oldItem } = payload;

          switch (eventType) {
            case 'INSERT':
              if (current.some((item: any) => item.id === newItem.id)) return current;
              return [newItem as any, ...current];
            case 'UPDATE':
              return current.map((item: any) => 
                item.id === newItem.id ? { ...item, ...newItem } : item
              );
            case 'DELETE':
              return current.filter((item: any) => item.id !== oldItem.id);
            default:
              return current;
          }
        });
      }

      // External callback (e.g. for signal bumping)
      if (onDataChange) {
        onDataChange(payload as any);
      }
    };

    // Shared subscription logic
    if (!subscriptionRegistry[tableName]) {
      const channel = supabase
        .channel(`realtime-${tableName}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            const entry = subscriptionRegistry[tableName];
            if (entry) {
              entry.listeners.forEach(l => l(payload));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error(`Realtime error on table ${tableName}`);
          }
        });

      subscriptionRegistry[tableName] = {
        channel,
        refCount: 0,
        listeners: new Set(),
      };
    }

    const registryEntry = subscriptionRegistry[tableName];
    registryEntry.refCount++;
    registryEntry.listeners.add(handlePayload);

    return () => {
      const entry = subscriptionRegistry[tableName];
      if (entry) {
        entry.listeners.delete(handlePayload);
        entry.refCount--;

        if (entry.refCount === 0) {
          supabase.removeChannel(entry.channel);
          delete subscriptionRegistry[tableName];
        }
      }
    };
  }, [tableName, enabled, onDataChange]);

  return { data, setData, loading, error, refetch: fetchData };
}
