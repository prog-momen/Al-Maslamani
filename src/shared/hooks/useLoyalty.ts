import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLoyaltyHistory, getLoyaltyPoints, redeemLoyaltyPoints } from '../services/loyalty';
import { User } from '@supabase/supabase-js';

export function useLoyaltyPoints(user: User | null) {
  return useQuery({
    queryKey: ['loyaltyPoints', user?.id],
    queryFn: () => getLoyaltyPoints(user!),
    enabled: !!user,
  });
}

export function useLoyaltyHistory(user: User | null) {
  return useQuery({
    queryKey: ['loyaltyHistory', user?.id],
    queryFn: () => getLoyaltyHistory(user!),
    enabled: !!user,
  });
}

export function useRedeemLoyaltyPoints(user: User | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (points: number) => redeemLoyaltyPoints(user!, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyPoints', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['loyaltyHistory', user?.id] });
    },
  });
}
