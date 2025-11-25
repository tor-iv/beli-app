/**
 * Data Provider Service
 *
 * Provides automatic fallback from Supabase to mock data for offline/demo mode.
 * Adapted from beli-web's data-provider with React Native-specific enhancements.
 *
 * Environment Variables (via Expo):
 *   EXPO_PUBLIC_DATA_PROVIDER: 'supabase' | 'mock' | 'auto' (default: 'auto')
 *     - 'supabase': Always use Supabase (fails if unavailable)
 *     - 'mock': Always use mock data (for demo without database)
 *     - 'auto': Try Supabase, fallback to mock if unavailable or offline
 *
 * Mobile-specific features:
 *   - Network connectivity awareness via NetInfo
 *   - Connection quality-based behavior
 *   - Offline-first support with sync queue integration
 */

import Constants from 'expo-constants';
import { isOnline, getConnectionQuality, ConnectionQuality } from './network-monitor';

export type DataProviderMode = 'supabase' | 'mock' | 'auto';

// Re-export network utilities for convenience
export { isOnline, getConnectionQuality, ConnectionQuality, subscribeToNetworkChanges } from './network-monitor';

// Cache Supabase availability status to avoid repeated health checks
let supabaseAvailabilityCache: { available: boolean; checkedAt: number } | null = null;
const SUPABASE_HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Get environment variables from Expo config
 */
function getEnvVar(key: string): string | undefined {
  return Constants.expoConfig?.extra?.[key] || process.env[key];
}

/**
 * Get the configured data provider mode from environment
 */
export function getDataProviderMode(): DataProviderMode {
  const mode = getEnvVar('EXPO_PUBLIC_DATA_PROVIDER')?.toLowerCase() as DataProviderMode;
  if (mode === 'supabase' || mode === 'mock') {
    return mode;
  }
  return 'auto';
}

/**
 * Check if we should use mock data based on environment config
 * This is a synchronous check that uses the cache and network state
 */
export function useMockData(): boolean {
  const mode = getDataProviderMode();
  if (mode === 'mock') return true;
  if (mode === 'supabase') return false;

  // Auto mode: check network first
  if (!isOnline()) {
    return true; // Use mock/cache when offline
  }

  // Use cache if available
  if (supabaseAvailabilityCache) {
    return !supabaseAvailabilityCache.available;
  }

  return false; // Default to trying Supabase
}

/**
 * Check if Supabase is available (with caching)
 * Performs a lightweight check by verifying env vars and network
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  // Quick network check first
  if (!isOnline()) {
    return false;
  }

  const now = Date.now();

  // Use cached result if fresh
  if (supabaseAvailabilityCache && now - supabaseAvailabilityCache.checkedAt < SUPABASE_HEALTH_CHECK_INTERVAL) {
    return supabaseAvailabilityCache.available;
  }

  try {
    // Check if Supabase env vars are configured
    const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
    const supabaseKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      supabaseAvailabilityCache = { available: false, checkedAt: now };
      return false;
    }

    // Skip health check on poor connections
    const quality = getConnectionQuality();
    if (quality === 'poor') {
      // Assume available on poor connection to allow attempt
      supabaseAvailabilityCache = { available: true, checkedAt: now };
      return true;
    }

    // Try a lightweight health check
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
 * Determine which provider to use based on config, network, and availability
 */
export async function resolveProvider(): Promise<'supabase' | 'mock'> {
  const configured = getDataProviderMode();

  // Explicit mock mode
  if (configured === 'mock') {
    return 'mock';
  }

  // Check network first for auto mode
  if (configured === 'auto' && !isOnline()) {
    return 'mock';
  }

  // Explicit supabase mode (still try even if offline - will fail gracefully)
  if (configured === 'supabase') {
    return 'supabase';
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
    /** Skip Supabase entirely if offline (default: true) */
    offlineFirst?: boolean;
  }
): Promise<{ data: T; provider: 'supabase' | 'mock' }> {
  const { offlineFirst = true, operationName, onFallback } = options || {};

  // Fast path: if offline and offlineFirst, skip network attempt entirely
  if (offlineFirst && !isOnline()) {
    return { data: await mockFallback(), provider: 'mock' };
  }

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
      `[DataProvider] ${operationName || 'Operation'} failed, falling back to mock:`,
      errorMsg
    );

    // Invalidate cache so next request re-checks availability
    supabaseAvailabilityCache = { available: false, checkedAt: Date.now() };

    onFallback?.(error instanceof Error ? error : new Error(errorMsg));

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
  network: {
    isOnline: boolean;
    quality: ConnectionQuality;
  };
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
    network: {
      isOnline: isOnline(),
      quality: getConnectionQuality(),
    },
    supabase: {
      available,
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
    },
  };
}
