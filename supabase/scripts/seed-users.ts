/**
 * User Seeder for Beli
 *
 * Seeds the Supabase database with demo users.
 * Creates realistic-looking users with varied profiles.
 *
 * Usage:
 *   npx ts-node seed-users.ts
 *   npx ts-node seed-users.ts --limit 50
 *   npx ts-node seed-users.ts --clear
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
// User Templates
// ============================================================================

interface UserTemplate {
  username: string;
  display_name: string;
  bio: string;
  city: string;
  state: string;
  dietary_restrictions: string[];
  disliked_cuisines: string[];
  avatar_id: number;
  is_tastemaker?: boolean;
}

// Core demo users (always created)
const CORE_USERS: UserTemplate[] = [
  {
    username: 'tor_iv',
    display_name: 'Tor Cox',
    bio: 'Founder of Beli. Always hunting for the next great meal.',
    city: 'New York',
    state: 'NY',
    dietary_restrictions: [],
    disliked_cuisines: [],
    avatar_id: 1,
  },
  {
    username: 'sarah_eats',
    display_name: 'Sarah Chen',
    bio: 'Food photographer & brunch enthusiast 📸🥑',
    city: 'New York',
    state: 'NY',
    dietary_restrictions: ['vegetarian'],
    disliked_cuisines: [],
    avatar_id: 5,
  },
  {
    username: 'mike_foodie',
    display_name: 'Mike Rodriguez',
    bio: 'Pizza connoisseur. Slice by slice.',
    city: 'Brooklyn',
    state: 'NY',
    dietary_restrictions: [],
    disliked_cuisines: ['Thai'],
    avatar_id: 12,
  },
  {
    username: 'emma_bites',
    display_name: 'Emma Thompson',
    bio: 'Always say yes to dessert 🍰',
    city: 'New York',
    state: 'NY',
    dietary_restrictions: ['gluten-free'],
    disliked_cuisines: [],
    avatar_id: 9,
  },
  {
    username: 'alex_cuisine',
    display_name: 'Alex Kim',
    bio: 'From street food to fine dining.',
    city: 'Queens',
    state: 'NY',
    dietary_restrictions: [],
    disliked_cuisines: [],
    avatar_id: 15,
  },
];

// Tastemaker users (food experts)
const TASTEMAKER_USERS: UserTemplate[] = [
  {
    username: 'pizza_pete',
    display_name: 'Pete Zarollini',
    bio: 'NYC Pizza Expert | 1000+ slices reviewed | 🍕',
    city: 'Brooklyn',
    state: 'NY',
    dietary_restrictions: [],
    disliked_cuisines: [],
    avatar_id: 22,
    is_tastemaker: true,
  },
  {
    username: 'ramen_rachel',
    display_name: 'Rachel Nakamura',
    bio: 'Ramen Hunter | Japanese Food Specialist | 🍜',
    city: 'New York',
    state: 'NY',
    dietary_restrictions: [],
    disliked_cuisines: [],
    avatar_id: 31,
    is_tastemaker: true,
  },
  {
    username: 'budget_benny',
    display_name: 'Benny Martinez',
    bio: '$$ meals that taste $$$$. Budget dining expert.',
    city: 'Queens',
    state: 'NY',
    dietary_restrictions: [],
    disliked_cuisines: [],
    avatar_id: 18,
    is_tastemaker: true,
  },
  {
    username: 'vegan_val',
    display_name: 'Valerie Green',
    bio: 'Plant-based food advocate | NYC Vegan Guide 🌱',
    city: 'Brooklyn',
    state: 'NY',
    dietary_restrictions: ['vegan'],
    disliked_cuisines: [],
    avatar_id: 25,
    is_tastemaker: true,
  },
  {
    username: 'cocktail_chris',
    display_name: 'Chris Bartello',
    bio: 'Cocktail bars & speakeasies. NYC nightlife guide 🍸',
    city: 'New York',
    state: 'NY',
    dietary_restrictions: [],
    disliked_cuisines: [],
    avatar_id: 33,
    is_tastemaker: true,
  },
];

// Random user data for generating additional users
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Daniel', 'Karen', 'Matthew', 'Nancy', 'Anthony', 'Lisa',
  'Mark', 'Betty', 'Donald', 'Margaret', 'Steven', 'Sandra', 'Paul', 'Ashley',
  'Andrew', 'Kimberly', 'Joshua', 'Emily', 'Kevin', 'Donna', 'Brian', 'Michelle',
  'George', 'Dorothy', 'Edward', 'Carol', 'Ronald', 'Amanda', 'Timothy', 'Melissa',
  'Jason', 'Deborah', 'Jeffrey', 'Stephanie', 'Ryan', 'Rebecca', 'Jacob', 'Sharon',
  'Olivia', 'Sophia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper',
  'Liam', 'Noah', 'Oliver', 'Elijah', 'Lucas', 'Mason', 'Ethan', 'Logan',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Chen', 'Kim', 'Park', 'Wu', 'Patel', 'Shah', 'Singh',
];

const BIOS = [
  'Food is life. Life is food.',
  'Always hungry, never disappointed.',
  'Exploring NYC one bite at a time 🗽',
  'Brunch is my cardio.',
  'Will travel for good food.',
  'Coffee first, questions later ☕',
  'Foodie & adventure seeker',
  'Eating my way through the city',
  'In a committed relationship with food',
  'Professional menu reader',
  'Carbs are my love language 🍝',
  'Weekend chef, weekday food critic',
  'Finding the best hidden gems',
  'Life is too short for bad food',
  'Dessert enthusiast 🍰',
  'Spicy food lover 🌶️',
  'Sushi addict 🍣',
  'Taco Tuesday every day 🌮',
  'Farm to table advocate 🌱',
  'Late night eats specialist 🌙',
];

const DIETARY_RESTRICTIONS = [
  [], [], [], [], [], // Most people have none
  ['vegetarian'],
  ['vegan'],
  ['gluten-free'],
  ['dairy-free'],
  ['pescatarian'],
  ['halal'],
  ['kosher'],
];

const DISLIKED_CUISINES = [
  [], [], [], [], [], [], // Most people like everything
  ['Thai'],
  ['Indian'],
  ['Mexican'],
  ['Seafood'],
  ['Sushi'],
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateUsername(firstName: string, lastName: string, index: number): string {
  const styles = [
    () => `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}`,
    () => `${firstName.toLowerCase()}_eats`,
    () => `${firstName.toLowerCase()}_foodie`,
    () => `${firstName.toLowerCase()}${Math.floor(Math.random() * 99)}`,
    () => `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`,
    () => `foodie_${firstName.toLowerCase()}`,
    () => `nyc_${firstName.toLowerCase()}`,
  ];

  const style = styles[index % styles.length];
  return style().substring(0, 20); // Max 20 chars
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomUsers(count: number): UserTemplate[] {
  const users: UserTemplate[] = [];
  const usedUsernames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    let username = generateUsername(firstName, lastName, i);

    // Ensure uniqueness
    let suffix = 1;
    while (usedUsernames.has(username)) {
      username = `${username}${suffix}`;
      suffix++;
    }
    usedUsernames.add(username);

    users.push({
      username,
      display_name: `${firstName} ${lastName}`,
      bio: randomElement(BIOS),
      city: randomElement(['New York', 'Brooklyn', 'Queens', 'Bronx']),
      state: 'NY',
      dietary_restrictions: randomElement(DIETARY_RESTRICTIONS),
      disliked_cuisines: randomElement(DISLIKED_CUISINES),
      avatar_id: Math.floor(Math.random() * 70) + 1, // Pravatar has 70 images
    });
  }

  return users;
}

// ============================================================================
// Database Operations
// ============================================================================

function generateUUID(index: number): string {
  // Generate deterministic UUIDs for demo purposes
  // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const hex = index.toString(16).padStart(12, '0');
  return `00000000-0000-0000-0000-${hex}`;
}

async function insertUsers(pool: pg.Pool, users: UserTemplate[]): Promise<number> {
  console.log(`\n💾 Inserting ${users.length} users into Supabase...`);

  let insertedCount = 0;
  let skippedCount = 0;

  // Drop FK constraint to auth.users for demo seeding
  console.log('   Temporarily dropping auth.users FK constraint...');
  await pool.query('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey');

  // Insert each user individually to prevent batch failure
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const userId = generateUUID(i + 1);

    try {
      const result = await pool.query(
        `INSERT INTO public.users (
          id, username, display_name, bio, avatar,
          city, state,
          dietary_restrictions, disliked_cuisines,
          is_tastemaker,
          member_since, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        ON CONFLICT DO NOTHING
        RETURNING id`,
        [
          userId,
          u.username,
          u.display_name,
          u.bio,
          `https://i.pravatar.cc/300?img=${u.avatar_id}`,
          u.city,
          u.state,
          u.dietary_restrictions,
          u.disliked_cuisines,
          u.is_tastemaker || false,
          new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        ]
      );

      if (result.rowCount && result.rowCount > 0) {
        insertedCount++;
      }
    } catch (err) {
      skippedCount++;
      // Only log first few errors
      if (skippedCount <= 5) {
        console.error(`   ⚠️  Skipped: ${u.username} - ${(err as Error).message.split('\n')[0]}`);
      }
    }

    // Progress indicator
    if ((i + 1) % 1000 === 0) {
      console.log(`   Progress: ${i + 1}/${users.length} (${insertedCount} inserted, ${skippedCount} skipped)`);
    }
  }

  if (skippedCount > 5) {
    console.log(`   ... and ${skippedCount - 5} more skipped`);
  }
  console.log(`✅ Inserted ${insertedCount} users (${skippedCount} skipped)`);

  return insertedCount;
}

async function createFollowRelationships(pool: pg.Pool): Promise<number> {
  console.log('\n🔗 Creating follow relationships...');

  const client = await pool.connect();
  let totalFollowCount = 0;

  try {
    // Get all user IDs
    const usersResult = await client.query(
      'SELECT id, username FROM public.users ORDER BY member_since'
    );
    const users = usersResult.rows;

    if (users.length < 2) {
      console.log('   Not enough users to create relationships');
      return 0;
    }

    await client.query('BEGIN');

    // Each user follows 20-50% of other users
    for (const user of users) {
      const otherUsers = users.filter(u => u.id !== user.id);
      const numToFollow = Math.floor(otherUsers.length * (0.2 + Math.random() * 0.3));
      const usersToFollow = otherUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, numToFollow);

      for (const followee of usersToFollow) {
        try {
          await client.query(
            `INSERT INTO public.user_follows (follower_id, following_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [user.id, followee.id]
          );
          totalFollowCount++;
        } catch {
          // Ignore duplicates
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Created ${totalFollowCount} follow relationships`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return totalFollowCount;
}

async function clearUsers(pool: pg.Pool): Promise<void> {
  console.log('\n🗑️  Clearing existing user data...');
  await pool.query('DELETE FROM public.user_follows');
  await pool.query('DELETE FROM public.users');
  console.log('✅ Cleared');
}

async function getUserCount(pool: pg.Pool): Promise<number> {
  const result = await pool.query('SELECT COUNT(*) FROM public.users');
  return parseInt(result.rows[0].count);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  const extraUserCount = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1]) || 30
    : 30;
  const shouldClear = args.includes('--clear');
  const skipFollows = args.includes('--no-follows');

  console.log('👤 Beli User Seeder');
  console.log('══════════════════════════════════════════\n');
  console.log(`   Core users: ${CORE_USERS.length}`);
  console.log(`   Tastemakers: ${TASTEMAKER_USERS.length}`);
  console.log(`   Additional random users: ${extraUserCount}`);
  console.log(`   Clear existing: ${shouldClear}`);
  console.log(`   Create follows: ${!skipFollows}`);

  const connectionString = process.env.POSTGRES_CONNECTION_STR;
  if (!connectionString) {
    console.error('\n❌ Error: POSTGRES_CONNECTION_STR not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    await pool.query('SELECT 1');
    console.log('\n✅ Connected to Supabase PostgreSQL');

    const beforeCount = await getUserCount(pool);
    console.log(`📊 Current user count: ${beforeCount}`);

    if (shouldClear) {
      await clearUsers(pool);
    }

    // Combine all users
    const allUsers = [
      ...CORE_USERS,
      ...TASTEMAKER_USERS,
      ...generateRandomUsers(extraUserCount),
    ];

    // Insert users
    const insertedCount = await insertUsers(pool, allUsers);

    // Create follow relationships
    if (!skipFollows) {
      await createFollowRelationships(pool);
    }

    const afterCount = await getUserCount(pool);
    console.log(`\n📊 Final user count: ${afterCount} (+${afterCount - beforeCount})`);

    console.log('\n══════════════════════════════════════════');
    console.log('✅ User seeding complete!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
