import { supabase } from '@/src/lib/supabase/client';

export const ordersService = {
  async listByUser(userId: string) {
    return supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false });
  },
};
