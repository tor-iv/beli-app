/**
 * Elasticsearch Client for Beli Web App
 *
 * Provides search functionality with fuzzy matching, autocomplete, and geo-filtering.
 * Uses native fetch to query Elasticsearch directly (no SDK dependency).
 *
 * Usage:
 *   import { searchRestaurants, autocomplete, geoSearch } from '@/lib/elasticsearch/client';
 */

const ES_URL_RAW = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const INDEX_NAME = 'restaurants';

// Parse ES URL to extract credentials for Basic Auth header (Node fetch doesn't allow creds in URL)
function parseESUrl(urlString: string): { baseUrl: string; authHeader: string | null } {
  try {
    const url = new URL(urlString);
    const auth = url.username && url.password
      ? `Basic ${Buffer.from(`${url.username}:${url.password}`).toString('base64')}`
      : null;
    url.username = '';
    url.password = '';
    return { baseUrl: url.toString().replace(/\/$/, ''), authHeader: auth };
  } catch {
    return { baseUrl: urlString, authHeader: null };
  }
}

const { baseUrl: ES_URL, authHeader: ES_AUTH } = parseESUrl(ES_URL_RAW);

/**
 * Helper: Normalize ES 7.x vs 8.x hits.total format
 * ES 7.x can return number directly, ES 8.x returns { value: number, relation: string }
 */
function getTotalHits(total: number | { value: number; relation?: string }): number {
  return typeof total === 'number' ? total : total.value;
}

// Types
export interface SearchResult {
  id: string;
  name: string;
  cuisine: string[];
  neighborhood: string | null;
  city: string | null;
  address: string | null;
  price_range: '$' | '$$' | '$$$' | '$$$$' | null;
  rating: number | null;
  rating_count: number;
  phone: string | null;
  website: string | null;
  location: { lat: number; lon: number } | null;
  created_at: string;
  score: number; // Elasticsearch relevance score
}

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    cuisine?: string[];
    priceRange?: string[];
    neighborhood?: string[];
    minRating?: number;
  };
  location?: {
    lat: number;
    lon: number;
    distance?: string; // e.g., "2km", "5mi"
  };
  fuzziness?: 'AUTO' | '0' | '1' | '2';
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number; // milliseconds
  aggregations?: {
    cuisines: { key: string; doc_count: number }[];
    neighborhoods: { key: string; doc_count: number }[];
    priceRanges: { key: string; doc_count: number }[];
  };
}

// Helper: Make ES request
async function esRequest<T>(
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ES_AUTH) {
    headers['Authorization'] = ES_AUTH;
  }

  const response = await fetch(`${ES_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Elasticsearch error: ${error}`);
  }

  return response.json();
}

/**
 * Full-text search with fuzzy matching and optional filters.
 * Searches name, cuisine, neighborhood, and address fields.
 */
