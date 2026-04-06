import { supabase } from '@/src/lib/supabase/client';

export const addressesService = {
  async listByUser(userId: string) {
    return supabase.from('addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  },
};
