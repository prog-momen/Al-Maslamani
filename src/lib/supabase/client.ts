import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'SUPABASE_ANON_KEY_PLACEHOLDER';

// TODO: Replace fallback values with real EXPO_PUBLIC_SUPABASE_* environment variables.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
