import { useQuery } from '@tanstack/react-query';

import { addressesService } from '@/src/features/checkout/services/addresses.service';
import { useAuth } from '@/src/shared/hooks/useAuth';

export function useAddresses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['addresses', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await addressesService.listByUser(user.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}
