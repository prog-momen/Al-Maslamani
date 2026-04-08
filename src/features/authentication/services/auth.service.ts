import { supabase } from '@/src/lib/supabase/client';

export const authService = {
    async signIn(credentials: { email: string; password: string }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            throw error;
        }

        return data;
    },

    async signUp(credentials: { email: string; password: string }, fullName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            throw error;
        }

        return data;
    }
};
