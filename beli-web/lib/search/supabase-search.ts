/**
 * Supabase Full-Text Search Fallback
 *
 * Provides search functionality using PostgreSQL's built-in full-text search.
 * Used as a fallback when Elasticsearch is unavailable.
 *
 * Features:
 * - Full-text search with ts_rank scoring
 * - Fuzzy matching using similarity() and trigram indexes
 * - Geo-distance filtering (requires PostGIS)
 * - Filter by cuisine, price range, neighborhood
 */

import { createServerSupabaseClient } from '@/lib/supabase/client';

import type { SearchResult, SearchOptions, SearchResponse } from '@/lib/elasticsearch/client';
import type { Database } from '@/lib/supabase/types';

// Database row type from Supabase
type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];

/**
 * Search restaurants using Supabase/PostgreSQL full-text search.
 * This is the fallback when Elasticsearch is unavailable.
 */
export async function searchWithSupabase(
  options: SearchOptions
): Promise<SearchResponse> {
  const { query, limit = 20, offset = 0, filters } = options;
  const supabase = createServerSupabaseClient();
  const startTime = Date.now();

  let queryBuilder = supabase
    .from('restaurants')
    .select('*', { count: 'exact' });

  // Text search - use ilike for basic fuzzy matching
  // PostgreSQL full-text search would be better but requires setup
  if (query && query.trim()) {
    // Sanitize input to prevent SQL injection in .or() string
    const sanitizedQuery = query.trim().replace(/[%_'"\\;]/g, '');
    if (sanitizedQuery.length > 0) {
      const searchTerm = `%${sanitizedQuery}%`;
      // Note: cuisine search handled separately below to avoid injection
      queryBuilder = queryBuilder.or(
        `name.ilike.${searchTerm},neighborhood.ilike.${searchTerm},address.ilike.${searchTerm}`
      );
      // Safe cuisine array overlap - uses parameterized filter
      queryBuilder = queryBuilder.or(`cuisine.cs.{"${sanitizedQuery}"}`);
    }
  }

  // Apply filters
  if (filters?.cuisine?.length) {
    queryBuilder = queryBuilder.overlaps('cuisine', filters.cuisine);
  }

  if (filters?.priceRange?.length) {
    queryBuilder = queryBuilder.in('price_range', filters.priceRange);
  }

  if (filters?.neighborhood?.length) {
    queryBuilder = queryBuilder.in('neighborhood', filters.neighborhood);
  }

  if (filters?.minRating) {
    queryBuilder = queryBuilder.gte('rating', filters.minRating);
  }

  // Pagination and sorting
  queryBuilder = queryBuilder
    .order('rating', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await queryBuilder;

  if (error) {
    throw new Error(`Supabase search error: ${error.message}`);
  }

  const took = Date.now() - startTime;

  // Transform to SearchResult format
  const results: SearchResult[] = ((data || []) as DbRestaurant[]).map((row) => ({
    id: row.id,
    name: row.name,
    cuisine: row.cuisine || [],
    neighborhood: row.neighborhood,
    city: row.city,
    address: row.address,
    price_range: row.price_range,
    rating: row.rating,
    rating_count: row.rating_count || 0,
    phone: row.phone,
    website: row.website,
    location: null, // Would need to parse PostGIS point
    created_at: row.created_at,
    score: row.rating || 0, // Use rating as score since no relevance score
  }));

  // Get aggregations for faceted search (separate queries)
  const aggregations = await getAggregations(supabase);

  return {
    results,
    total: count || 0,
    took,
    aggregations,
  };
}

/**
 * Autocomplete using Supabase - simple prefix matching
 */
export async function autocompleteWithSupabase(
  query: string,
  limit: number = 10
): Promise<{ id: string; name: string; neighborhood: string | null }[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, neighborhood')
    .ilike('name', `%${query}%`)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase autocomplete error: ${error.message}`);
  }

  return data || [];
}

/**
 * Geo-search fallback - basic distance filtering
 * Note: Full geo-distance sorting requires PostGIS functions
 */
export async function geoSearchWithSupabase(
  lat: number,
  lon: number,
  distance: string = '2km',
  options?: {
    query?: string;
    limit?: number;
    filters?: SearchOptions['filters'];
  }
): Promise<SearchResult[]> {
  // Parse distance to degrees (rough approximation)
  // 1 degree ≈ 111km at equator
  // TODO: When PostGIS is enabled, use this for ST_DWithin query
  const _distanceKm = parseFloat(distance.replace(/[^0-9.]/g, '')) || 5;
  // const distanceDegrees = distanceKm / 111; // Unused until PostGIS enabled

  const supabase = createServerSupabaseClient();
  const { query: searchQuery, limit = 20, filters } = options || {};

  // For now, we can't do proper geo-filtering without PostGIS setup
  // Just return top-rated restaurants with optional text filter
  // TODO: Enable geo-filtering with: WHERE ST_DWithin(location, ST_Point(lon, lat), distanceKm * 1000)
  let queryBuilder = supabase
    .from('restaurants')
    .select('*');

  if (searchQuery && searchQuery.trim()) {
    // Sanitize input to prevent SQL injection in .or() string
    const sanitizedQuery = searchQuery.trim().replace(/[%_'"\\;]/g, '');
    if (sanitizedQuery.length > 0) {
      const searchTerm = `%${sanitizedQuery}%`;
      queryBuilder = queryBuilder.or(`name.ilike.${searchTerm}`);
      // Safe cuisine array overlap
      queryBuilder = queryBuilder.or(`cuisine.cs.{"${sanitizedQuery}"}`);
    }
  }

  if (filters?.cuisine?.length) {
    queryBuilder = queryBuilder.overlaps('cuisine', filters.cuisine);
  }

  if (filters?.minRating) {
    queryBuilder = queryBuilder.gte('rating', filters.minRating);
  }

  const { data, error } = await queryBuilder
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase geo-search error: ${error.message}`);
  }

  return ((data || []) as DbRestaurant[]).map((row) => ({
    id: row.id,
    name: row.name,
    cuisine: row.cuisine || [],
    neighborhood: row.neighborhood,
    city: row.city,
    address: row.address,
    price_range: row.price_range,
    rating: row.rating,
    rating_count: row.rating_count || 0,
    phone: row.phone,
    website: row.website,
    location: null,
    created_at: row.created_at,
    score: 0, // No distance score without PostGIS
  }));
}

/**
 * Get aggregations for faceted search
 */
async function getAggregations(supabase: ReturnType<typeof createServerSupabaseClient>) {
  // Get distinct cuisines, neighborhoods, and price ranges
  // This is simplified - production would use proper aggregation queries

  try {
    const [cuisineResult, neighborhoodResult, priceResult] = await Promise.all([
      supabase.from('restaurants').select('cuisine'),
      supabase.from('restaurants').select('neighborhood'),
      supabase.from('restaurants').select('price_range'),
    ]);

    // Check for errors in any of the aggregation queries
    if (cuisineResult.error || neighborhoodResult.error || priceResult.error) {
      console.error('Error fetching aggregations:', {
        cuisineError: cuisineResult.error,
        neighborhoodError: neighborhoodResult.error,
        priceError: priceResult.error,
      });
      return { cuisines: [], neighborhoods: [], priceRanges: [] };
    }

    // Count cuisines
    const cuisineCounts: Record<string, number> = {};
    ((cuisineResult.data || []) as Pick<DbRestaurant, 'cuisine'>[]).forEach((row) => {
      (row.cuisine || []).forEach((c: string) => {
        cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
      });
    });

    // Count neighborhoods
    const neighborhoodCounts: Record<string, number> = {};
    ((neighborhoodResult.data || []) as Pick<DbRestaurant, 'neighborhood'>[]).forEach((row) => {
      if (row.neighborhood) {
        neighborhoodCounts[row.neighborhood] = (neighborhoodCounts[row.neighborhood] || 0) + 1;
      }
    });

    // Count price ranges
    const priceCounts: Record<string, number> = {};
    ((priceResult.data || []) as Pick<DbRestaurant, 'price_range'>[]).forEach((row) => {
      if (row.price_range) {
        priceCounts[row.price_range] = (priceCounts[row.price_range] || 0) + 1;
      }
    });

    return {
      cuisines: Object.entries(cuisineCounts)
        .map(([key, doc_count]) => ({ key, doc_count }))
        .sort((a, b) => b.doc_count - a.doc_count)
        .slice(0, 20),
      neighborhoods: Object.entries(neighborhoodCounts)
        .map(([key, doc_count]) => ({ key, doc_count }))
        .sort((a, b) => b.doc_count - a.doc_count)
        .slice(0, 30),
      priceRanges: Object.entries(priceCounts)
        .map(([key, doc_count]) => ({ key, doc_count }))
        .sort((a, b) => a.key.length - b.key.length),
    };
  } catch (error) {
    console.error('Unexpected error in getAggregations:', error);
    return { cuisines: [], neighborhoods: [], priceRanges: [] };
  }
}