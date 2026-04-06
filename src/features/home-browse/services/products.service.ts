import { supabase } from '@/src/lib/supabase/client';

export const productsService = {
  async listProducts() {
    return supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
  },
  async listCategories() {
    return supabase.from('categories').select('*').order('name', { ascending: true });
  },
};
