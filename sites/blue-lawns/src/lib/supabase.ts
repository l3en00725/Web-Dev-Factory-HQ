import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
export function createSupabaseClient() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

