# Beli App - Backend Development TODO

Complete checklist for building out the Supabase backend and integrating with frontend apps.

---

## 🎯 Phase 1: Supabase Setup (Local Development)

### Prerequisites Setup
- [ ] Install Supabase CLI
  ```bash
  brew install supabase/tap/supabase
  # or: npm install -g supabase
  ```
- [ ] Install Docker Desktop (required for local Supabase)
  - Download from https://docker.com
  - Ensure Docker is running before starting Supabase

### Initialize Supabase
- [ ] Start local Supabase instance
  ```bash
  cd supabase
  supabase start
  # ⏱️ First time takes 5-10 minutes (downloads Docker images)
  ```
- [ ] Verify all services are running
  ```bash
  supabase status
  ```
  Should show:
  - ✅ API URL: http://localhost:54321
  - ✅ Studio URL: http://localhost:54323
  - ✅ DB URL: postgresql://postgres:postgres@localhost:54322/postgres

### Apply Database Schema
- [ ] Run migrations (creates all tables, functions, RLS policies)
  ```bash
  supabase db reset
  ```
- [ ] Verify migrations applied successfully
  - Check output shows 8 migrations applied
  - No errors in console

### Seed Sample Data
- [ ] Load sample restaurants
  ```bash
  psql postgresql://postgres:postgres@localhost:54322/postgres -f seed.sql
  ```
