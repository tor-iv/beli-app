/**
 * Restaurant Seeder for Beli
 *
 * Seeds the Supabase database with NYC restaurant data.
 * Can pull from:
 * 1. NYC Open Data (free, public domain) - basic restaurant info
 * 2. Foursquare Places API (optional) - enriches with photos, hours, tips
 *
 * Usage:
 *   # Basic seeding from NYC Open Data
 *   npx ts-node seed-restaurants.ts
 *
 *   # With custom limit
 *   npx ts-node seed-restaurants.ts --limit 100
 *
 *   # Enrich with Foursquare (requires FOURSQUARE_API_KEY env var)
 *   FOURSQUARE_API_KEY=your_key npx ts-node seed-restaurants.ts --enrich
 *
 *   # Clear existing data first
 *   npx ts-node seed-restaurants.ts --clear
 */

import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../beli-web/.env.local') });

const { Pool } = pg;

// ============================================================================
// Configuration
// ============================================================================

const NYC_OPEN_DATA_URL = 'https://data.cityofnewyork.us/resource/43nn-pn8j.json';
const FOURSQUARE_API_URL = 'https://api.foursquare.com/v3/places';

// Cuisine mapping from NYC inspection codes to cleaner names
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
  'Coffee/Tea': ['Coffee', 'Cafe'],
  'Ice Cream, Gelato, Yogurt, Ices': ['Dessert', 'Ice Cream'],
  'Bagels/Pretzels': ['Bakery', 'Breakfast'],
  'Delicatessen': ['Deli', 'American'],
  'Hamburgers': ['Burgers', 'American'],
  'Sandwiches': ['Sandwiches', 'American'],
  'Sandwiches/Salads/Mixed Buffet': ['Sandwiches', 'Salads'],
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
  'Juice, Smoothies, Fruit Salads': ['Juice', 'Healthy'],
  'Donuts': ['Donuts', 'Bakery'],
  'Chicken': ['Chicken', 'American'],
  'Latin (Cuban, Dominican, Puerto Rican, South & Central American)': ['Latin', 'Caribbean'],
  'Tex-Mex': ['Tex-Mex', 'Mexican'],
  'Asian': ['Asian'],
  'Asian/Asian Fusion': ['Asian Fusion', 'Asian'],
};

