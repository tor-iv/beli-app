/**
 * Demo User Seeder for Beli
 *
 * Generates realistic demo data for tor_iv user with exact counts
 * matching the profile display stats (156 been, 89 want-to-try).
 *
 * Features:
 * - Seeded RNG for reproducible results
 * - Realistic bell-curve rating distribution
 * - Rich note templates with cuisine-specific dish mentions
 * - Proper storage: "been" in ratings, "want-to-try" in users.watchlist
 *
 * Usage:
 *   npx ts-node seed-demo-user.ts
 *   npx ts-node seed-demo-user.ts --clear
 */

import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../beli-web/.env.local') });

const { Pool } = pg;

// ============================================================================
// Configuration
// ============================================================================

const TOR_IV_USER_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_BEEN_COUNT = 156;
const TARGET_WANT_TO_TRY_COUNT = 89;
const RANDOM_SEED = 42; // Change to regenerate different data

// Category distribution to ensure diversity across all list categories
// This guarantees tor_iv has data in every category for filtering to work
const BEEN_CATEGORY_DISTRIBUTION: Record<string, number> = {
  restaurants: 120, // ~77% restaurants (main category)
  bars: 12, // ~8% bars
  bakeries: 10, // ~6% bakeries
  coffee_tea: 8, // ~5% coffee/tea
  dessert: 6, // ~4% dessert
};

const WANT_TO_TRY_CATEGORY_DISTRIBUTION: Record<string, number> = {
  restaurants: 65, // ~73% restaurants
  bars: 8, // ~9% bars
  bakeries: 6, // ~7% bakeries
  coffee_tea: 5, // ~6% coffee/tea
  dessert: 5, // ~6% dessert
};

// ============================================================================
// Seeded Random Number Generator (for reproducibility)
// ============================================================================

function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============================================================================
// Note Templates (50+ variations organized by rating tier)
// ============================================================================

const EXCEPTIONAL_NOTES = [
  'This place is a revelation. Every dish was perfect.',
  'Easily in my top 5 NYC restaurants. The {dish} was transcendent.',
  'Came back the next week. Still just as good.',
  'Worth the wait. Worth the price. Worth everything.',
  'I dream about the {dish} here.',
  'This is the kind of place you bring out-of-towners to impress them.',
  'Genuinely life-changing meal. Not exaggerating.',
  'The attention to detail here is remarkable.',
  'Chef is doing something special. You can taste the passion.',
  'Perfect from start to finish. Already planning my return.',
];

const EXCELLENT_NOTES = [
  'Really impressed. The {dish} was outstanding.',
  'Great atmosphere, even better food.',
  'My new neighborhood go-to.',
  "Can't believe this place isn't more packed.",
  'Solid execution across the board.',
  'The {dish} alone is worth the trip.',
  'Perfect for date night.',
  'Service was attentive without being overbearing.',
  'Would definitely bring friends here.',
  'Finally found a good spot for {cuisine}.',
  'Exceeded expectations. Will be back soon.',
  'Quality ingredients, well-prepared. Simple as that.',
  'The {dish} had incredible depth of flavor.',
  'Cozy vibes, great food. What more could you want?',
];

const GOOD_NOTES = [
  'Solid choice. Would recommend.',
  'Good food, fair prices.',
  'Enjoyable meal overall.',
  'Met expectations.',
  'Will probably come back.',
  'Nice spot for a casual dinner.',
  'The {dish} was the standout.',
  'Consistent quality.',
  'Pleasant surprise.',
  'Good for the neighborhood.',
  'Reliable option when you need it.',
  'Nothing fancy but does the job well.',
];

const AVERAGE_NOTES = [
  'Fine for what it is.',
  'Not bad, not great.',
  'Decent spot when you need a quick bite.',
  "Would go if nearby but wouldn't make a trip.",
  'Acceptable. Nothing special.',
  'Gets the job done.',
  'Middle of the road.',
  'Had better, had worse.',
  'Okay for the price point.',
  'Not memorable but not terrible.',
];

