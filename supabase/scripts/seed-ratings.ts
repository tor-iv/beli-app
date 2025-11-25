/**
 * Ratings Seeder for Beli
 *
 * Seeds the Supabase database with user ratings for restaurants.
 * Creates realistic rating distributions and visit patterns.
 *
 * Usage:
 *   npx ts-node seed-ratings.ts
 *   npx ts-node seed-ratings.ts --density high   # More ratings per user
 *   npx ts-node seed-ratings.ts --clear
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
// Rating Generation Config
// ============================================================================

interface DensityConfig {
  minRatingsPerUser: number;
  maxRatingsPerUser: number;
  wantToTryRatio: number; // Ratio of want-to-try vs been
}

const DENSITY_CONFIGS: Record<string, DensityConfig> = {
  low: { minRatingsPerUser: 5, maxRatingsPerUser: 15, wantToTryRatio: 0.3 },
  medium: { minRatingsPerUser: 10, maxRatingsPerUser: 40, wantToTryRatio: 0.25 },
  high: { minRatingsPerUser: 30, maxRatingsPerUser: 100, wantToTryRatio: 0.2 },
};

// Rating note templates
const POSITIVE_NOTES = [
  'Absolutely loved it! Will definitely be back.',
  'One of the best meals I\'ve had in a while.',
  'Great food, great service, great atmosphere.',
  'Hidden gem! Don\'t miss this place.',
  'Perfect for date night.',
  'The [dish] was incredible.',
  'Worth every penny.',
  'My new favorite spot.',
  'Can\'t wait to come back and try more dishes.',
  'Exceeded expectations!',
  'Finally found my go-to place in the neighborhood.',
  'The staff was so friendly and attentive.',
  'Amazing flavors, perfectly executed.',
  'Best [cuisine] I\'ve had in NYC.',
];

const NEUTRAL_NOTES = [
  'Decent food, nothing special.',
  'Good for the price.',
  'Solid option in the area.',
  'Would come back if nearby.',
  'Pretty good overall.',
  'Met expectations.',
  'Average experience, nothing wrong.',
  'Food was okay, service was good.',
  'Not bad, not great.',
  'Acceptable for a quick meal.',
];

const NEGATIVE_NOTES = [
  'Disappointed. Expected more.',
  'Service was slow.',
  'Food was mediocre.',
  'Overpriced for what you get.',
  'Won\'t be coming back.',
  'Better options in the area.',
  'Not worth the hype.',
  'Food was cold when it arrived.',
];

const TAGS = [
  'date-night', 'casual', 'business-friendly', 'family-friendly',
  'good-for-groups', 'romantic', 'cozy', 'trendy', 'upscale',
  'outdoor-seating', 'late-night', 'brunch', 'happy-hour',
  'quick-bite', 'special-occasion', 'hidden-gem', 'worth-the-wait',
  'great-service', 'great-cocktails', 'instagram-worthy',
];

// ============================================================================
// Helper Functions
// ============================================================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateRating(): number {
  // Bell curve distribution centered around 7.5
  // Most ratings between 6-9
  const base = 7.5;
  const variance = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
  const rating = base + variance * 4;
  return Math.round(Math.max(1, Math.min(10, rating)) * 10) / 10;
}

function generateNote(rating: number): string | null {
  // 60% of ratings have notes
  if (Math.random() > 0.6) return null;

  if (rating >= 8) return randomElement(POSITIVE_NOTES);
  if (rating >= 6) return randomElement(NEUTRAL_NOTES);
  return randomElement(NEGATIVE_NOTES);
}

function generateTags(rating: number): string[] {
  // Higher ratings get more tags
  const tagCount = rating >= 8 ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 2);
  return randomElements(TAGS, tagCount);
}

function randomPastDate(maxDaysAgo: number = 365): Date {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

// ============================================================================
// Database Operations
// ============================================================================

interface User {
  id: string;
  username: string;
}

interface Restaurant {
  id: string;
  name: string;
  rating: number;
}

async function getUsers(pool: pg.Pool): Promise<User[]> {
  const result = await pool.query('SELECT id, username FROM public.users');
  return result.rows;
}

async function getRestaurants(pool: pg.Pool): Promise<Restaurant[]> {
  const result = await pool.query('SELECT id, name, rating FROM public.restaurants');
  return result.rows;
}

async function insertRatings(
  pool: pg.Pool,
  users: User[],
  restaurants: Restaurant[],
  config: DensityConfig
): Promise<{ beenCount: number; wantToTryCount: number }> {
  console.log(`\n💾 Generating ratings...`);
  console.log(`   Config: ${config.minRatingsPerUser}-${config.maxRatingsPerUser} per user`);

  const client = await pool.connect();
  let beenCount = 0;
  let wantToTryCount = 0;

  try {
    // Disable RLS for seeding (requires service role or superuser)
    console.log('   Disabling RLS for seeding...');
    await client.query('ALTER TABLE public.ratings DISABLE ROW LEVEL SECURITY');

    // Generate all ratings in memory first
    console.log('   Generating rating data in memory...');
    const beenRatings: Array<{
      user_id: string;
      restaurant_id: string;
      rating: number;
      notes: string | null;
      tags: string[];
      visit_date: Date;
    }> = [];
    const wantToTryRatings: Array<{
      user_id: string;
      restaurant_id: string;
      created_at: Date;
    }> = [];

    for (const user of users) {
      const totalInteractions = Math.floor(
        Math.random() * (config.maxRatingsPerUser - config.minRatingsPerUser) +
        config.minRatingsPerUser
      );
      const userRestaurants = randomElements(restaurants, totalInteractions);

      for (const restaurant of userRestaurants) {
        const isWantToTry = Math.random() < config.wantToTryRatio;

        if (isWantToTry) {
          wantToTryRatings.push({
            user_id: user.id,
            restaurant_id: restaurant.id,
            created_at: randomPastDate(180),
          });
        } else {
          const rating = generateRating();
          beenRatings.push({
            user_id: user.id,
            restaurant_id: restaurant.id,
            rating,
            notes: generateNote(rating),
            tags: generateTags(rating),
            visit_date: randomPastDate(365),
          });
        }
      }
    }

    console.log(`   Generated ${beenRatings.length} "been" and ${wantToTryRatings.length} "want to try" ratings`);

    // Batch insert "been" ratings (500 at a time for performance)
    const BATCH_SIZE = 500;
    console.log('   Inserting "been" ratings in batches...');

    for (let i = 0; i < beenRatings.length; i += BATCH_SIZE) {
      const batch = beenRatings.slice(i, i + BATCH_SIZE);

      // Build multi-value INSERT
      const values: unknown[] = [];
      const valuePlaceholders: string[] = [];

      batch.forEach((r, idx) => {
        const offset = idx * 7;
        valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, 'been', $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`);
        values.push(r.user_id, r.restaurant_id, r.rating, r.notes, r.tags, r.visit_date, r.visit_date);
      });

      await client.query(
        `INSERT INTO public.ratings (
          user_id, restaurant_id, status, rating, notes, tags, visit_date, created_at
        ) VALUES ${valuePlaceholders.join(', ')}
        ON CONFLICT (user_id, restaurant_id) DO NOTHING`,
        values
      );
      beenCount += batch.length;

      if ((i + BATCH_SIZE) % 10000 === 0 || i + BATCH_SIZE >= beenRatings.length) {
        console.log(`   "Been" progress: ${Math.min(i + BATCH_SIZE, beenRatings.length)}/${beenRatings.length}`);
      }
    }

    // Batch insert "want to try" ratings
    console.log('   Inserting "want to try" ratings in batches...');

    for (let i = 0; i < wantToTryRatings.length; i += BATCH_SIZE) {
      const batch = wantToTryRatings.slice(i, i + BATCH_SIZE);

      const values: unknown[] = [];
      const valuePlaceholders: string[] = [];

      batch.forEach((r, idx) => {
        const offset = idx * 3;
        valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, 'want_to_try', $${offset + 3})`);
        values.push(r.user_id, r.restaurant_id, r.created_at);
      });

      await client.query(
        `INSERT INTO public.ratings (
          user_id, restaurant_id, status, created_at
        ) VALUES ${valuePlaceholders.join(', ')}
        ON CONFLICT (user_id, restaurant_id) DO NOTHING`,
        values
      );
      wantToTryCount += batch.length;

      if ((i + BATCH_SIZE) % 10000 === 0 || i + BATCH_SIZE >= wantToTryRatings.length) {
        console.log(`   "Want to try" progress: ${Math.min(i + BATCH_SIZE, wantToTryRatings.length)}/${wantToTryRatings.length}`);
      }
    }

    // Re-enable RLS
    console.log('   Re-enabling RLS...');
    await client.query('ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY');

    console.log(`✅ Created ${beenCount} "been" ratings and ${wantToTryCount} "want to try" entries`);
  } catch (err) {
    // Re-enable RLS even on error
    try {
      await client.query('ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY');
    } catch {
      // Ignore
    }
    throw err;
  } finally {
    client.release();
  }

  return { beenCount, wantToTryCount };
}

async function updateRestaurantRatings(pool: pg.Pool): Promise<void> {
  console.log('\n📊 Updating restaurant aggregate ratings...');

  // Update each restaurant's rating based on user ratings
  await pool.query(`
    UPDATE public.restaurants r
    SET
      rating = COALESCE(
        (SELECT ROUND(AVG(rating)::numeric, 1)
         FROM public.ratings
         WHERE restaurant_id = r.id
         AND status = 'been'
         AND rating IS NOT NULL),
        r.rating
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM public.ratings
        WHERE restaurant_id = r.id
        AND status = 'been'
        AND rating IS NOT NULL
      )
  `);

  console.log('✅ Restaurant ratings updated');
}

async function clearRatings(pool: pg.Pool): Promise<void> {
  console.log('\n🗑️  Clearing existing ratings...');
  await pool.query('DELETE FROM public.ratings');
  console.log('✅ Cleared');
}

async function getRatingCount(pool: pg.Pool): Promise<number> {
  const result = await pool.query('SELECT COUNT(*) FROM public.ratings');
  return parseInt(result.rows[0].count);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  const density = args.includes('--density')
    ? (args[args.indexOf('--density') + 1] as keyof typeof DENSITY_CONFIGS) || 'medium'
    : 'medium';
  const shouldClear = args.includes('--clear');
  const skipUpdate = args.includes('--no-update');

  const config = DENSITY_CONFIGS[density] || DENSITY_CONFIGS.medium;

  console.log('⭐ Beli Ratings Seeder');
  console.log('══════════════════════════════════════════\n');
  console.log(`   Density: ${density}`);
  console.log(`   Ratings per user: ${config.minRatingsPerUser}-${config.maxRatingsPerUser}`);
  console.log(`   Want-to-try ratio: ${config.wantToTryRatio * 100}%`);
  console.log(`   Clear existing: ${shouldClear}`);
  console.log(`   Update aggregates: ${!skipUpdate}`);

  const connectionString = process.env.POSTGRES_CONNECTION_STR;
  if (!connectionString) {
    console.error('\n❌ Error: POSTGRES_CONNECTION_STR not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    await pool.query('SELECT 1');
    console.log('\n✅ Connected to Supabase PostgreSQL');

    // Get users and restaurants
    const users = await getUsers(pool);
    const restaurants = await getRestaurants(pool);

    console.log(`📊 Found ${users.length} users and ${restaurants.length} restaurants`);

    if (users.length === 0) {
      console.error('\n❌ No users found. Run seed:users first.');
      process.exit(1);
    }

    if (restaurants.length === 0) {
      console.error('\n❌ No restaurants found. Run seed:restaurants first.');
      process.exit(1);
    }

    const beforeCount = await getRatingCount(pool);
    console.log(`📊 Current rating count: ${beforeCount}`);

    if (shouldClear) {
      await clearRatings(pool);
    }

    // Generate ratings
    const { beenCount, wantToTryCount } = await insertRatings(pool, users, restaurants, config);

    // Update restaurant aggregate ratings
    if (!skipUpdate) {
      await updateRestaurantRatings(pool);
    }

    const afterCount = await getRatingCount(pool);

    console.log('\n══════════════════════════════════════════');
    console.log('✅ Rating seeding complete!');
    console.log(`   "Been" ratings: ${beenCount}`);
    console.log(`   "Want to try": ${wantToTryCount}`);
    console.log(`   Total in DB: ${afterCount}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
