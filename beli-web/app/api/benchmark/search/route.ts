/**
 * Search Benchmark API Route
 *
 * Compares Elasticsearch vs PostgreSQL (Supabase) search performance.
 * Calls both backends directly and returns timing comparison.
 *
 * Endpoints:
 *   GET /api/benchmark/search?q=pizza&type=fulltext
 *   GET /api/benchmark/search?type=stress  (runs 20 concurrent queries)
 *
 * Query Parameters:
 *   q: Search query
 *   type: Query type - 'autocomplete' | 'fulltext' | 'geo' | 'filtered' | 'stress'
 *   lat/lon: Coordinates for geo queries (default: Times Square)
 *   distance: Distance for geo queries (default: 2km)
 *   cuisine: Cuisine filter (comma-separated)
 *   minRating: Minimum rating filter
 */

import { NextRequest, NextResponse } from 'next/server';

// Import ES functions directly
import {
  searchRestaurants as esSearch,
  autocomplete as esAutocomplete,
  geoSearch as esGeoSearch,
  healthCheck as esHealthCheck,
} from '@/lib/elasticsearch/client';

// Import Supabase functions directly
import {
  searchWithSupabase,
  autocompleteWithSupabase,
  geoSearchWithSupabase,
} from '@/lib/search/supabase-search';

type QueryType = 'autocomplete' | 'fulltext' | 'geo' | 'filtered' | 'stress';

interface BenchmarkResult {
  timing: number;
  resultCount: number;
  results: unknown[];
  error?: string;
}

interface BenchmarkResponse {
  query: string;
  queryType: QueryType;
  timestamp: string;
  elasticsearch: BenchmarkResult;
  supabase: BenchmarkResult;
  winner: 'elasticsearch' | 'supabase' | 'tie' | 'inconclusive';
  speedup: number;
  speedupText: string;
}

interface TypeBreakdown {
  es: { avg: number; count: number };
  pg: { avg: number; count: number };
  winner: 'elasticsearch' | 'supabase' | 'tie';
  speedup: number;
}

interface StressTestResponse {
  queryType: 'stress';
  timestamp: string;
  queriesRun: number;
  elasticsearch: {
    avgTime: number;
    p50: number;
    p95: number;
    p99: number;
    minTime: number;
    maxTime: number;
    failures: number;
  };
  supabase: {
    avgTime: number;
    p50: number;
    p95: number;
    p99: number;
    minTime: number;
    maxTime: number;
    failures: number;
  };
  byType: {
    autocomplete: TypeBreakdown;
    fulltext: TypeBreakdown;
    geo: TypeBreakdown;
    filtered: TypeBreakdown;
  };
  winner: 'elasticsearch' | 'supabase';
  loadAdvantage: string;
}

