/**
 * Data Provider Service
 *
 * Provides automatic fallback from Supabase to mock data for demo mode.
 * Mirrors the pattern used in lib/search/index.ts for search provider fallback.
 *
 * Environment Variables:
 *   NEXT_PUBLIC_DATA_PROVIDER: 'supabase' | 'mock' | 'auto' (default: 'auto')
 *     - 'supabase': Always use Supabase (fails if unavailable)
 *     - 'mock': Always use mock data (for demo without database)
 *     - 'auto': Try Supabase, fallback to mock if unavailable
 *
 * Usage:
 *   import { withFallback, useMockData } from '@/lib/data-provider';
 *
 *   // Wrap Supabase operations with mock fallback
 *   const { data } = await withFallback(
 *     async () => {
 *       const { data, error } = await supabase.from('restaurants').select('*');
 *       if (error) throw error;
 *       return data;
 *     },
 *     () => mockRestaurants
 *   );
 */

export type DataProviderMode = 'supabase' | 'mock' | 'auto';

// Cache Supabase availability status to avoid repeated health checks
let supabaseAvailabilityCache: { available: boolean; checkedAt: number } | null = null;
const SUPABASE_HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Get the configured data provider mode from environment
 */
export function getDataProviderMode(): DataProviderMode {
  const mode = process.env.NEXT_PUBLIC_DATA_PROVIDER?.toLowerCase() as DataProviderMode;
  if (mode === 'supabase' || mode === 'mock') {
    return mode;
  }
  return 'auto';
}

/**
 * Check if we should use mock data based on environment config
 * This is a synchronous check that uses the cache
 */
export function useMockData(): boolean {
  const mode = getDataProviderMode();
  if (mode === 'mock') return true;
  if (mode === 'supabase') return false;
  // Auto mode: use cache if available
  if (supabaseAvailabilityCache) {
    return !supabaseAvailabilityCache.available;
  }
  return false; // Default to trying Supabase
}

/**
 * Check if Supabase is available (with caching)
 * Performs a lightweight check by verifying env vars are set
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if fresh
  if (supabaseAvailabilityCache && now - supabaseAvailabilityCache.checkedAt < SUPABASE_HEALTH_CHECK_INTERVAL) {
    return supabaseAvailabilityCache.available;
  }

  try {
    // Check if Supabase env vars are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      supabaseAvailabilityCache = { available: false, checkedAt: now };
      return false;
    }

    // Try a lightweight health check - just verify the URL is reachable
    // We don't want to import supabase client here to avoid the throw on missing env
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
      },
    });

    const available = response.ok;
    supabaseAvailabilityCache = { available, checkedAt: now };
    return available;
  } catch {
    supabaseAvailabilityCache = { available: false, checkedAt: now };
    return false;
  }
}

/**
 * Determine which provider to use based on config and availability
 */
export async function resolveProvider(): Promise<'supabase' | 'mock'> {
  const configured = getDataProviderMode();

  if (configured === 'supabase') {
    return 'supabase';
  }

  if (configured === 'mock') {
    return 'mock';
  }

  // Auto mode: prefer Supabase if available
  const available = await isSupabaseAvailable();
  return available ? 'supabase' : 'mock';
}

/**
 * Execute an operation with automatic fallback to mock data
 *
 * @param supabaseOperation - The Supabase query to try first
 * @param mockFallback - The mock data to return if Supabase fails
 * @param options - Optional callbacks for logging/monitoring
 * @returns Object with data and which provider was used
 */
export async function withFallback<T>(
  supabaseOperation: () => Promise<T>,
  mockFallback: () => T | Promise<T>,
  options?: {
    onFallback?: (error: Error) => void;
    operationName?: string;
  }
): Promise<{ data: T; provider: 'supabase' | 'mock' }> {
  const provider = await resolveProvider();

  // If configured for mock, skip Supabase entirely
  if (provider === 'mock') {
    return { data: await mockFallback(), provider: 'mock' };
  }

  // Try Supabase first
  try {
    const data = await supabaseOperation();
    return { data, provider: 'supabase' };
  } catch (error) {
    // Supabase failed, update cache and fallback to mock
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(
      `[DataProvider] ${options?.operationName || 'Operation'} failed, falling back to mock:`,
      errorMsg
    );

    // Invalidate cache so next request re-checks availability
    supabaseAvailabilityCache = { available: false, checkedAt: Date.now() };

    options?.onFallback?.(error instanceof Error ? error : new Error(errorMsg));

    return { data: await mockFallback(), provider: 'mock' };
  }
}

/**
 * Force refresh Supabase availability cache
 */
export function invalidateDataProviderCache(): void {
  supabaseAvailabilityCache = null;
}

/**
 * Get current data provider status (useful for debugging)
 */
export async function getDataProviderStatus(): Promise<{
  configured: DataProviderMode;
  active: 'supabase' | 'mock';
  supabase: {
    available: boolean;
    url: string | undefined;
  };
}> {
  const configured = getDataProviderMode();
  const available = await isSupabaseAvailable();
  const active = await resolveProvider();

  return {
    configured,
    active,
    supabase: {
      available,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  };
}