// Borough to neighborhood mapping
const NEIGHBORHOOD_MAP: Record<string, Record<string, string>> = {
  'MANHATTAN': {
    '10001': 'Chelsea', '10002': 'Lower East Side', '10003': 'East Village',
    '10004': 'Financial District', '10005': 'Financial District', '10006': 'Financial District',
    '10007': 'Tribeca', '10008': 'Financial District', '10009': 'East Village',
    '10010': 'Gramercy', '10011': 'Chelsea', '10012': 'SoHo',
    '10013': 'Tribeca', '10014': 'West Village', '10016': 'Murray Hill',
    '10017': 'Midtown East', '10018': 'Midtown', '10019': 'Midtown West',
    '10020': 'Midtown', '10021': 'Upper East Side', '10022': 'Midtown East',
    '10023': 'Upper West Side', '10024': 'Upper West Side', '10025': 'Upper West Side',
    '10026': 'Harlem', '10027': 'Harlem', '10028': 'Upper East Side',
    '10029': 'East Harlem', '10030': 'Harlem', '10031': 'Hamilton Heights',
    '10032': 'Washington Heights', '10033': 'Washington Heights', '10034': 'Inwood',
    '10035': 'East Harlem', '10036': 'Times Square', '10037': 'Harlem',
    '10038': 'Financial District', '10039': 'Harlem', '10040': 'Washington Heights',
    '10044': 'Roosevelt Island', '10065': 'Upper East Side', '10069': 'Upper West Side',
    '10075': 'Upper East Side', '10128': 'Upper East Side', '10280': 'Battery Park City',
  },
  'BROOKLYN': {
    '11201': 'Brooklyn Heights', '11205': 'Clinton Hill', '11206': 'Bushwick',
    '11207': 'East New York', '11208': 'East New York', '11209': 'Bay Ridge',
    '11210': 'Flatbush', '11211': 'Williamsburg', '11212': 'Brownsville',
    '11213': 'Crown Heights', '11214': 'Bensonhurst', '11215': 'Park Slope',
    '11216': 'Bedford-Stuyvesant', '11217': 'Boerum Hill', '11218': 'Kensington',
    '11219': 'Borough Park', '11220': 'Sunset Park', '11221': 'Bushwick',
    '11222': 'Greenpoint', '11223': 'Gravesend', '11224': 'Coney Island',
    '11225': 'Crown Heights', '11226': 'Flatbush', '11228': 'Dyker Heights',
    '11229': 'Sheepshead Bay', '11230': 'Midwood', '11231': 'Carroll Gardens',
    '11232': 'Sunset Park', '11233': 'Bedford-Stuyvesant', '11234': 'Canarsie',
    '11235': 'Brighton Beach', '11236': 'Canarsie', '11237': 'Bushwick',
    '11238': 'Prospect Heights', '11239': 'East New York', '11249': 'Williamsburg',
  },
  'QUEENS': {
    '11101': 'Long Island City', '11102': 'Astoria', '11103': 'Astoria',
    '11104': 'Sunnyside', '11105': 'Astoria', '11106': 'Astoria',
    '11354': 'Flushing', '11355': 'Flushing', '11356': 'College Point',
    '11357': 'Whitestone', '11358': 'Flushing', '11360': 'Bayside',
    '11361': 'Bayside', '11362': 'Little Neck', '11363': 'Douglaston',
    '11364': 'Oakland Gardens', '11365': 'Fresh Meadows', '11366': 'Fresh Meadows',
    '11367': 'Kew Gardens Hills', '11368': 'Corona', '11369': 'East Elmhurst',
    '11370': 'East Elmhurst', '11372': 'Jackson Heights', '11373': 'Elmhurst',
    '11374': 'Rego Park', '11375': 'Forest Hills', '11377': 'Woodside',
    '11378': 'Maspeth', '11379': 'Middle Village', '11385': 'Ridgewood',
    '11411': 'Cambria Heights', '11412': 'St. Albans', '11413': 'Springfield Gardens',
    '11414': 'Howard Beach', '11415': 'Kew Gardens', '11416': 'Ozone Park',
    '11417': 'Ozone Park', '11418': 'Richmond Hill', '11419': 'South Richmond Hill',
    '11420': 'South Ozone Park', '11421': 'Woodhaven', '11422': 'Rosedale',
    '11423': 'Hollis', '11426': 'Bellerose', '11427': 'Queens Village',
    '11428': 'Queens Village', '11429': 'Queens Village', '11430': 'JFK Airport',
    '11432': 'Jamaica', '11433': 'Jamaica', '11434': 'Jamaica',
    '11435': 'Jamaica', '11436': 'Jamaica',
  },
  'BRONX': {
    '10451': 'South Bronx', '10452': 'Highbridge', '10453': 'Morris Heights',
    '10454': 'Mott Haven', '10455': 'Longwood', '10456': 'Morrisania',
    '10457': 'Tremont', '10458': 'Belmont', '10459': 'Hunts Point',
    '10460': 'West Farms', '10461': 'Morris Park', '10462': 'Parkchester',
    '10463': 'Kingsbridge', '10464': 'City Island', '10465': 'Throgs Neck',
    '10466': 'Wakefield', '10467': 'Norwood', '10468': 'Fordham',
    '10469': 'Eastchester', '10470': 'Wakefield', '10471': 'Riverdale',
    '10472': 'Soundview', '10473': 'Clason Point', '10474': 'Hunts Point',
    '10475': 'Co-op City',
  },
  'STATEN ISLAND': {
    '10301': 'St. George', '10302': 'Port Richmond', '10303': 'Mariners Harbor',
    '10304': 'Stapleton', '10305': 'Rosebank', '10306': 'New Dorp',
    '10307': 'Tottenville', '10308': 'Great Kills', '10309': 'Charleston',
    '10310': 'West Brighton', '10312': 'Eltingville', '10314': 'Bulls Head',
  },
};

// ============================================================================
// Types
// ============================================================================