const DISAPPOINTED_NOTES = [
  'Expected more based on reviews.',
  'Service was slow, food was cold.',
  "Won't be rushing back.",
  'Overpriced for what you get.',
  'Disappointed. Had higher hopes.',
  'The {dish} was underwhelming.',
  'Better options in the area.',
  "Not sure what the hype is about.",
  'Mediocre experience overall.',
  "One and done. Won't return.",
];

const BRIEF_NOTES = [
  'Good stuff.',
  'Solid.',
  'Will return.',
  'Meh.',
  'Tasty!',
  'Not bad.',
  'Great!',
  'Worth it.',
  'Skip it.',
  'Decent.',
  'Yum.',
  'Fine.',
  'Eh.',
  'Perfect.',
  'Delish.',
];

// Cuisine-specific dish placeholders
const CUISINE_DISHES: Record<string, string[]> = {
  Italian: ['carbonara', 'margherita pizza', 'burrata', 'osso buco', 'tiramisu', 'cacio e pepe', 'bolognese'],
  Pizza: ['pepperoni slice', 'grandma pie', 'margherita', 'vodka slice', 'white pie', 'Sicilian square'],
  Japanese: ['omakase', 'tonkotsu ramen', 'sashimi platter', 'wagyu', 'uni', 'chirashi', 'miso cod'],
  Chinese: ['soup dumplings', 'dan dan noodles', 'Peking duck', 'mapo tofu', 'scallion pancakes', 'kung pao chicken'],
  Mexican: ['tacos al pastor', 'mole', 'birria', 'elote', 'carnitas', 'carne asada', 'pozole'],
  Thai: ['pad thai', 'green curry', 'khao soi', 'larb', 'tom yum', 'papaya salad'],
  Indian: ['butter chicken', 'biryani', 'naan', 'dosa', 'tikka masala', 'samosas'],
  Korean: ['bibimbap', 'korean fried chicken', 'kimchi jjigae', 'galbi', 'japchae', 'bulgogi'],
  American: ['burger', 'mac and cheese', 'fried chicken', 'wings', 'ribs', 'steak'],
  French: ['steak frites', 'duck confit', 'coq au vin', 'croque monsieur', 'bouillabaisse'],
  Mediterranean: ['falafel', 'hummus', 'shawarma', 'grilled lamb', 'baba ganoush'],
  Seafood: ['lobster roll', 'oysters', 'fish and chips', 'grilled branzino', 'ceviche'],
  Vietnamese: ['pho', 'banh mi', 'spring rolls', 'bun bo hue', 'vermicelli bowl'],
  Bakery: ['croissant', 'sourdough', 'danish', 'pain au chocolat', 'baguette'],
  Coffee: ['latte', 'cortado', 'pour over', 'cold brew', 'espresso'],
  Deli: ['pastrami sandwich', 'matzo ball soup', 'reuben', 'bagel with lox'],
  Greek: ['gyro', 'moussaka', 'spanakopita', 'souvlaki', 'tzatziki'],
  Caribbean: ['jerk chicken', 'oxtail', 'plantains', 'rice and peas', 'curry goat'],
  default: ['signature dish', 'special', "chef's recommendation", 'house favorite'],
};

// Tags organized by context
const HIGH_RATING_TAGS = ['worth-the-wait', 'special-occasion', 'hidden-gem', 'must-try', 'bucket-list'];
const GOOD_RATING_TAGS = ['solid-choice', 'good-value', 'nice-atmosphere', 'reliable'];
const CONTEXTUAL_TAGS = ['date-night', 'group-dinner', 'solo-meal', 'business-lunch', 'brunch', 'late-night', 'happy-hour'];
const DESCRIPTIVE_TAGS = ['cozy', 'trendy', 'upscale', 'casual', 'romantic', 'lively', 'intimate', 'neighborhood-spot'];

// ============================================================================
// Rating Generation Functions
// ============================================================================