// Timing wrapper using performance.now() for precision
async function runWithTiming<T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; timing: number; error?: string }> {
  const start = performance.now();
  try {
    const data = await fn();
    const timing = performance.now() - start;
    return { data, timing: Math.round(timing * 100) / 100 };
  } catch (error) {
    const timing = performance.now() - start;
    return {
      data: null,
      timing: Math.round(timing * 100) / 100,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Calculate percentiles from sorted array
function percentile(sorted: number[], p: number): number {
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// NYC locations for geo queries
const NYC_LOCATIONS = {
  timesSquare: { lat: 40.758, lon: -73.9855 },
  empireState: { lat: 40.7484, lon: -73.9857 },
  brooklynHeights: { lat: 40.6959, lon: -73.9938 },
  williamsburg: { lat: 40.7081, lon: -73.9571 },
  upperEastSide: { lat: 40.7736, lon: -73.9566 },
};

// Stress test queries - 32 queries across 4 types (8 each)
// Reduced from 100 to work within Bonsai free tier rate limits
const STRESS_TEST_QUERIES = [
  // ===== AUTOCOMPLETE (8 queries) =====
  { type: 'autocomplete' as const, query: 'pi' },
  { type: 'autocomplete' as const, query: 'su' },
  { type: 'autocomplete' as const, query: 'piz' },
  { type: 'autocomplete' as const, query: 'sus' },
  { type: 'autocomplete' as const, query: 'ital' },
  { type: 'autocomplete' as const, query: 'mex' },
  { type: 'autocomplete' as const, query: 'baltha' },
  { type: 'autocomplete' as const, query: 'taver' },

  // ===== FULLTEXT (8 queries) =====
  { type: 'fulltext' as const, query: 'pizza' },
  { type: 'fulltext' as const, query: 'sushi' },
  { type: 'fulltext' as const, query: 'italian brooklyn' },
  { type: 'fulltext' as const, query: 'mexican food' },
  // Typos (fuzzy matching - ES advantage)
  { type: 'fulltext' as const, query: 'pizzza' },
  { type: 'fulltext' as const, query: 'suhsi' },
  { type: 'fulltext' as const, query: 'itlaian' },
  { type: 'fulltext' as const, query: 'burgir' },

  // ===== GEO (8 queries) =====
  { type: 'geo' as const, query: 'pizza', ...NYC_LOCATIONS.timesSquare, distance: '2km' },
  { type: 'geo' as const, query: 'sushi', ...NYC_LOCATIONS.timesSquare, distance: '2km' },
  { type: 'geo' as const, query: '', ...NYC_LOCATIONS.timesSquare, distance: '2km' },
  { type: 'geo' as const, query: 'ramen', ...NYC_LOCATIONS.empireState, distance: '2km' },
  { type: 'geo' as const, query: '', ...NYC_LOCATIONS.empireState, distance: '2km' },
  { type: 'geo' as const, query: 'pizza', ...NYC_LOCATIONS.brooklynHeights, distance: '2km' },
  { type: 'geo' as const, query: 'tacos', ...NYC_LOCATIONS.williamsburg, distance: '2km' },
  { type: 'geo' as const, query: 'french', ...NYC_LOCATIONS.upperEastSide, distance: '2km' },

  // ===== FILTERED (8 queries) =====
  { type: 'filtered' as const, query: '', cuisine: ['Italian'] },
  { type: 'filtered' as const, query: '', cuisine: ['Japanese'] },
  { type: 'filtered' as const, query: '', cuisine: ['Mexican'] },
  { type: 'filtered' as const, query: '', minRating: 8 },
  { type: 'filtered' as const, query: '', cuisine: ['Italian'], minRating: 7 },
  { type: 'filtered' as const, query: '', cuisine: ['Japanese'], minRating: 8 },
  { type: 'filtered' as const, query: 'pasta', cuisine: ['Italian'], minRating: 7 },
  { type: 'filtered' as const, query: 'ramen', cuisine: ['Japanese'], minRating: 7 },
];

// Helper to compute per-type breakdown
function computeTypeBreakdown(
  esTimings: number[],
  pgTimings: number[]
): TypeBreakdown {
  const esAvg = esTimings.length > 0 ? esTimings.reduce((a, b) => a + b, 0) / esTimings.length : 0;
  const pgAvg = pgTimings.length > 0 ? pgTimings.reduce((a, b) => a + b, 0) / pgTimings.length : 0;

  let winner: 'elasticsearch' | 'supabase' | 'tie' = 'tie';
  let speedup = 1;

  if (esAvg < pgAvg * 0.95) {
    winner = 'elasticsearch';
    speedup = pgAvg / esAvg;
  } else if (pgAvg < esAvg * 0.95) {
    winner = 'supabase';
    speedup = esAvg / pgAvg;
  }

  return {
    es: { avg: Math.round(esAvg * 10) / 10, count: esTimings.length },
    pg: { avg: Math.round(pgAvg * 10) / 10, count: pgTimings.length },
    winner,
    speedup: Math.round(speedup * 10) / 10,
  };
}

// Helper to run a single benchmark query
async function runBenchmarkQuery(q: typeof STRESS_TEST_QUERIES[number]) {
  const distance = 'distance' in q ? q.distance : '2km';

  const [esResult, pgResult] = await Promise.all([
    runWithTiming(async () => {
      switch (q.type) {
        case 'autocomplete':
          return esAutocomplete(q.query, 10);
        case 'geo':
          return esGeoSearch(q.lat!, q.lon!, distance, { query: q.query || undefined, limit: 20 });
        case 'filtered':
          return esSearch({
            query: q.query || '',
            filters: { cuisine: q.cuisine, minRating: q.minRating },
            limit: 20,
          });
        default:
          return esSearch({ query: q.query, limit: 20 });
      }
    }),
    runWithTiming(async () => {
      switch (q.type) {
        case 'autocomplete':
          return autocompleteWithSupabase(q.query, 10);
        case 'geo':
          return geoSearchWithSupabase(q.lat!, q.lon!, distance, {
            query: q.query || undefined,
            limit: 20,
          });
        case 'filtered':
          return searchWithSupabase({
            query: q.query || '',
            filters: { cuisine: q.cuisine, minRating: q.minRating },
            limit: 20,
          });
        default:
          return searchWithSupabase({ query: q.query, limit: 20 });
      }
    }),
  ]);

  return { esResult, pgResult, type: q.type };
}

async function runStressTest(): Promise<StressTestResponse> {
  const esTimings: number[] = [];
  const pgTimings: number[] = [];
  let esFailures = 0;
  let pgFailures = 0;

  // Per-type timing tracking
  const timingsByType: Record<string, { es: number[]; pg: number[] }> = {
    autocomplete: { es: [], pg: [] },
    fulltext: { es: [], pg: [] },
    geo: { es: [], pg: [] },
    filtered: { es: [], pg: [] },
  };

  // Run queries in batches of 4 to avoid overwhelming ES cluster
  // Bonsai free tier has strict rate limits
  const BATCH_SIZE = 4;
  for (let i = 0; i < STRESS_TEST_QUERIES.length; i += BATCH_SIZE) {
    const batch = STRESS_TEST_QUERIES.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(batch.map(runBenchmarkQuery));

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < STRESS_TEST_QUERIES.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Process batch results
    for (const { esResult, pgResult, type } of batchResults) {
      if (esResult.error) esFailures++;
      else {
        esTimings.push(esResult.timing);
        timingsByType[type].es.push(esResult.timing);
      }

      if (pgResult.error) pgFailures++;
      else {
        pgTimings.push(pgResult.timing);
        timingsByType[type].pg.push(pgResult.timing);
      }
    }
  }

  // Sort timings for percentile calculations
  esTimings.sort((a, b) => a - b);
  pgTimings.sort((a, b) => a - b);

  const avgEs = esTimings.length > 0 ? esTimings.reduce((a, b) => a + b, 0) / esTimings.length : 0;
  const avgPg = pgTimings.length > 0 ? pgTimings.reduce((a, b) => a + b, 0) / pgTimings.length : 0;

  const winner = avgEs <= avgPg ? 'elasticsearch' : 'supabase';
  const ratio = avgEs < avgPg ? avgPg / avgEs : avgEs / avgPg;

  // Compute per-type breakdowns
  const byType = {
    autocomplete: computeTypeBreakdown(timingsByType.autocomplete.es, timingsByType.autocomplete.pg),
    fulltext: computeTypeBreakdown(timingsByType.fulltext.es, timingsByType.fulltext.pg),
    geo: computeTypeBreakdown(timingsByType.geo.es, timingsByType.geo.pg),
    filtered: computeTypeBreakdown(timingsByType.filtered.es, timingsByType.filtered.pg),
  };

  return {
    queryType: 'stress',
    timestamp: new Date().toISOString(),
    queriesRun: STRESS_TEST_QUERIES.length,
    elasticsearch: {
      avgTime: Math.round(avgEs * 10) / 10,
      p50: Math.round(percentile(esTimings, 50) * 10) / 10,
      p95: Math.round(percentile(esTimings, 95) * 10) / 10,
      p99: Math.round(percentile(esTimings, 99) * 10) / 10,
      minTime: Math.round(Math.min(...esTimings) * 10) / 10,
      maxTime: Math.round(Math.max(...esTimings) * 10) / 10,
      failures: esFailures,
    },
    supabase: {
      avgTime: Math.round(avgPg * 10) / 10,
      p50: Math.round(percentile(pgTimings, 50) * 10) / 10,
      p95: Math.round(percentile(pgTimings, 95) * 10) / 10,
      p99: Math.round(percentile(pgTimings, 99) * 10) / 10,
      minTime: Math.round(Math.min(...pgTimings) * 10) / 10,
      maxTime: Math.round(Math.max(...pgTimings) * 10) / 10,
      failures: pgFailures,
    },
    byType,
    winner,
    loadAdvantage: `${winner === 'elasticsearch' ? 'ES' : 'PG'} is ${ratio.toFixed(1)}x faster under load`,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get('q') || '';
  const queryType = (searchParams.get('type') || 'fulltext') as QueryType;
  const lat = parseFloat(searchParams.get('lat') || '40.758'); // Default: Times Square
  const lon = parseFloat(searchParams.get('lon') || '-73.9855');
  const distance = searchParams.get('distance') || '2km';
  const cuisineParam = searchParams.get('cuisine');
  const minRatingParam = searchParams.get('minRating');

  // Health check endpoint
  if (searchParams.get('health') === 'true') {
    const esHealth = await esHealthCheck();
    return NextResponse.json({
      elasticsearch: esHealth,
      supabase: { available: true }, // Supabase is always available if app is running
    });
  }

  // Stress test endpoint
  if (queryType === 'stress') {
    const stressResults = await runStressTest();
    return NextResponse.json(stressResults);
  }

  // Build filters
  const filters: { cuisine?: string[]; minRating?: number } = {};
  if (cuisineParam) {
    filters.cuisine = cuisineParam.split(',').map((c) => c.trim());
  }
  if (minRatingParam) {
    filters.minRating = parseFloat(minRatingParam);
  }

  // Run benchmark based on query type
  let esResult: BenchmarkResult;
  let pgResult: BenchmarkResult;

  switch (queryType) {
    case 'autocomplete': {
      const [es, pg] = await Promise.all([
        runWithTiming(() => esAutocomplete(query, 10)),
        runWithTiming(() => autocompleteWithSupabase(query, 10)),
      ]);
      esResult = {
        timing: es.timing,
        resultCount: Array.isArray(es.data) ? es.data.length : 0,
        results: es.data || [],
        error: es.error,
      };
      pgResult = {
        timing: pg.timing,
        resultCount: Array.isArray(pg.data) ? pg.data.length : 0,
        results: pg.data || [],
        error: pg.error,
      };
      break;
    }

    case 'geo': {
      const [es, pg] = await Promise.all([
        runWithTiming(() => esGeoSearch(lat, lon, distance, { query: query || undefined, limit: 20, filters })),
        runWithTiming(() => geoSearchWithSupabase(lat, lon, distance, { query: query || undefined, limit: 20, filters })),
      ]);
      esResult = {
        timing: es.timing,
        resultCount: Array.isArray(es.data) ? es.data.length : 0,
        results: es.data || [],
        error: es.error,
      };
      pgResult = {
        timing: pg.timing,
        resultCount: Array.isArray(pg.data) ? pg.data.length : 0,
        results: pg.data || [],
        error: pg.error,
      };
      break;
    }

    case 'filtered': {
      const [es, pg] = await Promise.all([
        runWithTiming(() => esSearch({ query, filters, limit: 20 })),
        runWithTiming(() => searchWithSupabase({ query, filters, limit: 20 })),
      ]);
      esResult = {
        timing: es.timing,
        resultCount: es.data?.total || 0,
        results: es.data?.results || [],
        error: es.error,
      };
      pgResult = {
        timing: pg.timing,
        resultCount: pg.data?.total || 0,
        results: pg.data?.results || [],
        error: pg.error,
      };
      break;
    }

    default: {
      // fulltext
      const [es, pg] = await Promise.all([
        runWithTiming(() => esSearch({ query, limit: 20 })),
        runWithTiming(() => searchWithSupabase({ query, limit: 20 })),
      ]);
      esResult = {
        timing: es.timing,
        resultCount: es.data?.total || 0,
        results: es.data?.results || [],
        error: es.error,
      };
      pgResult = {
        timing: pg.timing,
        resultCount: pg.data?.total || 0,
        results: pg.data?.results || [],
        error: pg.error,
      };
    }
  }

  // Determine winner
  let winner: 'elasticsearch' | 'supabase' | 'tie' | 'inconclusive' = 'tie';
  let speedup = 1;
  let speedupText = 'Equal performance';

  // Handle errors first
  if (esResult.error && pgResult.error) {
    winner = 'inconclusive';
    speedupText = 'Both backends errored';
  } else if (esResult.error) {
    winner = 'inconclusive';
    speedupText = `ES error: ${esResult.error}`;
  } else if (pgResult.error) {
    winner = 'inconclusive';
    speedupText = `PG error: ${pgResult.error}`;
  } else if (esResult.timing < pgResult.timing * 0.95) {
    winner = 'elasticsearch';
    speedup = pgResult.timing / esResult.timing;
    speedupText = `ES is ${speedup.toFixed(1)}x faster`;
  } else if (pgResult.timing < esResult.timing * 0.95) {
    winner = 'supabase';
    speedup = esResult.timing / pgResult.timing;
    speedupText = `PG is ${speedup.toFixed(1)}x faster`;
  }

  const response: BenchmarkResponse = {
    query,
    queryType,
    timestamp: new Date().toISOString(),
    elasticsearch: esResult,
    supabase: pgResult,
    winner,
    speedup: Math.round(speedup * 10) / 10,
    speedupText,
  };

  return NextResponse.json(response);
}
