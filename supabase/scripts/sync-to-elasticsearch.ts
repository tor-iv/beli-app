/**
 * Sync PostgreSQL Restaurants to Elasticsearch
 *
 * This script:
 * 1. Fetches all restaurants from Supabase (PostgreSQL)
 * 2. Creates/updates the Elasticsearch index with proper mappings
 * 3. Bulk indexes all restaurants
 *
 * Usage:
 *   npx ts-node sync-to-elasticsearch.ts
 *   npx ts-node sync-to-elasticsearch.ts --recreate-index  # Drop and recreate index
 *
 * Environment variables:
 *   POSTGRES_CONNECTION_STR - Supabase PostgreSQL connection string
 *   ELASTICSEARCH_URL - Elasticsearch URL (default: http://localhost:9200)
 */

import { Client } from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration
const POSTGRES_URL = process.env.POSTGRES_CONNECTION_STR;
const ES_URL_RAW = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const INDEX_NAME = 'restaurants';
const RECREATE_INDEX = process.argv.includes('--recreate-index');

// Parse ES URL to extract credentials for Basic Auth header (Node fetch doesn't allow creds in URL)
function parseESUrl(urlString: string): { baseUrl: string; authHeader: string | null } {
  const url = new URL(urlString);
  const auth = url.username && url.password
    ? `Basic ${Buffer.from(`${url.username}:${url.password}`).toString('base64')}`
    : null;
  url.username = '';
  url.password = '';
  return { baseUrl: url.toString().replace(/\/$/, ''), authHeader: auth };
}

const { baseUrl: ES_URL, authHeader: ES_AUTH } = parseESUrl(ES_URL_RAW);

// Elasticsearch index mappings for restaurant search
const INDEX_MAPPINGS = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0, // Local dev, no replicas needed
    analysis: {
      analyzer: {
        // Autocomplete analyzer with edge n-grams
        autocomplete_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'edge_ngram_filter'],
        },
        // Search analyzer (no n-grams, exact matching on tokens)
        autocomplete_search: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase'],
        },
      },
      filter: {
        edge_ngram_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 15,
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete_analyzer',
            search_analyzer: 'autocomplete_search',
          },
          keyword: {
            type: 'keyword', // For exact match and sorting
          },
        },
      },
      cuisine: {
        type: 'keyword', // Array of cuisines for faceted filtering
      },
      neighborhood: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text', // For fuzzy neighborhood search
          },
        },
      },
      city: { type: 'keyword' },
      address: { type: 'text' },
      price_range: { type: 'keyword' }, // $, $$, $$$, $$$$
      rating: { type: 'float' },
      rating_count: { type: 'integer' },
      phone: { type: 'keyword' },
      website: { type: 'keyword' },
      location: { type: 'geo_point' }, // For geo-distance queries
      created_at: { type: 'date' },
    },
  },
};

// Types
interface PostgresRestaurant {
  id: string;
  name: string;
  cuisine: string[] | null; // JSONB array from Postgres
  neighborhood: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  price_range: string | null;
  rating: number | null;
  rating_count: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
}

interface ElasticsearchRestaurant {
  id: string;
  name: string;
  cuisine: string[];
  neighborhood: string | null;
  city: string | null;
  address: string | null;
  price_range: string | null;
  rating: number | null;
  rating_count: number;
  phone: string | null;
  website: string | null;
  location: { lat: number; lon: number } | null;
  created_at: string;
}