export async function searchRestaurants(
  options: SearchOptions
): Promise<SearchResponse> {
  const { query, limit = 20, offset = 0, filters, location, fuzziness = 'AUTO' } = options;

  // Build the must clauses
  const must: object[] = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'name.autocomplete^2', 'cuisine^1.5', 'neighborhood.text', 'address'],
        type: 'best_fields',
        fuzziness,
        prefix_length: 1, // Require first char to match (reduces false positives)
      },
    });
  }

  // Build filter clauses
  const filter: object[] = [];

  if (filters?.cuisine?.length) {
    filter.push({ terms: { cuisine: filters.cuisine } });
  }

  if (filters?.priceRange?.length) {
    filter.push({ terms: { price_range: filters.priceRange } });
  }

  if (filters?.neighborhood?.length) {
    filter.push({ terms: { neighborhood: filters.neighborhood } });
  }

  if (filters?.minRating) {
    filter.push({ range: { rating: { gte: filters.minRating } } });
  }

  // Geo-distance filter
  if (location) {
    filter.push({
      geo_distance: {
        distance: location.distance || '5km',
        location: { lat: location.lat, lon: location.lon },
      },
    });
  }

  // Build the query
  const esQuery = {
    size: limit,
    from: offset,
    query: {
      bool: {
        must: must.length ? must : [{ match_all: {} }],
        filter: filter.length ? filter : undefined,
      },
    },
    // Add aggregations for faceted search
    aggs: {
      cuisines: {
        terms: { field: 'cuisine', size: 20 },
      },
      neighborhoods: {
        terms: { field: 'neighborhood', size: 30 },
      },
      priceRanges: {
        terms: { field: 'price_range', size: 4 },
      },
    },
    // Sort by relevance score, then rating
    sort: query
      ? ['_score', { rating: { order: 'desc' } }]
      : [{ rating: { order: 'desc' } }],
  };

  interface ESSearchResponse {
    took: number;
    hits: {
      total: number | { value: number; relation?: string }; // ES 7.x returns number, ES 8.x returns object
      hits: Array<{
        _id: string;
        _score: number;
        _source: Omit<SearchResult, 'score'>;
      }>;
    };
    aggregations?: {
      cuisines: { buckets: Array<{ key: string; doc_count: number }> };
      neighborhoods: { buckets: Array<{ key: string; doc_count: number }> };
      priceRanges: { buckets: Array<{ key: string; doc_count: number }> };
    };
  }

  const response = await esRequest<ESSearchResponse>('POST', `/${INDEX_NAME}/_search`, esQuery);

  return {
    results: response.hits.hits.map((hit) => ({
      ...hit._source,
      id: hit._id,
      score: hit._score || 0,
    })),
    total: getTotalHits(response.hits.total),
    took: response.took,
    aggregations: response.aggregations
      ? {
          cuisines: response.aggregations.cuisines.buckets,
          neighborhoods: response.aggregations.neighborhoods.buckets,
          priceRanges: response.aggregations.priceRanges.buckets,
        }
      : undefined,
  };
}

/**
 * Fast autocomplete suggestions using edge n-gram analysis.
 * Returns only name suggestions for quick type-ahead.
 */
export async function autocomplete(
  query: string,
  limit: number = 10
): Promise<{ id: string; name: string; neighborhood: string | null }[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const esQuery = {
    size: limit,
    _source: ['name', 'neighborhood'],
    query: {
      match: {
        'name.autocomplete': {
          query,
          operator: 'and', // All tokens must match
        },
      },
    },
  };

  interface ESAutocompleteResponse {
    hits: {
      hits: Array<{
        _id: string;
        _source: { name: string; neighborhood: string | null };
      }>;
    };
  }

  const response = await esRequest<ESAutocompleteResponse>(
    'POST',
    `/${INDEX_NAME}/_search`,
    esQuery
  );

  return response.hits.hits.map((hit) => ({
    id: hit._id,
    name: hit._source.name,
    neighborhood: hit._source.neighborhood,
  }));
}

/**
 * Geo-filtered search for nearby restaurants.
 * Sorts by distance from the given location.
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
  const { query, limit = 20, filters } = options || {};

  const must: object[] = [];
  const filter: object[] = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'cuisine^1.5', 'neighborhood.text'],
        fuzziness: 'AUTO',
      },
    });
  }

  // Geo filter
  filter.push({
    geo_distance: {
      distance,
      location: { lat, lon },
    },
  });

  // Additional filters
  if (filters?.cuisine?.length) {
    filter.push({ terms: { cuisine: filters.cuisine } });
  }

  if (filters?.minRating) {
    filter.push({ range: { rating: { gte: filters.minRating } } });
  }

  const esQuery = {
    size: limit,
    query: {
      bool: {
        must: must.length ? must : [{ match_all: {} }],
        filter,
      },
    },
    sort: [
      {
        _geo_distance: {
          location: { lat, lon },
          order: 'asc',
          unit: 'km',
        },
      },
    ],
  };

  interface ESGeoResponse {
    hits: {
      hits: Array<{
        _id: string;
        _score: number;
        _source: Omit<SearchResult, 'score'>;
        sort: number[];
      }>;
    };
  }

  const response = await esRequest<ESGeoResponse>('POST', `/${INDEX_NAME}/_search`, esQuery);

  return response.hits.hits.map((hit) => ({
    ...hit._source,
    id: hit._id,
    score: hit.sort[0], // Distance in km
  }));
}

/**
 * Check if Elasticsearch is available and the index exists.
 */
export async function healthCheck(): Promise<{
  available: boolean;
  documentCount: number;
}> {
  try {
    const response = await esRequest<{ count: number }>('GET', `/${INDEX_NAME}/_count`);
    return { available: true, documentCount: response.count };
  } catch {
    return { available: false, documentCount: 0 };
  }
}
