import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://acyvvwaxztgwmrsuedcs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_37w8TMP0F1VrBzvL5fMPBQ_cO1hiFg_';

// TODO: Replace fallback values with real EXPO_PUBLIC_SUPABASE_* environment variables.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: Platform.OS === 'web' ? undefined : AsyncStorage,
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
