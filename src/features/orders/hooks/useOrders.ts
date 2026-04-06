import { useQuery } from '@tanstack/react-query';

import { ordersService } from '@/src/features/orders/services/orders.service';
import { useAuth } from '@/src/shared/hooks/useAuth';

export function useOrders() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['orders', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await ordersService.listByUser(user.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    ...query,
    orders: query.data ?? [],
  };
}