interface NYCRestaurantRaw {
  camis: string;
  dba: string;
  boro: string;
  building: string;
  street: string;
  zipcode: string;
  phone: string;
  cuisine_description: string;
  grade?: string;
  score?: string;
  latitude?: string;
  longitude?: string;
}

interface FoursquarePlace {
  fsq_id: string;
  name: string;
  location: {
    formatted_address?: string;
  };
  hours?: {
    regular?: Array<{
      day: number;
      open: string;
      close: string;
    }>;
  };
  photos?: Array<{
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
  website?: string;
  tips?: Array<{
    text: string;
  }>;
  rating?: number;
  popularity?: number;
}

interface RestaurantInsert {
  name: string;
  cuisine: string[];
  category: 'restaurants' | 'coffee_tea' | 'bars' | 'bakeries';
  price_range: '$' | '$$' | '$$$' | '$$$$';
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  tags: string[];
  images: string[];
  hours: Record<string, string>;
  popular_dishes: string[];
  rating: number;
  rating_count: number;
  accepts_reservations: boolean;
  is_open: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapCuisine(rawCuisine: string): string[] {
  const normalized = rawCuisine?.trim() || 'American';
  return CUISINE_MAP[normalized] || [normalized];
}

function determineCategory(cuisine: string): 'restaurants' | 'coffee_tea' | 'bakeries' | 'bars' {
  const lower = (cuisine || '').toLowerCase();
  if (lower.includes('café') || lower.includes('coffee') || lower.includes('tea')) return 'coffee_tea';
  if (lower.includes('bakery') || lower.includes('bagel') || lower.includes('donut')) return 'bakeries';
  if (lower.includes('bar') && !lower.includes('barbecue')) return 'bars';
  return 'restaurants';
}

function estimatePriceRange(cuisine: string, boro: string): '$' | '$$' | '$$$' | '$$$$' {
  const lower = (cuisine || '').toLowerCase();

  if (lower.includes('french') || lower.includes('steakhouse')) return '$$$$';
  if (lower.includes('japanese') || lower.includes('italian') || lower.includes('seafood')) return '$$$';
  if (lower.includes('pizza') || lower.includes('burger') || lower.includes('sandwich') ||
      lower.includes('bagel') || lower.includes('deli') || lower.includes('chicken')) return '$';

  if (boro === 'MANHATTAN') return '$$$';
  return '$$';
}

function getNeighborhood(boro: string, zipcode: string): string {
  const normalizedBoro = boro?.toUpperCase() || 'MANHATTAN';
  const boroNeighborhoods = NEIGHBORHOOD_MAP[normalizedBoro];

  if (boroNeighborhoods && zipcode && boroNeighborhoods[zipcode]) {
    return boroNeighborhoods[zipcode];
  }

  // Fallback to borough name
  const boroNames: Record<string, string> = {
    'MANHATTAN': 'Manhattan',
    'BROOKLYN': 'Brooklyn',
    'QUEENS': 'Queens',
    'BRONX': 'Bronx',
    'STATEN ISLAND': 'Staten Island',
  };
  return boroNames[normalizedBoro] || 'Manhattan';
}

function gradeToRating(grade?: string, score?: string): number {
  if (grade === 'A') return 8.0 + Math.random() * 1.5;
  if (grade === 'B') return 6.5 + Math.random() * 1.5;
  if (grade === 'C') return 5.0 + Math.random() * 1.5;

  if (score) {
    const numScore = parseInt(score);
    if (numScore <= 13) return 8.0 + Math.random() * 1.5;
    if (numScore <= 27) return 6.5 + Math.random() * 1.5;
    return 5.0 + Math.random() * 1.5;
  }

  return 7.0 + Math.random() * 1.5;
}

function generateTags(cuisine: string, grade?: string, priceRange?: string): string[] {
  const tags: string[] = [];

  if (grade === 'A') tags.push('clean', 'highly-rated');
  if (priceRange === '$') tags.push('budget-friendly');
  if (priceRange === '$$$$') tags.push('special-occasion', 'upscale');

  const lower = (cuisine || '').toLowerCase();
  if (lower.includes('vegetarian') || lower.includes('vegan')) tags.push('vegetarian-friendly');
  if (lower.includes('pizza') || lower.includes('burger')) tags.push('casual');
  if (lower.includes('sushi') || lower.includes('japanese')) tags.push('fresh-fish');
  if (lower.includes('coffee') || lower.includes('café')) tags.push('good-for-work');

  return tags;
}

function generateDefaultHours(): Record<string, string> {
  return {
    monday: '11:00 AM - 10:00 PM',
    tuesday: '11:00 AM - 10:00 PM',
    wednesday: '11:00 AM - 10:00 PM',
    thursday: '11:00 AM - 10:00 PM',
    friday: '11:00 AM - 11:00 PM',
    saturday: '11:00 AM - 11:00 PM',
    sunday: '12:00 PM - 9:00 PM',
  };
}

function generatePopularDishes(cuisine: string[]): string[] {
  const cuisineDishes: Record<string, string[]> = {
    'Italian': ['Margherita Pizza', 'Pasta Carbonara', 'Tiramisu'],
    'Pizza': ['Pepperoni Pizza', 'Cheese Pizza', 'Garlic Knots'],
    'Japanese': ['Salmon Sashimi', 'Spicy Tuna Roll', 'Miso Soup'],
    'Chinese': ['General Tso Chicken', 'Pork Fried Rice', 'Dumplings'],
    'Mexican': ['Tacos Al Pastor', 'Guacamole', 'Burrito Bowl'],
    'Thai': ['Pad Thai', 'Green Curry', 'Tom Yum Soup'],
    'Indian': ['Butter Chicken', 'Naan Bread', 'Samosas'],
    'Korean': ['Bibimbap', 'Korean BBQ', 'Kimchi Fried Rice'],
    'American': ['Cheeseburger', 'Mac and Cheese', 'Buffalo Wings'],
    'Burgers': ['Classic Burger', 'Bacon Cheeseburger', 'Truffle Fries'],
    'Coffee': ['Latte', 'Cappuccino', 'Cold Brew'],
    'Bakery': ['Croissant', 'Sourdough Bread', 'Cinnamon Roll'],
  };

  for (const c of cuisine) {
    if (cuisineDishes[c]) {
      return cuisineDishes[c];
    }
  }
  return ['House Special', 'Chef Recommendation'];
}

// Generate food images from Unsplash based on cuisine
function generateImages(cuisine: string[]): string[] {
  const cuisineImages: Record<string, string[]> = {
    'Italian': [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    ],
    'Pizza': [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    ],
    'Japanese': [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    ],
    'Chinese': [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    ],
    'Mexican': [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800',
    ],
    'Thai': [
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    ],
    'Indian': [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    ],
    'Korean': [
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    ],
    'American': [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    ],
    'Burgers': [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    ],
    'Coffee': [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    ],
    'Bakery': [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    ],
  };

  for (const c of cuisine) {
    if (cuisineImages[c]) {
      return cuisineImages[c];
    }
  }

  // Default food images
  return [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  ];
}

// ============================================================================
// Data Fetching
// ============================================================================

async function fetchFromNYCOpenData(limit: number): Promise<RestaurantInsert[]> {
  console.log(`\n🗽 Fetching ${limit} restaurants from NYC Open Data...`);

  const params = new URLSearchParams({
    '$limit': (limit * 3).toString(), // Fetch extra to account for duplicates
    '$where': 'latitude IS NOT NULL AND longitude IS NOT NULL',
    '$order': 'inspection_date DESC',
  });

  const url = `${NYC_OPEN_DATA_URL}?${params}`;
  console.log(`📡 API URL: ${url.substring(0, 80)}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NYC Open Data API error: ${response.status}`);
  }

