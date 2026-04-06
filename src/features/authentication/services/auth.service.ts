import { signInWithPassword, signUpWithPassword } from '@/src/lib/supabase/auth';

export const authService = {
  login(email: string, password: string) {
    return signInWithPassword(email, password);
  },
  register(email: string, password: string) {
    return signUpWithPassword(email, password);
  },
};