function generateRealisticRating(random: () => number): number {
  // Realistic distribution:
  // 5% below 5.0 (disappointed)
  // 15% in 5.0-6.4 (average)
  // 40% in 6.5-7.9 (good)
  // 35% in 8.0-9.0 (excellent)
  // 5% in 9.1-10.0 (exceptional)
  const bucket = random();
  let rating: number;

  if (bucket < 0.05) {
    rating = 3.0 + random() * 2.0; // 3.0-5.0
  } else if (bucket < 0.2) {
    rating = 5.0 + random() * 1.5; // 5.0-6.5
  } else if (bucket < 0.6) {
    rating = 6.5 + random() * 1.5; // 6.5-8.0
  } else if (bucket < 0.95) {
    rating = 8.0 + random() * 1.0; // 8.0-9.0
  } else {
    rating = 9.0 + random() * 1.0; // 9.0-10.0
  }

  return Math.round(rating * 10) / 10;
}

function generateNote(rating: number, cuisine: string[], random: () => number): string | null {
  // 40% of ratings have no notes (realistic)
  if (random() > 0.6) return null;

  // 20% chance of brief note
  if (random() < 0.2) {
    return BRIEF_NOTES[Math.floor(random() * BRIEF_NOTES.length)];
  }

  // Select note pool based on rating
  let pool: string[];
  if (rating >= 9.0) pool = EXCEPTIONAL_NOTES;
  else if (rating >= 8.0) pool = EXCELLENT_NOTES;
  else if (rating >= 6.5) pool = GOOD_NOTES;
  else if (rating >= 5.0) pool = AVERAGE_NOTES;
  else pool = DISAPPOINTED_NOTES;

  let note = pool[Math.floor(random() * pool.length)];

  // Replace {dish} placeholder if present
  if (note.includes('{dish}')) {
    const primaryCuisine = cuisine[0] || 'default';
    const dishes = CUISINE_DISHES[primaryCuisine] || CUISINE_DISHES['default'];
    const dish = dishes[Math.floor(random() * dishes.length)];
    note = note.replace('{dish}', dish);
  }

  // Replace {cuisine} placeholder if present
  if (note.includes('{cuisine}')) {
    note = note.replace('{cuisine}', cuisine[0] || 'food');
  }

  return note;
}

function generateTags(rating: number, random: () => number): string[] {
  const tags: string[] = [];

  // Higher ratings get more tags
  const tagCount = rating >= 8 ? Math.floor(random() * 3) + 1 : Math.floor(random() * 2);

  if (tagCount === 0) return tags;

  // Add rating-based tag
  if (rating >= 8.5 && random() > 0.5) {
    tags.push(HIGH_RATING_TAGS[Math.floor(random() * HIGH_RATING_TAGS.length)]);
  } else if (rating >= 6.5 && random() > 0.6) {
    tags.push(GOOD_RATING_TAGS[Math.floor(random() * GOOD_RATING_TAGS.length)]);
  }

  // Add contextual/descriptive tags
  while (tags.length < tagCount) {
    const pool = random() > 0.5 ? CONTEXTUAL_TAGS : DESCRIPTIVE_TAGS;
    const tag = pool[Math.floor(random() * pool.length)];
    if (!tags.includes(tag)) tags.push(tag);
  }

  return tags;
}

function generateVisitDate(random: () => number, maxDaysAgo: number = 730): string {
  // Exponential decay: more recent dates more likely (active user behavior)
  const daysAgo = Math.floor(Math.pow(random(), 1.5) * maxDaysAgo);
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  // Return as YYYY-MM-DD string for DATE column
  return date.toISOString().split('T')[0];
}

// ============================================================================
// Database Operations
// ============================================================================

interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  neighborhood: string;
  price_range: string;
  category: string;
}

async function getRestaurants(pool: pg.Pool): Promise<Restaurant[]> {
  const result = await pool.query(`
    SELECT id, name, cuisine, neighborhood, price_range, category
    FROM public.restaurants
    ORDER BY rating DESC
  `);
  return result.rows;
}

/**
 * Select restaurants with guaranteed category diversity
 * Ensures each category has its target count, fills remaining slots randomly
 */