- [ ] Verify data loaded
  - Open http://localhost:54323 (Supabase Studio)
  - Navigate to "Table Editor" → "restaurants"
  - Should see 5 sample restaurants (Joe's Pizza, Le Bernardin, etc.)

### Configure Environment Variables
- [ ] Copy API keys from `supabase status` output
- [ ] Create `.env` files in frontend apps:

  **For beli-web/.env.local:**
  ```env
  NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (copy from supabase status)
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (copy from supabase status)
  ```

  **For beli-native/.env:**
  ```env
  EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
  ```

### Test Database & API
- [ ] Open Supabase Studio: http://localhost:54323
- [ ] Test SQL queries in "SQL Editor":
  ```sql
  SELECT * FROM public.restaurants LIMIT 5;
  SELECT * FROM public.nearby_restaurants(40.7580, -73.9855, 2.0, 0.0, 10);
  ```
- [ ] Test REST API with curl:
  ```bash
  curl "http://localhost:54321/rest/v1/restaurants?select=*" \
    -H "apikey: YOUR_ANON_KEY"
  ```

---

## 🔨 Phase 2: Frontend Integration (Next.js Web)

### Install Dependencies
- [ ] Install Supabase client in Next.js app
  ```bash
  cd beli-web
  npm install @supabase/supabase-js @supabase/ssr
  ```

### Create Supabase Client
- [ ] Create `beli-web/lib/supabase/client.ts` (browser client)
  ```typescript
  import { createBrowserClient } from '@supabase/ssr'

  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  ```

- [ ] Create `beli-web/lib/supabase/server.ts` (server client for App Router)
  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { cookies } from 'next/headers'

  export function createClient() {
    const cookieStore = cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
  }
  ```

### Replace Mock Services (Incremental)

#### Step 1: Restaurant Service
- [ ] Update `lib/services/restaurants/RestaurantService.ts`
  - Replace mock data with Supabase queries
  - Test: `getAllRestaurants()`, `getRestaurantById()`
  - Test: nearby restaurants using RPC function

#### Step 2: User Service
- [ ] Update `lib/services/users/UserService.ts`
  - Replace mock users with Supabase queries
  - Implement `getCurrentUser()` using `auth.getUser()`

#### Step 3: Lists & Relations
- [ ] Update `lib/services/user-restaurant/UserRestaurantService.ts`
  - CRUD operations for user-restaurant relations
  - Test: Add to "Been", "Want to try", "Recommended"

#### Step 4: Feed & Social
- [ ] Update `lib/services/feed/FeedService.ts`
  - Use `user_feed()` RPC function
  - Test: Personalized feed generation

### Update React Query Hooks
- [ ] Modify `lib/hooks/use-restaurants.ts` to use Supabase
- [ ] Modify `lib/hooks/use-user.ts` to use Supabase
- [ ] Test all pages that use these hooks still work

### Test Web App Functionality
- [ ] Browse restaurants (should show real data from Supabase)
- [ ] Search restaurants (test filters)
- [ ] View restaurant details
- [ ] Test pagination

---

## 🔐 Phase 3: Authentication Implementation

### Setup Auth UI Components
- [ ] Create login page: `beli-web/app/login/page.tsx`
- [ ] Create signup page: `beli-web/app/signup/page.tsx`
- [ ] Create auth context/hook for session management

### Implement Auth Flow
- [ ] Email/Password signup
  ```typescript
  const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password123',
  })
  ```
- [ ] Email/Password login
  ```typescript
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123',
  })
  ```
- [ ] Logout functionality
- [ ] Session persistence (cookies)
- [ ] Protected routes middleware

### Configure OAuth (Optional but Recommended)
- [ ] Set up Google OAuth in Supabase dashboard
  - Get Google Client ID/Secret
  - Add to Supabase Auth settings
- [ ] Set up Apple OAuth (for iOS)
- [ ] Test social login flows

### Test Authentication
- [ ] Sign up new user → verify profile auto-created in `public.users`
- [ ] Sign in → verify session persists
- [ ] Test RLS policies (users can only edit their own data)
- [ ] Sign out → verify redirects to login

---

## 📱 Phase 4: React Native Mobile Integration

### Install Dependencies
- [ ] Install Supabase in React Native app
  ```bash
  cd beli-native
  npm install @supabase/supabase-js
  npx expo install @react-native-async-storage/async-storage
  npx expo install react-native-url-polyfill
  ```

### Create Supabase Client
- [ ] Create `beli-native/src/lib/supabase.ts`
  ```typescript
  import 'react-native-url-polyfill/auto'
  import AsyncStorage from '@react-native-async-storage/async-storage'
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  )
  ```

### Replace MockDataService
- [ ] Update `src/data/mockDataService.ts` to use Supabase
  - Or create new `src/data/supabaseService.ts`
- [ ] Test all screens still render correctly

### Implement Mobile Auth
- [ ] Create login screen
- [ ] Create signup screen
- [ ] Implement auth context
- [ ] Test session persistence across app restarts

---

## 🚀 Phase 5: Advanced Features

### Implement Real-time Updates
- [ ] Subscribe to feed updates
  ```typescript
  supabase
    .channel('feed-updates')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'feed_items'
    }, payload => {
      // Add new feed item to state
    })
    .subscribe()
  ```
- [ ] Subscribe to new followers
- [ ] Subscribe to likes/comments on user's posts

### Complete Edge Functions
- [ ] Implement Group Dinner matching algorithm in `group-dinner-match/index.ts`
  - Port logic from mobile app's GroupDinnerService
  - Test with multiple participants
- [ ] Create "What to Order" recommendation function
  - Input: restaurantId, partySize, hungerLevel
  - Output: Menu item suggestions

### Add File Upload (Photos)
- [ ] Configure Supabase Storage bucket for restaurant photos
- [ ] Configure bucket for user avatars
- [ ] Implement photo upload in review flow
- [ ] Update RLS policies for storage

### Implement Remaining Services
- [ ] Tastemaker posts (create, edit, delete)
- [ ] Notifications (mark as read, delete)
- [ ] Reservations (create, share, claim)
- [ ] Challenge goals (create, track progress)
- [ ] Search history (save, view recent searches)

---

## 📊 Phase 6: Data Migration (If switching from Mock Data)

### Export Existing Data (Optional)
- [ ] If you have valuable mock data configurations
- [ ] Export to SQL or JSON format
- [ ] Create migration script to import into Supabase

### Update Data Models
- [ ] Ensure TypeScript types match Supabase schema
  - Generate types: `supabase gen types typescript --local > types/database.types.ts`
- [ ] Update frontend types to use generated types

---

## 🧪 Phase 7: Testing & Quality Assurance

### Database Testing
- [ ] Test all PostgreSQL functions
  - `nearby_restaurants()`
  - `search_restaurants()`
  - `trending_restaurants()`
  - `user_feed()`
  - `user_match_percentage()`
  - `leaderboard()`

### API Testing
- [ ] Test CRUD operations for all tables
- [ ] Test RLS policies (ensure unauthorized access is blocked)
- [ ] Test Edge Functions
- [ ] Load testing (simulate 100+ concurrent users)

### Frontend Testing
- [ ] Test all user flows end-to-end
- [ ] Test authentication edge cases
- [ ] Test error handling (network failures, etc.)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile testing (iOS simulator, Android emulator)

---

## 🌐 Phase 8: Production Deployment

### Create Supabase Cloud Project
- [ ] Sign up at https://supabase.com
- [ ] Create new project (choose region closest to users)
- [ ] Save credentials (Project URL, anon key, service_role key)

### Link Local Project to Cloud
- [ ] Link local project
  ```bash
  supabase link --project-ref your-project-ref
  ```
- [ ] Verify connection
  ```bash
  supabase db remote commit
  ```

### Deploy Database Schema
- [ ] Push migrations to production
  ```bash
  supabase db push
  ```
- [ ] Verify all tables created in cloud dashboard

### Deploy Edge Functions
- [ ] Deploy all functions
  ```bash
  supabase functions deploy nearby-restaurants
  supabase functions deploy search-restaurants
  supabase functions deploy group-dinner-match
  ```
- [ ] Test functions in production

### Seed Production Data
- [ ] Add real restaurant data (not mock data)
- [ ] Import user data (if migrating from another system)

### Configure Production Environment Variables
- [ ] Update frontend apps with production Supabase URL
- [ ] Update API keys to production keys
- [ ] Configure OAuth redirect URLs for production domain

### Configure Domain & SSL
- [ ] Set up custom domain (optional): `api.beli.app`
- [ ] Configure CORS for production domains

### Deploy Frontend Apps
- [ ] Deploy Next.js to Vercel
  - Update environment variables in Vercel dashboard
  - Test production build
- [ ] Deploy React Native app (EAS Build or manual)
  - Update app.json with production API URL
  - Build for iOS (TestFlight) and Android (Play Console)

---

## 🔍 Phase 9: Monitoring & Optimization

### Set Up Monitoring
- [ ] Enable Supabase Dashboard monitoring
  - Track API requests
  - Monitor database performance
  - Set up alerts for errors

### Optimize Performance
- [ ] Add database indexes for slow queries
  - Use `EXPLAIN ANALYZE` to identify bottlenecks
- [ ] Enable connection pooling (PgBouncer)
- [ ] Consider read replicas if read-heavy

### Set Up Analytics
- [ ] Track user engagement metrics
- [ ] Monitor API usage (which endpoints are most used)
- [ ] Track error rates

---

## 🎯 Priority Quick Start (Do This First!)

If you want to get started quickly, focus on these essentials:

**Week 1: Supabase Setup**
1. ✅ Install Supabase CLI + Docker
2. ✅ Run `supabase start`
3. ✅ Run `supabase db reset`
4. ✅ Load seed data
5. ✅ Test in Studio (http://localhost:54323)

**Week 2: Web App Integration**
1. Install Supabase in Next.js
2. Replace RestaurantService with Supabase
3. Test restaurant browsing/search
4. Implement basic auth (email/password)

**Week 3: Mobile App Integration**
1. Install Supabase in React Native
2. Replace MockDataService
3. Test core features work
4. Implement mobile auth

**Week 4: Advanced Features**
1. Real-time feed updates
2. Complete Edge Functions
3. Photo uploads
4. Production deployment

---

## 📝 Notes & Tips

### Common Issues

**Issue: `supabase start` fails**
- ✅ Solution: Ensure Docker Desktop is running
- ✅ Solution: Run `docker ps` to verify Docker works

**Issue: Migrations fail**
- ✅ Solution: Check migration files for syntax errors
- ✅ Solution: Run `supabase db reset` to start fresh

**Issue: RLS blocks queries**
- ✅ Solution: Ensure you're authenticated (pass JWT token)
- ✅ Solution: Use service_role key for admin operations (backend only!)

**Issue: CORS errors**
- ✅ Solution: Check `config.toml` has correct origins
- ✅ Solution: Ensure Edge Functions include CORS headers

### Best Practices

- **Never commit** `.env` files with real API keys
- **Always use** anon key in frontend (never service_role key)
- **Test RLS policies** thoroughly before production
- **Use migrations** for all schema changes (never edit directly in Studio)
- **Version control** everything in `supabase/` folder

### Resources

- Supabase Docs: https://supabase.com/docs
- PostGIS Tutorial: https://postgis.net/workshops/postgis-intro/
- Next.js + Supabase: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- React Native + Supabase: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native

---

## ✅ Completion Checklist

Mark these off as you complete major milestones:

- [ ] ✅ Local Supabase running successfully
- [ ] ✅ All 8 migrations applied
- [ ] ✅ Sample data loaded
- [ ] ✅ Web app connected to Supabase
- [ ] ✅ Authentication working (email/password)
- [ ] ✅ OAuth configured (Google/Apple)
- [ ] ✅ Mobile app connected to Supabase
- [ ] ✅ Real-time updates working
- [ ] ✅ Edge Functions deployed
- [ ] ✅ Photo uploads working
- [ ] ✅ Production deployment complete
- [ ] ✅ Monitoring set up

---

**Current Status**: Phase 1 - Supabase Setup (Ready to begin!)

**Next Immediate Step**: Install Supabase CLI and Docker Desktop
