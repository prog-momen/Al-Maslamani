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

    // Mock API for Verify OTP
    async verifyOtp(code: string) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (code === '1234') { // A mock simple valid code
             return { success: true, message: 'Code verified successfully' };
        } else {
             throw new Error('رمز التحقق غير صحيح'); // Invalid code error
        }
    }
};