function selectRestaurantsByCategoryDistribution(
  restaurants: Restaurant[],
  distribution: Record<string, number>,
  random: () => number
): Restaurant[] {
  const selected: Restaurant[] = [];
  const usedIds = new Set<string>();

  // Group restaurants by category
  const byCategory = new Map<string, Restaurant[]>();
  for (const r of restaurants) {
    const cat = r.category || 'restaurants';
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(r);
  }

  // Select target count from each category
  for (const [category, targetCount] of Object.entries(distribution)) {
    const categoryRestaurants = byCategory.get(category) || [];
    const shuffled = [...categoryRestaurants].sort(() => random() - 0.5);
    const toSelect = shuffled.slice(0, Math.min(targetCount, shuffled.length));

    for (const r of toSelect) {
      if (!usedIds.has(r.id)) {
        selected.push(r);
        usedIds.add(r.id);
      }
    }

    console.log(`     ${category}: selected ${toSelect.length}/${targetCount} (available: ${categoryRestaurants.length})`);
  }

  return selected;
}

async function verifyTorIvExists(pool: pg.Pool): Promise<boolean> {
  const result = await pool.query('SELECT id FROM public.users WHERE id = $1', [TOR_IV_USER_ID]);
  return result.rows.length > 0;
}

async function clearTorIvData(pool: pg.Pool): Promise<void> {
  console.log('   Clearing existing ratings for tor_iv...');
  await pool.query('DELETE FROM public.ratings WHERE user_id = $1', [TOR_IV_USER_ID]);

  console.log('   Clearing watchlist for tor_iv...');
  await pool.query("UPDATE public.users SET watchlist = '{}' WHERE id = $1", [TOR_IV_USER_ID]);

  console.log('   Cleared');
}

async function insertBeenRatings(
  pool: pg.Pool,
  restaurants: Restaurant[],
  random: () => number
): Promise<string[]> {
  console.log(`\n   Generating ${TARGET_BEEN_COUNT} "been" ratings with category diversity...`);
  console.log('   Category breakdown:');

  // Select restaurants with guaranteed category diversity
  const beenRestaurants = selectRestaurantsByCategoryDistribution(
    restaurants,
    BEEN_CATEGORY_DISTRIBUTION,
    random
  );

  const client = await pool.connect();
  const usedIds: string[] = [];

  try {
    // Disable RLS for seeding
    await client.query('ALTER TABLE public.ratings DISABLE ROW LEVEL SECURITY');

    let insertedCount = 0;

    for (const restaurant of beenRestaurants) {
      const rating = generateRealisticRating(random);
      const note = generateNote(rating, restaurant.cuisine || [], random);
      const tags = generateTags(rating, random);
      const visitDate = generateVisitDate(random);

      try {
        // visit_date is DATE type, created_at is TIMESTAMPTZ
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));

        await client.query(
          `INSERT INTO public.ratings (
            user_id, restaurant_id, status, rating, notes, tags, visit_date, created_at
          ) VALUES ($1, $2, 'been', $3, $4, $5, $6::date, $7)
          ON CONFLICT (user_id, restaurant_id) DO NOTHING`,
          [TOR_IV_USER_ID, restaurant.id, rating, note, tags, visitDate, createdAt]
        );
        insertedCount++;
        usedIds.push(restaurant.id);
      } catch (err) {
        console.error(`   Failed to insert rating for ${restaurant.name}:`, err);
      }
    }

    // Re-enable RLS
    await client.query('ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY');

    console.log(`   Inserted ${insertedCount} "been" ratings`);
  } finally {
    client.release();
  }

  return usedIds;
}

async function updateWatchlist(
  pool: pg.Pool,
  restaurants: Restaurant[],
  usedRestaurantIds: Set<string>,
  random: () => number
): Promise<void> {
  console.log(`\n   Generating ${TARGET_WANT_TO_TRY_COUNT} "want to try" entries with category diversity...`);
  console.log('   Category breakdown:');

  // Select restaurants NOT in "been" list for "want to try"
  const available = restaurants.filter((r) => !usedRestaurantIds.has(r.id));

  // Select with category diversity
  const wantToTryRestaurants = selectRestaurantsByCategoryDistribution(
    available,
    WANT_TO_TRY_CATEGORY_DISTRIBUTION,
    random
  );

  const watchlistIds = wantToTryRestaurants.map((r) => r.id);

  // Update users.watchlist array
  await pool.query('UPDATE public.users SET watchlist = $1 WHERE id = $2', [watchlistIds, TOR_IV_USER_ID]);

  console.log(`   Updated watchlist with ${watchlistIds.length} restaurant IDs`);
}

