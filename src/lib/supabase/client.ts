import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://acyvvwaxztgwmrsuedcs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_37w8TMP0F1VrBzvL5fMPBQ_cO1hiFg_';

const nativeAuthStorage = {
	getItem: (key: string) => SecureStore.getItemAsync(key),
	setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
	removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// TODO: Replace fallback values with real EXPO_PUBLIC_SUPABASE_* environment variables.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: Platform.OS === 'web' ? undefined : nativeAuthStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

if (Platform.OS !== 'web') {
	AppState.addEventListener('change', (state) => {
		if (state === 'active') {
			supabase.auth.startAutoRefresh();
		} else {
			supabase.auth.stopAutoRefresh();
		}
	});
}
