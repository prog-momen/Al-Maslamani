import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLoyaltyHistory, getLoyaltyPoints, redeemLoyaltyPoints } from '../services/loyalty'

export function useLoyaltyPoints(user) {
  return useQuery(['loyaltyPoints', user?.id], () => getLoyaltyPoints(user), { enabled: !!user })
}

export function useLoyaltyHistory(user) {
  return useQuery(['loyaltyHistory', user?.id], () => getLoyaltyHistory(user), { enabled: !!user })
}

export function useRedeemLoyaltyPoints(user) {
  const queryClient = useQueryClient()
  return useMutation(
    (points) => redeemLoyaltyPoints(user, points),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['loyaltyPoints', user?.id])
        queryClient.invalidateQueries(['loyaltyHistory', user?.id])
      },
    }
  )
}
