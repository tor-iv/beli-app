/**
 * Unified Search Service
 *
 * Provides a single interface for search that automatically:
 * 1. Uses Elasticsearch when available (production or Docker)
 * 2. Falls back to Supabase full-text search when ES is unavailable
 * 3. Supports easy toggling via SEARCH_PROVIDER env var
 *
 * Environment Variables:
 *   SEARCH_PROVIDER: 'elasticsearch' | 'supabase' | 'auto' (default: 'auto')
 *   ELASTICSEARCH_URL: URL to Elasticsearch (local Docker or cloud)
 *   ELASTICSEARCH_API_KEY: API key for Elastic Cloud (optional)
 *
 * Cloud Provider Examples:
 *   Elastic Cloud: https://<id>.es.<region>.cloud.es.io:9243
 *   Bonsai.io: https://user:pass@cluster.us-east-1.bonsaisearch.net:443
 *   Local Docker: http://localhost:9200
 */

import type { SearchResult, SearchOptions, SearchResponse } from '@/lib/elasticsearch/client';
import {
  searchRestaurants as esSearch,
  autocomplete as esAutocomplete,
  geoSearch as esGeoSearch,
  healthCheck as esHealthCheck,
} from '@/lib/elasticsearch/client';
import {
  searchWithSupabase,
  autocompleteWithSupabase,
  geoSearchWithSupabase,
} from './supabase-search';

export type { SearchResult, SearchOptions, SearchResponse };

type SearchProvider = 'elasticsearch' | 'supabase' | 'auto';

// Cache ES availability status to avoid repeated health checks
let esAvailabilityCache: { available: boolean; checkedAt: number } | null = null;
const ES_HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Get the configured search provider
 */
function getSearchProvider(): SearchProvider {
  const provider = process.env.SEARCH_PROVIDER?.toLowerCase() as SearchProvider;
  if (provider === 'elasticsearch' || provider === 'supabase') {
    return provider;
  }
  return 'auto';
}

/**
 * Check if Elasticsearch is available (with caching)
 */
async function isElasticsearchAvailable(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if fresh
  if (esAvailabilityCache && now - esAvailabilityCache.checkedAt < ES_HEALTH_CHECK_INTERVAL) {
    return esAvailabilityCache.available;
  }

  try {
    const health = await esHealthCheck();
    esAvailabilityCache = { available: health.available, checkedAt: now };
    return health.available;
  } catch {
    esAvailabilityCache = { available: false, checkedAt: now };
    return false;
  }
}

/**
 * Determine which provider to use based on config and availability
 */
async function resolveProvider(): Promise<'elasticsearch' | 'supabase'> {
  const configured = getSearchProvider();

  if (configured === 'elasticsearch') {
    return 'elasticsearch';
  }

  if (configured === 'supabase') {
    return 'supabase';
  }

  // Auto mode: prefer ES if available
  const esAvailable = await isElasticsearchAvailable();
  return esAvailable ? 'elasticsearch' : 'supabase';
}

/**
 * Search restaurants with automatic provider selection
 */
export async function searchRestaurants(
  options: SearchOptions
): Promise<SearchResponse & { provider: string }> {
  const provider = await resolveProvider();

  try {
    if (provider === 'elasticsearch') {
      const result = await esSearch(options);
      return { ...result, provider: 'elasticsearch' };
    }
  } catch (error) {
    // ES failed, try Supabase fallback
    console.warn('Elasticsearch search failed, falling back to Supabase:', error);
    esAvailabilityCache = { available: false, checkedAt: Date.now() };
  }

  const result = await searchWithSupabase(options);
  return { ...result, provider: 'supabase' };
}

/**
 * Autocomplete with automatic provider selection
 */
export async function autocomplete(
  query: string,
  limit: number = 10
): Promise<{ id: string; name: string; neighborhood: string | null }[]> {
  const provider = await resolveProvider();

  try {
    if (provider === 'elasticsearch') {
      return await esAutocomplete(query, limit);
    }
  } catch (error) {
    console.warn('Elasticsearch autocomplete failed, falling back to Supabase:', error);
    esAvailabilityCache = { available: false, checkedAt: Date.now() };
  }

  return autocompleteWithSupabase(query, limit);
}

/**
 * Geo-search with automatic provider selection
 */
export async function geoSearch(
  lat: number,
  lon: number,
  distance: string = '2km',
  options?: {
    query?: string;
    limit?: number;
    filters?: SearchOptions['filters'];
  }
): Promise<SearchResult[]> {
  const provider = await resolveProvider();

  try {
    if (provider === 'elasticsearch') {
      return await esGeoSearch(lat, lon, distance, options);
    }
  } catch (error) {
    console.warn('Elasticsearch geo-search failed, falling back to Supabase:', error);
    esAvailabilityCache = { available: false, checkedAt: Date.now() };
  }

  return geoSearchWithSupabase(lat, lon, distance, options);
}

/**
 * Get current search provider status
 */
export async function getSearchStatus(): Promise<{
  configured: SearchProvider;
  active: 'elasticsearch' | 'supabase';
  elasticsearch: {
    available: boolean;
    url: string;
    documentCount: number;
  };
}> {
  const configured = getSearchProvider();
  let esAvailable = false;
  let docCount = 0;

  try {
    const health = await esHealthCheck();
    esAvailable = health.available;
    docCount = health.documentCount;
  } catch {
    esAvailable = false;
  }

  return {
    configured,
    active: configured === 'supabase' ? 'supabase' : esAvailable ? 'elasticsearch' : 'supabase',
    elasticsearch: {
      available: esAvailable,
      url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      documentCount: docCount,
    },
  };
}

/**
 * Force refresh ES availability cache
 */
export function invalidateSearchCache(): void {
  esAvailabilityCache = null;
}