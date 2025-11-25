/**
 * Search API Route
 *
 * Provides restaurant search with fuzzy matching, autocomplete, and geo-filtering.
 * Automatically uses Elasticsearch when available, falls back to Supabase.
 *
 * Endpoints:
 *   GET /api/search?q=pizza&limit=20
 *   GET /api/search?q=sushi&lat=40.758&lon=-73.9855&distance=2km
 *   GET /api/search?q=bal&autocomplete=true
 *   GET /api/search?status=true  (returns provider status)
 *
 * Query Parameters:
 *   q: Search query (required)
 *   autocomplete: If "true", returns name suggestions only
 *   status: If "true", returns current search provider status
 *   limit: Max results (default: 20, max: 100)
 *   offset: Pagination offset (default: 0)
 *   cuisine: Filter by cuisine (comma-separated)
 *   priceRange: Filter by price range (comma-separated: $,$$,$$$,$$$$)
 *   neighborhood: Filter by neighborhood (comma-separated)
 *   minRating: Minimum rating (0-10)
 *   lat: Latitude for geo-search
 *   lon: Longitude for geo-search
 *   distance: Distance for geo-search (default: 5km)
 *
 * Environment Variables:
 *   SEARCH_PROVIDER: 'elasticsearch' | 'supabase' | 'auto' (default: 'auto')
 *   ELASTICSEARCH_URL: ES instance URL (Docker, Bonsai, Elastic Cloud)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchRestaurants, autocomplete, geoSearch, getSearchStatus } from '@/lib/search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const query = searchParams.get('q') || '';
  const isAutocomplete = searchParams.get('autocomplete') === 'true';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // Geo parameters
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const distance = searchParams.get('distance') || '5km';

  // Filter parameters
  const cuisineParam = searchParams.get('cuisine');
  const priceRangeParam = searchParams.get('priceRange');
  const neighborhoodParam = searchParams.get('neighborhood');
  const minRatingParam = searchParams.get('minRating');

  try {
    // Autocomplete mode (fast, minimal results)
    if (isAutocomplete) {
      if (query.length < 2) {
        return NextResponse.json({ suggestions: [] });
      }

      const suggestions = await autocomplete(query, limit);
      return NextResponse.json({ suggestions });
    }

    // Build filters
    const filters: {
      cuisine?: string[];
      priceRange?: string[];
      neighborhood?: string[];
      minRating?: number;
    } = {};

    if (cuisineParam) {
      filters.cuisine = cuisineParam.split(',').map((c) => c.trim());
    }

    if (priceRangeParam) {
      filters.priceRange = priceRangeParam.split(',').map((p) => p.trim());
    }

    if (neighborhoodParam) {
      filters.neighborhood = neighborhoodParam.split(',').map((n) => n.trim());
    }

    if (minRatingParam) {
      const minRating = parseFloat(minRatingParam);
      if (!isNaN(minRating) && minRating >= 0 && minRating <= 10) {
        filters.minRating = minRating;
      }
    }

    // Geo-search mode (with coordinates)
    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid coordinates. lat and lon must be numbers.' },
          { status: 400 }
        );
      }

      const results = await geoSearch(latitude, longitude, distance, {
        query: query || undefined,
        limit,
        filters: Object.keys(filters).length ? filters : undefined,
      });

      return NextResponse.json({
        results,
        total: results.length,
        type: 'geo',
        center: { lat: latitude, lon: longitude },
        distance,
      });
    }

    // Standard search mode
    const response = await searchRestaurants({
      query,
      limit,
      offset,
      filters: Object.keys(filters).length ? filters : undefined,
    });

    return NextResponse.json({
      results: response.results,
      total: response.total,
      took: response.took,
      aggregations: response.aggregations,
      type: 'standard',
    });
  } catch (error) {
    console.error('Search API error:', error);

    // Check if it's an Elasticsearch connection error
    if (error instanceof Error && error.message.includes('fetch failed')) {
      return NextResponse.json(
        {
          error: 'Search service unavailable',
          message: 'Elasticsearch is not running. Start it with: docker compose up -d',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
