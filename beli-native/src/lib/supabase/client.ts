/**
 * Supabase Client for React Native
 *
 * Configured with AsyncStorage for session persistence.
 * Uses lazy initialization to avoid errors when env vars are missing.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Type for our database
// Using 'any' as a permissive type until proper types are generated from Supabase schema.
// This allows all table operations without TypeScript errors.
// TODO: Generate proper types with `npx supabase gen types typescript`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

// Lazy-initialized client instance
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get environment variable from Expo config
 */
function getEnvVar(key: string): string | undefined {
  return Constants.expoConfig?.extra?.[key] || process.env[key];
}

/**
 * Check if Supabase is configured (env vars present)
 */
export function isSupabaseConfigured(): boolean {
  const url = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  return !!(url && key);
}

/**
 * Get or create the Supabase client instance
 * Uses lazy initialization to avoid errors when env vars are not set
 */
export function getSupabase(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
  const supabaseKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file or app.config.js'
    );
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Important for React Native
    },
    global: {
      headers: {
        'x-platform': Platform.OS,
        'x-app-version': Constants.expoConfig?.version || 'unknown',
      },
    },
  });

  return supabaseInstance;
}

/**
 * Get Supabase client safely (returns null if not configured)
 */
export function getSupabaseSafe(): SupabaseClient<Database> | null {
  try {
    return getSupabase();
  } catch {
    return null;
  }
}

/**
 * Clear the Supabase instance (useful for testing or logout)
 */
export function clearSupabaseInstance(): void {
  supabaseInstance = null;
}

// Export a convenience getter that throws on missing config
// Services should use this via lazy import to avoid startup errors
export const supabase = {
  get client(): SupabaseClient<Database> {
    return getSupabase();
  },
};
