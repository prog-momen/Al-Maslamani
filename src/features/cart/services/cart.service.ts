import { supabase } from '@/src/lib/supabase/client';

export const cartService = {
  async listByUser(userId: string) {
    return supabase.from('cart_items').select('*, products(*)').eq('user_id', userId);
  },
  async upsertItem(userId: string, productId: string, quantity: number) {
    return supabase
      .from('cart_items')
      .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id,product_id' });
  },
  async removeItem(userId: string, productId: string) {
    return supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', productId);
  },
};
