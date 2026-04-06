import { supabase } from '@/src/lib/supabase/client';

export const profileService = {
  async getById(userId: string) {
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },
};