  const rawData: NYCRestaurantRaw[] = await response.json() as NYCRestaurantRaw[];
  console.log(`📦 Received ${rawData.length} raw records`);

  // Dedupe by CAMIS
  const uniqueMap = new Map<string, NYCRestaurantRaw>();
  for (const restaurant of rawData) {
    if (!uniqueMap.has(restaurant.camis)) {
      uniqueMap.set(restaurant.camis, restaurant);
    }
  }

  const uniqueRestaurants = Array.from(uniqueMap.values()).slice(0, limit);
  console.log(`✨ ${uniqueRestaurants.length} unique restaurants after deduplication`);

  // Transform to our format
  const restaurants: RestaurantInsert[] = [];

  for (const raw of uniqueRestaurants) {
    if (!raw.dba || !raw.latitude || !raw.longitude) continue;

    const lat = parseFloat(raw.latitude);
    const lng = parseFloat(raw.longitude);

    // Validate NYC coordinates
    if (lat < 40.4 || lat > 41.0 || lng < -74.3 || lng > -73.7) continue;

    const cuisine = mapCuisine(raw.cuisine_description);
    const priceRange = estimatePriceRange(raw.cuisine_description, raw.boro);
    const rating = Math.round(gradeToRating(raw.grade, raw.score) * 10) / 10;

    restaurants.push({
      name: raw.dba.trim(),
      cuisine,
      category: determineCategory(raw.cuisine_description),
      price_range: priceRange,
      address: `${raw.building} ${raw.street}`.trim(),
      city: 'New York',
      state: 'NY',
      neighborhood: getNeighborhood(raw.boro, raw.zipcode),
      latitude: lat,
      longitude: lng,
      phone: raw.phone || null,
      website: null,
      tags: generateTags(raw.cuisine_description, raw.grade, priceRange),
      images: generateImages(cuisine),
      hours: generateDefaultHours(),
      popular_dishes: generatePopularDishes(cuisine),
      rating,
      rating_count: Math.floor(Math.random() * 500) + 50,
      accepts_reservations: Math.random() > 0.5,
      is_open: true,
    });
  }

