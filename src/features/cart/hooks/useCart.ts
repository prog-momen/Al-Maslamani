import { useQuery } from '@tanstack/react-query';

import { cartService } from '@/src/features/cart/services/cart.service';
import { useAuth } from '@/src/shared/hooks/useAuth';

export function useCart() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['cart', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await cartService.listByUser(user.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    ...query,
    items: query.data ?? [],
  };
}
