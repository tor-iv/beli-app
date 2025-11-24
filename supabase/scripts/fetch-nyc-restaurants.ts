/**
 * NYC Open Data Restaurant Fetcher
 *
 * Fetches real NYC restaurant data from the public DOHMH Restaurant Inspections dataset.
 * This is 100% free and legal to use - it's public domain data from NYC.
 *
 * Dataset: https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j
 *
 * Usage:
 *   npx ts-node scripts/fetch-nyc-restaurants.ts
 *   # Or with Bun:
 *   bun run scripts/fetch-nyc-restaurants.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NYC Open Data API endpoint (Socrata API)
const NYC_OPEN_DATA_URL = 'https://data.cityofnewyork.us/resource/43nn-pn8j.json';

// Map NYC inspection cuisine codes to cleaner names
const CUISINE_MAP: Record<string, string[]> = {
  'American': ['American'],
  'Chinese': ['Chinese', 'Asian'],
  'Pizza': ['Pizza', 'Italian'],
  'Mexican': ['Mexican', 'Latin'],
  'Italian': ['Italian'],
  'Japanese': ['Japanese', 'Asian'],
  'Indian': ['Indian', 'Asian'],
  'Thai': ['Thai', 'Asian'],
  'Korean': ['Korean', 'Asian'],
  'French': ['French', 'European'],
  'Spanish': ['Spanish', 'European'],
  'Greek': ['Greek', 'Mediterranean'],
  'Middle Eastern': ['Middle Eastern', 'Mediterranean'],
  'Caribbean': ['Caribbean', 'Latin'],
  'Vietnamese': ['Vietnamese', 'Asian'],
  'Bakery': ['Bakery', 'Cafe'],
  'Café/Coffee/Tea': ['Coffee', 'Cafe'],
  'Ice Cream, Gelato, Yogurt, Ices': ['Dessert', 'Ice Cream'],
  'Bagels/Pretzels': ['Bakery', 'Breakfast'],
  'Delicatessen': ['Deli', 'American'],
  'Hamburgers': ['Burgers', 'American'],
  'Sandwiches': ['Sandwiches', 'American'],
  'Seafood': ['Seafood'],
  'Steakhouse': ['Steakhouse', 'American'],
  'Soul Food': ['Soul Food', 'American'],
  'Vegetarian': ['Vegetarian', 'Healthy'],
  'Tapas': ['Tapas', 'Spanish'],
  'Peruvian': ['Peruvian', 'Latin'],
  'Ethiopian': ['Ethiopian', 'African'],
  'African': ['African'],
  'Jewish/Kosher': ['Kosher', 'Jewish'],
  'Eastern European': ['Eastern European'],
  'German': ['German', 'European'],
  'Irish': ['Irish', 'European'],
  'Russian': ['Russian', 'Eastern European'],
  'Turkish': ['Turkish', 'Mediterranean'],
  'Brazilian': ['Brazilian', 'Latin'],
  'Filipino': ['Filipino', 'Asian'],
  'Indonesian': ['Indonesian', 'Asian'],
  'Malaysian': ['Malaysian', 'Asian'],
  'Bangladeshi': ['Bangladeshi', 'Asian'],
  'Pakistani': ['Pakistani', 'Asian'],
  'Moroccan': ['Moroccan', 'African', 'Mediterranean'],
};

// NYC borough to neighborhood mapping (simplified)
const BOROUGH_NEIGHBORHOODS: Record<string, string[]> = {
  'MANHATTAN': ['Midtown', 'Lower East Side', 'Upper West Side', 'Chelsea', 'SoHo', 'Greenwich Village', 'East Village', 'Harlem', 'Financial District'],
  'BROOKLYN': ['Williamsburg', 'DUMBO', 'Park Slope', 'Bushwick', 'Crown Heights', 'Brooklyn Heights', 'Greenpoint'],
  'QUEENS': ['Astoria', 'Long Island City', 'Flushing', 'Jackson Heights', 'Forest Hills'],
  'BRONX': ['South Bronx', 'Fordham', 'Riverdale', 'Pelham Bay'],
  'STATEN ISLAND': ['St. George', 'Stapleton', 'Tottenville'],
};

interface NYCRestaurantRaw {
  camis: string;           // Unique ID
  dba: string;             // Restaurant name (doing business as)
  boro: string;            // Borough
  building: string;
  street: string;
  zipcode: string;
  phone: string;
  cuisine_description: string;
  grade?: string;          // A, B, C, or N (not graded)
  score?: string;          // Inspection score (lower is better)
  latitude?: string;
  longitude?: string;
}

interface ProcessedRestaurant {
  name: string;
  cuisine: string[];
  category: 'restaurants' | 'coffee_tea' | 'bakeries' | 'bars' | 'dessert';
  price_range: '$' | '$$' | '$$$' | '$$$$';
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  grade: string | null;
  tags: string[];
  rating: number;
  rating_count: number;
}

function mapCuisine(rawCuisine: string): string[] {
  const normalized = rawCuisine.trim();
  return CUISINE_MAP[normalized] || [normalized];
}

function determineCategory(cuisine: string): 'restaurants' | 'coffee_tea' | 'bakeries' | 'bars' | 'dessert' {
  const lower = cuisine.toLowerCase();
  if (lower.includes('café') || lower.includes('coffee') || lower.includes('tea')) return 'coffee_tea';
  if (lower.includes('bakery') || lower.includes('bagel')) return 'bakeries';
  if (lower.includes('bar') && !lower.includes('barbecue')) return 'bars';
  if (lower.includes('ice cream') || lower.includes('dessert') || lower.includes('gelato')) return 'dessert';
  return 'restaurants';
}

function estimatePriceRange(cuisine: string, boro: string): '$' | '$$' | '$$$' | '$$$$' {
  const lower = cuisine.toLowerCase();

  // Fine dining indicators
  if (lower.includes('french') || lower.includes('steakhouse')) return '$$$$';

  // Mid-range
  if (lower.includes('japanese') || lower.includes('italian') || lower.includes('seafood')) return '$$$';

  // Budget-friendly
  if (lower.includes('pizza') || lower.includes('burger') || lower.includes('sandwich') ||
      lower.includes('bagel') || lower.includes('deli')) return '$';

  // Default based on borough
  if (boro === 'MANHATTAN') return '$$$';
  return '$$';
}

function getRandomNeighborhood(boro: string): string {
  // Normalize borough name to uppercase
  const normalizedBoro = boro?.toUpperCase() || 'MANHATTAN';
  const neighborhoods = BOROUGH_NEIGHBORHOODS[normalizedBoro] || [normalizedBoro || 'Midtown'];
  return neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
}

function gradeToRating(grade: string | undefined, score: string | undefined): number {
  // NYC inspection grades: A (best), B, C
  // Score: lower is better (0-13 = A, 14-27 = B, 28+ = C)

  if (grade === 'A') return 8.0 + Math.random() * 1.5; // 8.0 - 9.5
  if (grade === 'B') return 6.5 + Math.random() * 1.5; // 6.5 - 8.0
  if (grade === 'C') return 5.0 + Math.random() * 1.5; // 5.0 - 6.5

  // Use score if no grade
  if (score) {
    const numScore = parseInt(score);
    if (numScore <= 13) return 8.0 + Math.random() * 1.5;
    if (numScore <= 27) return 6.5 + Math.random() * 1.5;
    return 5.0 + Math.random() * 1.5;
  }

  return 7.0 + Math.random() * 1.5; // Default: 7.0 - 8.5
}

function generateTags(cuisine: string, grade: string | undefined, priceRange: string): string[] {
  const tags: string[] = [];

  if (grade === 'A') tags.push('clean', 'highly-rated');
  if (priceRange === '$') tags.push('budget-friendly');
  if (priceRange === '$$$$') tags.push('special-occasion', 'upscale');

  const lower = cuisine.toLowerCase();
  if (lower.includes('vegetarian') || lower.includes('vegan')) tags.push('vegetarian-friendly');
  if (lower.includes('pizza') || lower.includes('burger')) tags.push('casual');
  if (lower.includes('sushi') || lower.includes('japanese')) tags.push('fresh-fish');

  return tags;
}

async function fetchNYCRestaurants(limit: number = 500): Promise<ProcessedRestaurant[]> {
  console.log(`🗽 Fetching ${limit} restaurants from NYC Open Data...`);

  // Query parameters:
  // - $limit: number of records
  // - $where: filter to only include restaurants with coordinates
  // - $select: only get fields we need
  // - $order: order by camis (unique ID) for consistency
  const params = new URLSearchParams({
    '$limit': limit.toString(),
    '$where': 'latitude IS NOT NULL AND longitude IS NOT NULL',
    '$select': 'camis,dba,boro,building,street,zipcode,phone,cuisine_description,grade,score,latitude,longitude',
    '$order': 'camis',
    // Only get unique restaurants (not multiple inspection records)
    '$group': 'camis,dba,boro,building,street,zipcode,phone,cuisine_description,grade,score,latitude,longitude',
  });

  // Note: The $group doesn't work well with Socrata, so we'll dedupe client-side
  const simpleParams = new URLSearchParams({
    '$limit': (limit * 3).toString(), // Fetch more to account for duplicates
    '$where': 'latitude IS NOT NULL AND longitude IS NOT NULL',
    '$order': 'inspection_date DESC', // Get most recent inspection for each restaurant
  });

  const url = `${NYC_OPEN_DATA_URL}?${simpleParams}`;
  console.log(`📡 API URL: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const rawData: NYCRestaurantRaw[] = await response.json() as NYCRestaurantRaw[];
  console.log(`📦 Received ${rawData.length} raw records`);

  // Dedupe by CAMIS (unique restaurant ID)
  const uniqueMap = new Map<string, NYCRestaurantRaw>();
  for (const restaurant of rawData) {
    if (!uniqueMap.has(restaurant.camis)) {
      uniqueMap.set(restaurant.camis, restaurant);
    }
  }

  const uniqueRestaurants = Array.from(uniqueMap.values()).slice(0, limit);
  console.log(`✨ ${uniqueRestaurants.length} unique restaurants after deduplication`);

  // Process and transform
  const processed: ProcessedRestaurant[] = [];

  for (const raw of uniqueRestaurants) {
    // Skip if missing required fields
    if (!raw.dba || !raw.latitude || !raw.longitude) continue;

    const lat = parseFloat(raw.latitude);
    const lng = parseFloat(raw.longitude);

    // Validate coordinates are in NYC area
    if (lat < 40.4 || lat > 41.0 || lng < -74.3 || lng > -73.7) continue;

    const cuisine = mapCuisine(raw.cuisine_description || 'American');
    const priceRange = estimatePriceRange(raw.cuisine_description || '', raw.boro);

    processed.push({
      name: raw.dba.trim(),
      cuisine,
      category: determineCategory(raw.cuisine_description || ''),
      price_range: priceRange,
      address: `${raw.building} ${raw.street}`.trim(),
      city: 'New York',
      state: 'NY',
      neighborhood: getRandomNeighborhood(raw.boro),
      latitude: lat,
      longitude: lng,
      phone: raw.phone || null,
      grade: raw.grade || null,
      tags: generateTags(raw.cuisine_description || '', raw.grade, priceRange),
      rating: Math.round(gradeToRating(raw.grade, raw.score) * 10) / 10,
      rating_count: Math.floor(Math.random() * 500) + 10, // Random count 10-510
    });
  }

  console.log(`✅ Processed ${processed.length} restaurants`);
  return processed;
}

function generateSQL(restaurants: ProcessedRestaurant[]): string {
  const header = `-- NYC Open Data Restaurant Seed
-- Generated: ${new Date().toISOString()}
-- Source: https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results
-- Total restaurants: ${restaurants.length}
--
-- This data is PUBLIC DOMAIN - free to use, modify, and distribute.

-- Clear existing data (optional - comment out if you want to append)
-- TRUNCATE public.restaurants CASCADE;

INSERT INTO public.restaurants (
  name, cuisine, category, price_range,
  address, city, state, neighborhood,
  coordinates,
  phone, tags,
  rating, rating_count,
  rec_score, friend_score, average_score
) VALUES
`;

  const values = restaurants.map((r, i) => {
    // Escape single quotes in strings
    const name = r.name.replace(/'/g, "''");
    const address = r.address.replace(/'/g, "''");
    const neighborhood = r.neighborhood.replace(/'/g, "''");

    // Generate rec/friend scores based on rating with some variance
    const recScore = Math.min(10, Math.max(0, r.rating + (Math.random() - 0.5) * 1.5));
    const friendScore = Math.min(10, Math.max(0, r.rating + (Math.random() - 0.5) * 1.5));

    return `(
  '${name}',
  '${JSON.stringify(r.cuisine)}'::jsonb,
  '${r.category}',
  '${r.price_range}',
  '${address}',
  '${r.city}',
  '${r.state}',
  '${neighborhood}',
  ST_SetSRID(ST_MakePoint(${r.longitude}, ${r.latitude}), 4326)::geography,
  ${r.phone ? `'${r.phone.replace(/'/g, "''")}'` : 'NULL'},
  '${JSON.stringify(r.tags)}'::jsonb,
  ${r.rating.toFixed(1)}, ${r.rating_count},
  ${recScore.toFixed(1)}, ${friendScore.toFixed(1)}, ${r.rating.toFixed(1)}
)`;
  });

  return header + values.join(',\n') + ';\n';
}

async function main() {
  const args = process.argv.slice(2);
  const limit = parseInt(args[0]) || 500;

  console.log('🚀 NYC Open Data Restaurant Fetcher');
  console.log('====================================\n');

  try {
    const restaurants = await fetchNYCRestaurants(limit);

    // Generate SQL
    const sql = generateSQL(restaurants);

    // Write to file
    const outputPath = path.join(__dirname, '..', 'seed-nyc-restaurants.sql');
    fs.writeFileSync(outputPath, sql);
    console.log(`\n📄 SQL file written to: ${outputPath}`);

    // Also write JSON for reference
    const jsonPath = path.join(__dirname, '..', 'data', 'nyc-restaurants.json');
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(restaurants, null, 2));
    console.log(`📄 JSON file written to: ${jsonPath}`);

    // Summary stats
    console.log('\n📊 Summary:');
    console.log(`   Total restaurants: ${restaurants.length}`);

    const categories = restaurants.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('   By category:', categories);

    const priceRanges = restaurants.reduce((acc, r) => {
      acc[r.price_range] = (acc[r.price_range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('   By price:', priceRanges);

    console.log('\n✅ Done! Run the SQL file against your Supabase database.');
    console.log('   Example: psql <your-connection-string> -f supabase/seed-nyc-restaurants.sql');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