  console.log(`✅ Processed ${restaurants.length} restaurants`);
  return restaurants;
}

async function enrichWithFoursquare(
  restaurants: RestaurantInsert[],
  apiKey: string
): Promise<RestaurantInsert[]> {
  console.log(`\n🔍 Enriching ${restaurants.length} restaurants with Foursquare data...`);
  console.log('   (This may take a while due to rate limiting)\n');

  const enriched: RestaurantInsert[] = [];
  let enrichedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];

    // Rate limiting: 50 QPS max, but be conservative
    if (i > 0 && i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      // Search for venue by name and location
      const searchParams = new URLSearchParams({
        query: restaurant.name,
        ll: `${restaurant.latitude},${restaurant.longitude}`,
        radius: '100', // 100 meters
        limit: '1',
      });

      const response = await fetch(`${FOURSQUARE_API_URL}/search?${searchParams}`, {
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json() as { results: FoursquarePlace[] };

        if (data.results && data.results.length > 0) {
          const place = data.results[0];

          // Enrich with Foursquare data
          if (place.photos && place.photos.length > 0) {
            restaurant.images = place.photos.slice(0, 3).map(
              p => `${p.prefix}original${p.suffix}`
            );
          }

          if (place.website) {
            restaurant.website = place.website;
          }

          if (place.rating) {
            // Foursquare uses 0-10 scale
            restaurant.rating = place.rating;
          }

          enrichedCount++;
        }
      }
    } catch (error) {
      errorCount++;
    }

    // Progress indicator
    if ((i + 1) % 50 === 0) {
      console.log(`   Progress: ${i + 1}/${restaurants.length} (${enrichedCount} enriched, ${errorCount} errors)`);
    }

    enriched.push(restaurant);
  }

  console.log(`\n✅ Enrichment complete: ${enrichedCount} enhanced, ${errorCount} errors`);
  return enriched;
}

// ============================================================================
// Database Operations
// ============================================================================

