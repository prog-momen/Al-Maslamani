import { AppRole } from '@/src/features/orders/services/orders.service';
import { supabase } from '@/src/lib/supabase/client';
import * as WebBrowser from 'expo-web-browser';

let AuthSession: any;
try {
  AuthSession = require('expo-auth-session');
} catch (e) {
  console.warn('AuthSession is not available in this environment');
}

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

    async signUp(credentials: { email: string; password: string; fullName: string; phone: string }) {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    full_name: credentials.fullName,
                    phone: credentials.phone,
                },
            },
        });

        if (error) {
            throw error;
        }

        // Create profile
        if (data.user) {
            const { error: profileError } = await sb.from('profiles').insert({
                id: data.user.id,
                full_name: credentials.fullName,
                phone: credentials.phone,
                role: 'member',
            });

            if (profileError) {
                console.error('Error creating profile:', profileError);
            }
        }

        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
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
        if (!AuthSession) {
          throw new Error('OAuth is not available in this environment. Use a development build.');
        }
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
