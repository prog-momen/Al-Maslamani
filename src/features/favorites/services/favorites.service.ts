import { supabase } from '@/src/lib/supabase/client';

export const favoritesService = {
  async listByUser(userId: string) {
    return supabase.from('favorites').select('*, products(*)').eq('user_id', userId);
  },
  async add(userId: string, productId: string) {
    return supabase.from('favorites').insert({ user_id: userId, product_id: productId });
  },
  async remove(userId: string, productId: string) {
    return supabase.from('favorites').delete().eq('user_id', userId).eq('product_id', productId);
  },
};
