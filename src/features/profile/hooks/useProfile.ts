import { useQuery } from '@tanstack/react-query';

import { profileService } from '@/src/features/profile/services/profile.service';
import { useAuth } from '@/src/shared/hooks/useAuth';

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await profileService.getById(user.id);
      if (error) throw error;
      return data;
    },
  });
}
