/**
 * Supabase Client for Beli Web App
 *
 * Creates a Supabase client for querying PostgreSQL data.
 * Uses environment variables for configuration.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase/client';
 *   const { data, error } = await supabase.from('restaurants').select('*');
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

/**
 * Supabase client instance for browser/client-side usage.
 * Uses the anon key for public access with RLS.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Server-side Supabase client factory.
 * Use this in Server Components and API routes.
 */
export function createServerSupabaseClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
    },
  });
}