// Utility: Make HTTP request to Elasticsearch
async function esRequest(
  method: string,
  path: string,
  body?: object
): Promise<{ status: number; data: unknown }> {
  const url = `${ES_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ES_AUTH) {
    headers['Authorization'] = ES_AUTH;
  }
  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  // HEAD requests don't return a body
  if (method === 'HEAD') {
    return { status: response.status, data: null };
  }

  const data = await response.json();
  return { status: response.status, data };
}

// Transform PostgreSQL row to Elasticsearch document
function transformForES(row: PostgresRestaurant): ElasticsearchRestaurant {
  return {
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
    location:
      row.latitude && row.longitude
        ? { lat: row.latitude, lon: row.longitude }
        : null,
    created_at: row.created_at.toISOString(),
  };
}

// Check if Elasticsearch is available
async function checkESConnection(): Promise<boolean> {
  try {
    const { status, data } = await esRequest('GET', '/');
    console.log('Elasticsearch info:', data);
    return status === 200;
  } catch (error) {
    console.error('Failed to connect to Elasticsearch:', error);
    return false;
  }
}

// Create or recreate the index
async function setupIndex(): Promise<void> {
  // Check if index exists
  const { status: existsStatus } = await esRequest('HEAD', `/${INDEX_NAME}`);
  const indexExists = existsStatus === 200;

  if (indexExists && RECREATE_INDEX) {
    console.log(`Deleting existing index: ${INDEX_NAME}`);
    await esRequest('DELETE', `/${INDEX_NAME}`);
  } else if (indexExists && !RECREATE_INDEX) {
    console.log(`Index ${INDEX_NAME} already exists. Use --recreate-index to rebuild.`);
    return;
  }

  // Create index with mappings
  console.log(`Creating index: ${INDEX_NAME}`);
  const { status, data } = await esRequest('PUT', `/${INDEX_NAME}`, INDEX_MAPPINGS);

  if (status !== 200) {
    throw new Error(`Failed to create index: ${JSON.stringify(data)}`);
  }

  console.log('Index created successfully');
}

// Fetch restaurants from PostgreSQL
async function fetchRestaurantsFromPG(): Promise<PostgresRestaurant[]> {
  console.log('Connecting to PostgreSQL...');

  const client = new Client({ connectionString: POSTGRES_URL });
  await client.connect();

  console.log('Fetching restaurants...');

  const result = await client.query<PostgresRestaurant>(`
    SELECT
      id,
      name,
      cuisine,
      neighborhood,
      address,
      city,
      state,
      phone,
      website,
      price_range,
      rating,
      rating_count,
      ST_Y(coordinates::geometry) as latitude,
      ST_X(coordinates::geometry) as longitude,
      created_at
    FROM public.restaurants
    ORDER BY name
  `);

  await client.end();
  console.log(`Fetched ${result.rows.length} restaurants from PostgreSQL`);

  return result.rows;
}

// Bulk index restaurants into Elasticsearch
async function bulkIndexRestaurants(restaurants: PostgresRestaurant[]): Promise<void> {
  console.log(`Indexing ${restaurants.length} restaurants...`);

  // Build bulk request body
  // Format: action_and_meta_data\n optional_source\n action_and_meta_data\n optional_source\n ...
  const bulkBody: string[] = [];

  for (const restaurant of restaurants) {
    const doc = transformForES(restaurant);

    // Action line
    bulkBody.push(JSON.stringify({ index: { _index: INDEX_NAME, _id: doc.id } }));
    // Document line
    bulkBody.push(JSON.stringify(doc));
  }

  // Bulk API requires trailing newline
  const body = bulkBody.join('\n') + '\n';

  // Use fetch directly for bulk (different content type)
  const headers: Record<string, string> = { 'Content-Type': 'application/x-ndjson' };
  if (ES_AUTH) {
    headers['Authorization'] = ES_AUTH;
  }
  const response = await fetch(`${ES_URL}/_bulk`, {
    method: 'POST',
    headers,
    body,
  });

  const data = (await response.json()) as { errors: boolean; items: { index: { error?: unknown } }[] };

  if (data.errors) {
    const errors = data.items.filter((item) => item.index?.error);
    console.error('Bulk indexing had errors:', errors.slice(0, 5));
    throw new Error(`Bulk indexing failed with ${errors.length} errors`);
  }

  console.log(`Successfully indexed ${restaurants.length} restaurants`);

  // Force refresh so documents are immediately searchable
  await esRequest('POST', `/${INDEX_NAME}/_refresh`);
}

// Verify the indexed data
async function verifyIndex(): Promise<void> {
  // Get document count
  const { data: countData } = await esRequest('GET', `/${INDEX_NAME}/_count`);
  console.log('\nIndex verification:');
  console.log(`- Document count: ${(countData as { count: number }).count}`);

  // Test a search query
  const { data: searchData } = await esRequest('POST', `/${INDEX_NAME}/_search`, {
    size: 3,
    query: {
      match: {
        'name.autocomplete': 'piz',
      },
    },
  });

  const hits = (searchData as { hits: { hits: { _source: { name: string } }[] } }).hits.hits;
  console.log(`- Sample autocomplete search for "piz": ${hits.map((h) => h._source.name).join(', ')}`);

  // Test a geo query (if we have coordinates)
  const { data: geoData } = await esRequest('POST', `/${INDEX_NAME}/_search`, {
    size: 3,
    query: {
      bool: {
        must: { match_all: {} },
        filter: {
          geo_distance: {
            distance: '2km',
            location: { lat: 40.758, lon: -73.9855 }, // Times Square
          },
        },
      },
    },
  });

  const geoHits = (geoData as { hits: { total: { value: number } } }).hits.total.value;
  console.log(`- Restaurants within 2km of Times Square: ${geoHits}`);
}

// Main execution
async function main(): Promise<void> {
  console.log('='.repeat(50));
  console.log('Beli Restaurant Sync: PostgreSQL → Elasticsearch');
  console.log('='.repeat(50));
  console.log(`ES URL: ${ES_URL}`);
  console.log(`Index: ${INDEX_NAME}`);
  console.log(`Recreate index: ${RECREATE_INDEX}`);
  console.log('');

  // Check ES connection
  const esOk = await checkESConnection();
  if (!esOk) {
    console.error('\nElasticsearch is not available. Make sure Docker is running:');
    console.error('  docker compose up -d');
    process.exit(1);
  }

  // Setup index
  await setupIndex();

  // Fetch from PostgreSQL
  const restaurants = await fetchRestaurantsFromPG();

  // Bulk index
  await bulkIndexRestaurants(restaurants);

  // Verify
  await verifyIndex();

  console.log('\n✅ Sync complete!');
}

main().catch((error) => {
  console.error('Sync failed:', error);
  process.exit(1);
});