async function insertRestaurants(pool: pg.Pool, restaurants: RestaurantInsert[]): Promise<number> {
  console.log(`\n💾 Inserting ${restaurants.length} restaurants into Supabase...`);

  let insertedCount = 0;
  let skippedCount = 0;

  // Insert each restaurant individually to prevent batch failure
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    try {
      await pool.query(
        `INSERT INTO public.restaurants (
          name, cuisine, category, price_range,
          address, city, state, neighborhood,
          coordinates,
          phone, website, tags, images, hours,
          popular_dishes, rating, rating_count,
          accepts_reservations, is_open
        ) VALUES (
          $1, $2::jsonb, $3, $4,
          $5, $6, $7, $8,
          ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography,
          $11, $12, $13::jsonb, $14::jsonb, $15::jsonb,
          $16::jsonb, $17, $18,
          $19, $20
        )
        ON CONFLICT DO NOTHING`,
        [
          r.name,
          JSON.stringify(r.cuisine),
          r.category,
          r.price_range,
          r.address,
          r.city,
          r.state,
          r.neighborhood,
          r.longitude,
          r.latitude,
          r.phone,
          r.website,
          JSON.stringify(r.tags),
          JSON.stringify(r.images),
          JSON.stringify(r.hours),
          JSON.stringify(r.popular_dishes),
          r.rating,
          r.rating_count,
          r.accepts_reservations,
          r.is_open,
        ]
      );
      insertedCount++;
    } catch (err) {
      skippedCount++;
      // Only log first few errors to avoid spam
      if (skippedCount <= 5) {
        console.error(`   ⚠️  Skipped: ${r.name} - ${(err as Error).message.split('\n')[0]}`);
      }
    }

    // Progress indicator every 500 records
    if ((i + 1) % 500 === 0) {
      console.log(`   Progress: ${i + 1}/${restaurants.length} (${insertedCount} inserted, ${skippedCount} skipped)`);
    }
  }

  if (skippedCount > 5) {
    console.log(`   ... and ${skippedCount - 5} more skipped`);
  }
  console.log(`✅ Inserted ${insertedCount} restaurants (${skippedCount} skipped)`);

  return insertedCount;
}

async function clearRestaurants(pool: pg.Pool): Promise<void> {
  console.log('\n🗑️  Clearing existing restaurant data...');
  await pool.query('TRUNCATE public.restaurants CASCADE');
  console.log('✅ Cleared');
}

async function getRestaurantCount(pool: pg.Pool): Promise<number> {
  const result = await pool.query('SELECT COUNT(*) FROM public.restaurants');
  return parseInt(result.rows[0].count);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1]) || 500
    : 500;
  const shouldClear = args.includes('--clear');
  const shouldEnrich = args.includes('--enrich');
  const foursquareKey = process.env.FOURSQUARE_API_KEY;

  console.log('🍽️  Beli Restaurant Seeder');
  console.log('══════════════════════════════════════════\n');
  console.log(`   Limit: ${limit}`);
  console.log(`   Clear existing: ${shouldClear}`);
  console.log(`   Enrich with Foursquare: ${shouldEnrich}`);
  console.log(`   Foursquare API key: ${foursquareKey ? '✓ Set' : '✗ Not set'}`);

  // Check for connection string
  const connectionString = process.env.POSTGRES_CONNECTION_STR;
  if (!connectionString) {
    console.error('\n❌ Error: POSTGRES_CONNECTION_STR not set');
    console.error('   Set it in beli-web/.env.local or as environment variable');
    process.exit(1);
  }

  // Connect to database
  const pool = new Pool({ connectionString });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('\n✅ Connected to Supabase PostgreSQL');

    // Show current count
    const beforeCount = await getRestaurantCount(pool);
    console.log(`📊 Current restaurant count: ${beforeCount}`);

    // Clear if requested
    if (shouldClear) {
      await clearRestaurants(pool);
    }

    // Fetch from NYC Open Data
    let restaurants = await fetchFromNYCOpenData(limit);

    // Optionally enrich with Foursquare
    if (shouldEnrich) {
      if (!foursquareKey) {
        console.warn('\n⚠️  FOURSQUARE_API_KEY not set, skipping enrichment');
      } else {
        restaurants = await enrichWithFoursquare(restaurants, foursquareKey);
      }
    }

    // Insert into database
    const insertedCount = await insertRestaurants(pool, restaurants);

    // Final count
    const afterCount = await getRestaurantCount(pool);
    console.log(`\n📊 Final restaurant count: ${afterCount} (+${afterCount - beforeCount})`);

    // Summary
    console.log('\n══════════════════════════════════════════');
    console.log('✅ Seeding complete!');
    console.log(`   Fetched: ${restaurants.length}`);
    console.log(`   Inserted: ${insertedCount}`);
    console.log(`   Total in DB: ${afterCount}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
