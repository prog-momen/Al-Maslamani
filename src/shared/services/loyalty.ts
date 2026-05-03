import { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase/client';
import { Database } from '@/src/lib/supabase/database.types';

type LoyaltyHistoryItem = Database['public']['Tables']['loyalty_points_history']['Row'];

export async function getLoyaltyPoints(user: User): Promise<number> {
  const { data, error } = await supabase
    .from('loyalty_points' as any)
    .select('points')
    .eq('user_id', user.id)
    .maybeSingle() as any;
    
  if (error) throw error
  return (data as any)?.points ?? 0
}

export async function getLoyaltyHistory(user: User): Promise<LoyaltyHistoryItem[]> {
  const { data, error } = await supabase
    .from('loyalty_points_history' as any)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) as any;
    
  if (error) throw error
  return (data as LoyaltyHistoryItem[]) || []
}

export async function redeemLoyaltyPoints(user: User, points: number): Promise<number> {
  if (points % 500 !== 0) throw new Error('Points must be a multiple of 500')
  const { data, error } = await (supabase as any).rpc('redeem_loyalty_points', {
    _user_id: user.id,
    _points_to_redeem: points,
  });
  
  if (error) throw error
  return (data as number) ?? 0
}
