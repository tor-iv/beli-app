# Beli Supabase Backend

Complete Supabase backend for the Beli restaurant discovery app with PostgreSQL + PostGIS, Row Level Security, and Edge Functions.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              CLIENT APPS                                │
│   React Native (Mobile)  +  Next.js (Web)              │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌─────────────────┐
│  Supabase    │      │ Edge Functions  │
│  Auto API    │      │ (Deno/TS)       │
│              │      │                 │
│ Simple CRUD  │      │ Custom Logic:   │
│ + RLS        │      │ - Nearby search │
│              │      │ - Group match   │
└──────────────┘      └─────────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
            ┌───────────────┐
            │   PostgreSQL  │
            │   + PostGIS   │
            │   + RLS       │
            └───────────────┘
```

## 📁 Project Structure

```
supabase/
├── migrations/                    # Database schema (version controlled)
│   ├── 00001_initial_setup.sql           # Extensions & ENUMs
│   ├── 00002_restaurants.sql             # Restaurant & MenuItem tables
│   ├── 00003_users.sql                   # User profiles + auth trigger
│   ├── 00004_user_restaurant_relation.sql # Lists, been, want-to-try
│   ├── 00005_reviews_and_feed.sql        # Reviews, feed, notifications
│   ├── 00006_tastemakers_and_features.sql # Tastemakers, reservations
│   ├── 00007_rls_policies.sql            # Row Level Security
│   └── 00008_functions.sql               # PostgreSQL functions
├── functions/                     # Edge Functions (Deno)
│   ├── nearby-restaurants/
│   ├── search-restaurants/
│   └── group-dinner-match/
├── seed.sql                       # Sample data for development
├── config.toml                    # Supabase project configuration
└── .env.example                   # Environment variables template
```

## 🚀 Setup

### Prerequisites

1. **Supabase CLI**
   ```bash
   brew install supabase/tap/supabase
   # or
   npm install -g supabase
   ```

2. **Docker Desktop** (for local Supabase)
   - Download from https://docker.com

### Installation

```bash
# 1. Start local Supabase (this will take a few minutes first time)
supabase start

# 2. Apply migrations
supabase db reset

# 3. Seed sample data
psql postgresql://postgres:postgres@localhost:54322/postgres -f seed.sql

# 4. Get your API keys (copy these to .env)
supabase status
```

Expected output:
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJhbGci...
service_role key: eyJhbGci...
```

### Configure Frontend

Create `.env` file in your frontend apps (Next.js / React Native):

```bash
# Copy from `supabase status` output
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# For server-side operations (Next.js API routes / Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## 📊 Database Schema

### Core Tables

**restaurants** - Restaurant data (fat model with embedded location)
- PostGIS geography for geospatial queries
- JSON fields for flexible arrays (hours, tags, images)
- Denormalized ratings for performance

**menu_items** - Menu items (separate due to complexity)

**users** - User profiles (extends `auth.users`)
- Auto-created via trigger on signup
- JSONB stats field (denormalized counts)

**user_restaurant_relations** - Been/Want-to-try/Recommended
- Triggers update user stats automatically

**reviews** - Restaurant reviews
- Triggers update restaurant ratings automatically

**feed_items** - Social activity feed
- Arrays for likes/bookmarks (fast queries)

**lists** - User-created lists

**tastemaker_posts** - Content from food experts

**reservations** - Reservation sharing feature

### Key Design Decisions

**1. Denormalized "Fat Model" (Restaurant table)**
- ✅ Single table queries (no JOINs)
- ✅ Embedded location fields
- ✅ JSON for arrays (images, tags, cuisines)
- ❌ Slight data duplication (city names repeated)
- **Why**: 95% read workload benefits from avoiding JOINs

**2. PostGIS for Geospatial**
- ✅ Sub-100ms "nearby" queries even at 1M+ restaurants
- ✅ Accurate distance calculations (geography type)
- ✅ GIST spatial index
- **Why**: Core feature is location-based discovery

**3. Row Level Security (RLS)**
- ✅ Database-level permission enforcement
- ✅ Can't be bypassed by compromised frontend
- ✅ Policies written in SQL
- **Why**: Security best practice for Supabase

**4. Triggers for Denormalized Counts**
- ✅ Automatic stat updates (follower count, review count)
- ✅ No app logic needed
- ❌ Slightly slower writes
- **Why**: Read-heavy app benefits from cached counts

## 🔐 Authentication

Supabase Auth is configured with:

- ✅ Email/password authentication
- ✅ OAuth providers (configure in dashboard): Google, Apple, GitHub
- ✅ Magic link (passwordless) login
- ✅ Auto user profile creation (via trigger)

### Signup Flow

1. User signs up → `auth.users` record created by Supabase
2. Trigger `handle_new_user()` fires
3. Creates matching `public.users` profile
4. Auto-generates unique username from email
5. JWT token includes `user.id` for RLS policies

### Using Auth in Frontend

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()
```

## 📡 API Usage

### Option 1: Auto-Generated REST API

Supabase automatically generates REST endpoints for all tables:

```typescript
// Get all restaurants
const { data } = await supabase
  .from('restaurants')
  .select('*')

// Get restaurant by ID
const { data } = await supabase
  .from('restaurants')
  .select('*')
  .eq('id', restaurantId)
  .single()

// Create review
const { data } = await supabase
  .from('reviews')
  .insert({
    user_id: userId,
    restaurant_id: restaurantId,
    rating: 8.5,
    content: 'Great food!',
  })

// Get user's feed
const { data } = await supabase.rpc('user_feed', {
  for_user_id: userId,
  result_limit: 20,
})
```

