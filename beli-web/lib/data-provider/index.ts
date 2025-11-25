/**
 * Data Provider Service
 *
 * Provides automatic fallback between Django, Supabase, and mock data.
 *
 * Environment Variables:
 *   NEXT_PUBLIC_DATA_PROVIDER: 'django' | 'supabase' | 'mock' | 'auto' (default: 'auto')
 *     - 'django': Use Django REST API (localhost:8000 for development)
 *     - 'supabase': Use Supabase SDK (direct client-side queries)
 *     - 'mock': Always use mock data (for demo without database)
 *     - 'auto': Try Django → Supabase → mock in order of availability
 *
 * Usage:
 *   import { withFallback, useMockData } from '@/lib/data-provider';
 *
 *   // Wrap operations with automatic fallback
 *   const { data } = await withFallback(
 *     async () => supabaseQuery(),  // Supabase operation
 *     () => mockRestaurants,         // Mock fallback
 *     {
 *       djangoOperation: async () => djangoClient.get('/restaurants/'),  // Optional Django
 *     }
 *   );
 */

export type DataProviderMode = 'django' | 'supabase' | 'mock' | 'auto';
export type ActiveProvider = 'django' | 'supabase' | 'mock';

// Cache Supabase availability status to avoid repeated health checks
let supabaseAvailabilityCache: { available: boolean; checkedAt: number } | null = null;
const SUPABASE_HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Get the configured data provider mode from environment
 */
export function getDataProviderMode(): DataProviderMode {
  const mode = process.env.NEXT_PUBLIC_DATA_PROVIDER?.toLowerCase() as DataProviderMode;
  if (mode === 'django' || mode === 'supabase' || mode === 'mock') {
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
export async function resolveProvider(): Promise<ActiveProvider> {
  const configured = getDataProviderMode();

  // Explicit provider modes
  if (configured === 'django') {
    return 'django';
  }

  if (configured === 'supabase') {
    return 'supabase';
  }

  if (configured === 'mock') {
    return 'mock';
  }

  // Auto mode: prefer Supabase if available (Django is opt-in only)
  const available = await isSupabaseAvailable();
  return available ? 'supabase' : 'mock';
}

/**
 * Execute an operation with automatic fallback between providers
 *
 * @param supabaseOperation - The Supabase query to try
 * @param mockFallback - The mock data to return as last resort
 * @param options - Optional Django operation and callbacks
 * @returns Object with data and which provider was used
 */
export async function withFallback<T>(
  supabaseOperation: () => Promise<T>,
  mockFallback: () => T | Promise<T>,
  options?: {
    djangoOperation?: () => Promise<T>;
    onFallback?: (error: Error) => void;
    operationName?: string;
  }
): Promise<{ data: T; provider: ActiveProvider }> {
  const provider = await resolveProvider();

  // If configured for mock, skip everything
  if (provider === 'mock') {
    return { data: await mockFallback(), provider: 'mock' };
  }

  // If configured for Django and operation provided
  if (provider === 'django' && options?.djangoOperation) {
    try {
      const data = await options.djangoOperation();
      return { data, provider: 'django' };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(
        `[DataProvider] Django ${options?.operationName || 'operation'} failed, falling back to mock:`,
        errorMsg
      );
      options?.onFallback?.(error instanceof Error ? error : new Error(errorMsg));
      return { data: await mockFallback(), provider: 'mock' };
    }
  }

  // Try Supabase
  try {
    const data = await supabaseOperation();
    return { data, provider: 'supabase' };
  } catch (error) {
    // Supabase failed, update cache and fallback to mock
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(
      `[DataProvider] Supabase ${options?.operationName || 'operation'} failed, falling back to mock:`,
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
  active: ActiveProvider;
  django: {
    url: string;
  };
  supabase: {
    available: boolean;
    url: string | undefined;
  };
}> {
  const configured = getDataProviderMode();
  const supabaseAvailable = await isSupabaseAvailable();
  const active = await resolveProvider();

  return {
    configured,
    active,
    django: {
      url: process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1',
    },
    supabase: {
      available: supabaseAvailable,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  };
}
