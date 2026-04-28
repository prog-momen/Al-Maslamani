import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export async function getLoyaltyPoints(user) {
  const { data, error } = await supabase
    .from('loyalty_points')
    .select('points')
    .eq('user_id', user.id)
    .single()
  if (error) throw error
  return data?.points ?? 0
}

export async function getLoyaltyHistory(user) {
  const { data, error } = await supabase
    .from('loyalty_points_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function redeemLoyaltyPoints(user, points) {
  if (points % 500 !== 0) throw new Error('Points must be a multiple of 500')
  const { data, error } = await supabase.rpc('redeem_loyalty_points', {
    _user_id: user.id,
    _points_to_redeem: points,
  })
  if (error) throw error
  return data // discount amount
}