### Option 2: PostgreSQL Functions (RPC)

Call custom PostgreSQL functions:

```typescript
// Nearby restaurants (PostGIS)
const { data } = await supabase.rpc('nearby_restaurants', {
  user_lat: 40.7580,
  user_lng: -73.9855,
  radius_miles: 2.0,
  min_rating: 7.5,
  result_limit: 20,
})

// Advanced search
const { data } = await supabase.rpc('search_restaurants', {
  search_query: 'pizza',
  filter_city: 'New York',
  filter_price: ['$', '$$'],
  min_rating: 8.0,
})

// Trending restaurants
const { data } = await supabase.rpc('trending_restaurants', {
  result_limit: 10,
})

// User match percentage
const { data: matchPercent } = await supabase.rpc('user_match_percentage', {
  user1_id: currentUserId,
  user2_id: otherUserId,
})

// Leaderboard
const { data } = await supabase.rpc('leaderboard', {
  metric: 'beenCount',
  result_limit: 50,
})
```

### Option 3: Edge Functions

For complex business logic:

```bash
# Call nearby restaurants edge function
curl -X POST http://localhost:54321/functions/v1/nearby-restaurants \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7580, "lng": -73.9855, "radius": 2.0}'

# Call search edge function
curl http://localhost:54321/functions/v1/search-restaurants?q=pizza&city=New%20York
```

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Example policies:

**Users can only update their own profile:**
```sql
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);
```

**Users can view public lists and their own private lists:**
```sql
CREATE POLICY "Users can view public lists and own lists"
ON public.lists FOR SELECT
USING (is_public = true OR auth.uid() = user_id);
```

**RLS is enforced at database level** - even if frontend is compromised, users can't access unauthorized data.

## 🧪 Testing API

### Use Supabase Studio

1. Open http://localhost:54323
2. Navigate to "Table Editor" → Browse tables
3. Navigate to "SQL Editor" → Run queries
4. Navigate to "API Docs" → Test endpoints

### Test PostgreSQL Functions

```sql
-- Test nearby restaurants
SELECT * FROM public.nearby_restaurants(40.7580, -73.9855, 2.0, 7.5, 10);

-- Test search
SELECT * FROM public.search_restaurants('pizza', NULL, NULL, 'New York', NULL, NULL, 8.0, 10, 0);

-- Test trending
SELECT * FROM public.trending_restaurants(10);
```

### Test with cURL

```bash
# Get restaurants
curl "http://localhost:54321/rest/v1/restaurants?select=*" \
  -H "apikey: $ANON_KEY"

# Call RPC function
curl -X POST "http://localhost:54321/rest/v1/rpc/nearby_restaurants" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_lat":40.7580,"user_lng":-73.9855,"radius_miles":2.0}'
```

## 🛠️ Development Workflow

### Create New Migration

```bash
supabase migration new add_feature_name
# Edit supabase/migrations/[timestamp]_add_feature_name.sql
supabase db reset  # Apply all migrations
```

### Deploy Edge Function

```bash
# Deploy single function
supabase functions deploy nearby-restaurants

# Deploy all functions
supabase functions deploy
```

### Push to Production

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push database changes
supabase db push

# Deploy edge functions
supabase functions deploy
```

## 📈 Performance Optimization

### Database

- ✅ **Strategic indexing**: 9 indexes on restaurants table
- ✅ **Composite indexes**: (city, rating), (neighborhood, rating)
- ✅ **PostGIS spatial index**: GIST on coordinates
- ✅ **GIN indexes**: JSON field searches (cuisine, tags)
- ✅ **Denormalized counts**: Cached stats in user.stats JSONB

### Queries

- ✅ **Use indexes**: Filter by indexed columns
- ✅ **Limit results**: Always use pagination
- ✅ **Select specific columns**: Don't use `select('*')` in production
- ✅ **Batch operations**: Use `upsert` for bulk updates

## 🎯 Next Steps

1. **Connect Frontend**: Update React Native/Next.js to use Supabase SDK
2. **Implement Auth UI**: Build login/signup screens
3. **Add Complex Logic**: Implement group dinner matching in Edge Function
4. **Enable OAuth**: Configure Google/Apple OAuth in Supabase dashboard
5. **Add Real-time**: Subscribe to feed updates with Supabase realtime
6. **Deploy**: Push to Supabase Cloud for production

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostGIS Documentation**: https://postgis.net/documentation/
- **SQL Reference**: https://www.postgresql.org/docs/
- **Edge Functions Guide**: https://supabase.com/docs/guides/functions

## 💡 Key Takeaways

**Why Supabase?**
- ✅ 10x faster development (auto REST API + auth)
- ✅ PostgreSQL + PostGIS (same design as Django backend)
- ✅ Real-time subscriptions built-in
- ✅ Row Level Security (database-enforced permissions)
- ✅ Scales automatically
- ✅ Can migrate to self-hosted if needed

**Architecture Philosophy:**
- **Fat model** - Denormalized for read performance
- **RLS policies** - Database enforces permissions
- **PostgreSQL functions** - Complex queries in database
- **Edge functions** - Custom business logic in TypeScript
- **Migrations** - Version-controlled schema changes

This setup handles 0 → 1M users with minimal changes!