async function verifyResults(pool: pg.Pool): Promise<{ beenCount: number; wantToTryCount: number }> {
  const beenResult = await pool.query(
    `SELECT COUNT(*) FROM public.ratings WHERE user_id = $1 AND status = 'been'`,
    [TOR_IV_USER_ID]
  );

  const watchlistResult = await pool.query(`SELECT array_length(watchlist, 1) FROM public.users WHERE id = $1`, [
    TOR_IV_USER_ID,
  ]);

  return {
    beenCount: parseInt(beenResult.rows[0].count),
    wantToTryCount: watchlistResult.rows[0].array_length || 0,
  };
}

async function showRatingDistribution(pool: pg.Pool): Promise<void> {
  const result = await pool.query(
    `
    SELECT
      CASE
        WHEN rating < 5 THEN 'below_5'
        WHEN rating < 6.5 THEN '5_to_6.5'
        WHEN rating < 8 THEN '6.5_to_8'
        ELSE '8_plus'
      END as tier,
      COUNT(*) as count,
      ROUND(AVG(rating)::numeric, 1) as avg_rating
    FROM public.ratings
    WHERE user_id = $1 AND status = 'been'
    GROUP BY tier
    ORDER BY tier
  `,
    [TOR_IV_USER_ID]
  );

  console.log('\n   Rating distribution:');
  for (const row of result.rows) {
    console.log(`     ${row.tier}: ${row.count} ratings (avg: ${row.avg_rating})`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');

  console.log('====================================================');
  console.log(' Beli Demo User Seeder (tor_iv)');
  console.log('====================================================\n');
  console.log(`   Target "been" count: ${TARGET_BEEN_COUNT}`);
  console.log(`   Target "want to try" count: ${TARGET_WANT_TO_TRY_COUNT}`);
  console.log(`   Random seed: ${RANDOM_SEED}`);
  console.log(`   Clear existing: ${shouldClear}`);

  const connectionString = process.env.POSTGRES_CONNECTION_STR;
  if (!connectionString) {
    console.error('\n   Error: POSTGRES_CONNECTION_STR not set');
    console.error('   Make sure beli-web/.env.local exists with the connection string');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const random = createSeededRandom(RANDOM_SEED);

  try {
    await pool.query('SELECT 1');
    console.log('\n   Connected to Supabase PostgreSQL');

    // Verify tor_iv exists
    const torIvExists = await verifyTorIvExists(pool);
    if (!torIvExists) {
      console.error('\n   Error: tor_iv user not found.');
      console.error('   Run: npm run seed:users first.');
      process.exit(1);
    }
    console.log('   Found tor_iv user');

    // Get restaurants
    const restaurants = await getRestaurants(pool);
    console.log(`   Found ${restaurants.length} restaurants`);

    if (restaurants.length < TARGET_BEEN_COUNT + TARGET_WANT_TO_TRY_COUNT) {
      console.error(`\n   Error: Need at least ${TARGET_BEEN_COUNT + TARGET_WANT_TO_TRY_COUNT} restaurants`);
      console.error(`   Only found ${restaurants.length}. Run: npm run seed:restaurants first.`);
      process.exit(1);
    }

    // Clear existing if requested
    if (shouldClear) {
      console.log('\n   Clearing existing data...');
      await clearTorIvData(pool);
    }

    // Generate "been" ratings
    const usedIds = await insertBeenRatings(pool, restaurants, random);
    const usedIdSet = new Set(usedIds);

    // Update watchlist (want-to-try)
    await updateWatchlist(pool, restaurants, usedIdSet, random);

    // Show rating distribution
    await showRatingDistribution(pool);

    // Verify final counts
    const { beenCount, wantToTryCount } = await verifyResults(pool);

    console.log('\n====================================================');
    console.log(' Demo user seeding complete!');
    console.log('====================================================');
    console.log(`   "Been" count: ${beenCount}`);
    console.log(`   "Want to try" count: ${wantToTryCount}`);
  } catch (error) {
    console.error('\n   Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
