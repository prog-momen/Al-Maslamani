import { useQuery } from '@tanstack/react-query';

import { favoritesService } from '@/src/features/favorites/services/favorites.service';
import { useAuth } from '@/src/shared/hooks/useAuth';

export function useFavorites() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['favorites', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await favoritesService.listByUser(user.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    ...query,
    favorites: query.data ?? [],
  };
}
