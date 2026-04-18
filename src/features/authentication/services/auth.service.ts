import { AppRole } from '@/src/features/orders/services/orders.service';
import { supabase } from '@/src/lib/supabase/client';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const sb = supabase as any;

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
        const { data, error } = await sb
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data?.role ?? 'member';
    },

    async signInWithOAuth(provider: 'google' | 'apple') {
        const redirectUrl = AuthSession.makeRedirectUri();
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
            },
        });

        if (error) throw error;
        
        if (data?.url) {
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type === 'success' && result.url) {
                // Extract params from URL hash (Expo/Supabase redirect format)
                const urlParts = result.url.split('#');
                if (urlParts.length > 1) {
                    const params: Record<string, string> = {};
                    urlParts[1].split('&').forEach(part => {
                        const [key, value] = part.split('=');
                        params[key] = value;
                    });

                    if (params.access_token && params.refresh_token) {
                        await supabase.auth.setSession({
                            access_token: params.access_token,
                            refresh_token: params.refresh_token,
                        });

                        // --- ENSURE PROFILE EXISTS ---
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            const { data: profile } = await sb
                                .from('profiles')
                                .select('id')
                                .eq('id', user.id)
                                .maybeSingle();

                            if (!profile) {
                                // Create default profile if it doesn't exist (OAuth first time)
                                await sb.from('profiles').insert({
                                    id: user.id,
                                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                                    role: 'member'
                                });
                            }
                        }
                        // -----------------------------

                        return { success: true };
                    }
                }
            }
        }
        
        return { success: false };
    },
};
