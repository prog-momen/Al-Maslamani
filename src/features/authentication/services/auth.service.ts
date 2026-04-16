import { AppRole } from '@/src/features/orders/services/orders.service';
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
    },

    async forgotPassword(emailOrPhone: string) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(emailOrPhone);
        
        if (error) {
            throw error;
        }
        
        return { success: true, message: 'Password reset link sent' };
    },

    async verifyOtp(email: string, code: string) {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'recovery',
        });
        
        if (error) {
            throw error;
        }
        
        return { success: true, message: 'Code verified successfully', data };
    },

    async getUserRole(userId: string): Promise<AppRole> {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data?.role ?? 'member';
    },
};
