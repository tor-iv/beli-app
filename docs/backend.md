# Backend Architecture Overview

> **Reading time:** ~10 minutes
> **Scope:** beli-web data layer (Next.js app)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              COMPONENTS                                  │
│         (React components consume data via hooks)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────────┐  ┌────────────────────────────────┐
│         REACT QUERY HOOKS           │  │       SEARCH API               │
│          lib/hooks/*.ts             │  │    /api/search                 │
│  ┌─────────────┐  ┌─────────────┐   │  │  • Fuzzy text search           │
│  │useRestaurants│  │  useFeed   │   │  │  • Autocomplete                │
│  │  useLists   │  │  useUser   │   │  │  • Geo-distance queries        │
│  └─────────────┘  └─────────────┘   │  │  • Faceted filters             │
│   • Caching      • Optimistic UI    │  └────────────────────────────────┘
└─────────────────────────────────────┘               │
                    │                                 ▼
                    ▼                   ┌────────────────────────────────┐
┌─────────────────────────────────────┐ │     UNIFIED SEARCH SERVICE     │
│         DOMAIN SERVICES             │ │      lib/search/index.ts       │
│        lib/services/*.ts            │ │  • Auto provider selection     │
│  ┌─────────────┐  ┌─────────────┐   │ │  • ES → Supabase fallback      │
│  │RestaurantSvc│  │ UserService │   │ └────────────────────────────────┘
│  │ FeedService │  │ ListService │   │              │
│  └─────────────┘  └─────────────┘   │   ┌─────────┴─────────┐
│   • withFallback()  • 9 services    │   ▼                   ▼
└─────────────────────────────────────┘ ┌──────────┐   ┌──────────────┐
                    │                   │ELASTIC   │   │  (fallback)  │
                    │                   │SEARCH    │   │   Supabase   │
                    │                   │Bonsai.io │   │    ILIKE     │
    ┌───────────────┴───────────────┐   └──────────┘   └──────────────┘
    ▼                               ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│     SUPABASE POSTGRES       │   │        MOCK DATA            │
│       (Production)          │   │      (Demo/Dev mode)        │
│  • users, restaurants       │   │  • data/mock/*.ts           │
│  • ratings, user_follows    │   │  • 22 users, 35+ restaurants│
│  • PostgreSQL functions     │   │  • Realistic seed data      │
└─────────────────────────────┘   └─────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                    ┌─────────────────────────────┐
                    │          MAPPERS            │
                    │   lib/services/mappers/     │
                    │  • mapDbToRestaurant()      │
                    │  • mapDbToUser()            │
                    │  • Single source of truth   │
                    └─────────────────────────────┘
```

---

## Layer 1: Components

React components are the UI layer. They consume data exclusively through React Query hooks, never calling services directly.

```tsx
// Example: Restaurant list component
const { data: restaurants, isLoading, error } = useRestaurants();

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
return <RestaurantGrid items={restaurants} />;
```

Components handle loading states, error states, and rendering. All data fetching complexity is abstracted away.

---

## Layer 2: React Query Hooks

**Location:** `lib/hooks/`

Hooks wrap domain services with React Query, providing automatic caching, refetching, and mutations.

### Caching Strategy

| Domain          | Stale Time | Reason                          |
|-----------------|------------|----------------------------------|
| Restaurants     | 10 min     | Data rarely changes             |
| Feed            | 2 min      | Social activity updates often   |
| Notifications   | 30 sec     | Near real-time updates needed   |
| Leaderboard     | 5 min      | Expensive to compute            |

### Query Keys (for cache invalidation)

```typescript
['restaurants']                    // All restaurants
['restaurant', id]                 // Single restaurant
['feed', userId]                   // User's feed
['lists', userId]                  // User's lists
```

### Mutations with Optimistic Updates

For actions like "liking" a post, the UI updates instantly before the server responds:

```typescript
// Simplified pattern
useMutation({
  onMutate: () => { /* Update cache optimistically */ },
  onError: () => { /* Rollback on failure */ },
  onSuccess: () => { /* Invalidate related queries */ },
});
```

---

## Layer 3: Domain Services

**Location:** `lib/services/`

9 domain services handle all business logic. Each is a static class with async methods.

### Service List

| Service               | Responsibility                                    |
|-----------------------|---------------------------------------------------|
| UserService           | Users, follows, leaderboard, taste profiles       |
| RestaurantService     | Restaurants, search, filtering, hours/status      |
| UserRestaurantService | Been/want-to-try, ratings, rankings               |
| FeedService           | Activity feed, likes, comments, bookmarks         |
| ListService           | User lists, featured lists                        |
| TastemakerService     | Expert profiles, posts, engagement                |
| MenuService           | Restaurant menus and items                        |
| GroupDinnerService    | AI group matching, reservations                   |
| NotificationService   | User notifications                                |

### The `withFallback()` Pattern

Every database operation uses this pattern for graceful degradation:

```typescript
static async getRestaurantById(id: string): Promise<Restaurant | null> {
  const { data } = await withFallback(
    // Primary: Try Supabase
    async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return mapDbToRestaurant(data);
    },
    // Fallback: Use mock data
    () => mockRestaurants.find(r => r.id === id) || null,
    { operationName: 'getRestaurantById' }
  );
  return data;
}
```

**Benefits:**
- App works without database (demo mode)
- Graceful degradation if DB is down
- Same code path for both environments

---

## Layer 4: Data Layer

### Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE POSTGRESQL                               │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │      users       │         │   restaurants    │         │   menu_items     │
  ├──────────────────┤         ├──────────────────┤         ├──────────────────┤
  │ id (PK, UUID)    │         │ id (PK, UUID)    │◄────────│ restaurant_id(FK)│
  │ username         │         │ name             │         │ name             │
  │ display_name     │         │ cuisine (JSONB)  │         │ price            │
  │ avatar           │         │ price_range      │         │ category         │
  │ bio              │         │ neighborhood     │         │ is_vegetarian    │
  │ dietary_restrict │         │ coordinates(GEO) │         │ popularity       │
  │ is_tastemaker    │         │ rating           │         └──────────────────┘
  │ stats (JSONB)    │         │ hours (JSONB)    │
  │ watchlist[]      │         │ tags (JSONB)     │
  └────────┬─────────┘         └────────┬─────────┘
           │                            │
           │  ┌─────────────────────────┼─────────────────────────┐
           │  │                         │                         │
           ▼  ▼                         ▼                         │
  ┌──────────────────┐         ┌──────────────────┐               │
  │   user_follows   │         │     ratings      │               │
  ├──────────────────┤         ├──────────────────┤               │
  │ follower_id (FK) │─────────│ user_id (FK)     │───────────────┘
  │ following_id(FK) │         │ restaurant_id(FK)│
  │ created_at       │         │ status (enum)    │  status: been | want_to_try | recommended
  └──────────────────┘         │ rating (0-10)    │
                               │ notes            │
                               │ visit_date       │
                               │ companions[]     │
                               │ tags[]           │
                               └──────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  VIEW: user_stats          │  FUNCTION: get_user_feed(user_id, limit)       │
  │  • followers_count         │  • Returns activity from followed users        │
  │  • following_count         │  • Joins ratings → users → restaurants         │
  │  • been_count              │  • Orders by created_at DESC                   │
  │  • want_to_try_count       │                                                │
  └─────────────────────────────────────────────────────────────────────────────┘
```

### Key Database Features

| Feature           | Description                                                |
|-------------------|------------------------------------------------------------|
| PostGIS           | `coordinates` column enables geo-distance queries          |
| JSONB columns     | `cuisine`, `tags`, `hours` for flexible schemas            |
| Triggers          | Auto-update `stats` when follows/ratings change            |
| Row Level Security| Users can only modify their own data                       |
| Views             | `user_stats` computes counts on-read (no stale data)       |

### Supabase PostgreSQL (Production)

**Tables:** `users`, `restaurants`, `ratings`, `user_follows`, `menu_items`
**Views:** `user_stats` (aggregated follower/following counts)
**Functions:** `get_user_feed()`, `get_friend_recommendations()`

### Mock Data (Development)

**Location:** `data/mock/`

| File                        | Contents                              |
|-----------------------------|---------------------------------------|
| users.ts                    | 22 user profiles                      |
| restaurants.ts              | 35+ NYC restaurants                   |
| userRestaurantRelations.ts  | Ratings with notes, tags, companions  |
| activities.ts               | Social feed items                     |
| tastemakers.ts              | 13 food expert profiles               |

### Mappers

**Location:** `lib/services/mappers/`

All database rows are converted to frontend types through centralized mappers:

```typescript
mapDbToRestaurant(row)  → Restaurant
mapDbToUser(row)        → User
mapDbToFeedItem(row)    → FeedItem
```

This ensures consistent type transformations and a single place to update when schemas change.

---

## Search System (Elasticsearch)

**Location:** `lib/search/`, `lib/elasticsearch/`

The search system runs **parallel** to the domain services layer, providing advanced search capabilities via a dedicated REST API.

### Dual-Backend Architecture

```
Search Request → Unified Service → Elasticsearch (Bonsai.io)
                                          ↓ (if unavailable)
                                   Supabase ILIKE fallback
```

| Provider      | Features                                       | When Used              |
|---------------|------------------------------------------------|------------------------|
| Elasticsearch | Fuzzy matching, autocomplete, geo-search, aggregations | Production (default) |
| Supabase      | Basic ILIKE text matching, sorted by rating    | Fallback / demo mode   |

### Search API Endpoint

**`GET /api/search`** with parameters:

| Parameter     | Example                  | Description                    |
|---------------|--------------------------|--------------------------------|
| `q`           | `?q=pizza`               | Search query                   |
| `autocomplete`| `?autocomplete=true`     | Fast type-ahead mode           |
| `cuisine`     | `?cuisine=italian,japanese` | Filter by cuisine           |
| `priceRange`  | `?priceRange=$$,$$$`     | Filter by price                |
| `lat/lon`     | `?lat=40.7&lon=-73.9`    | Geo-distance search            |

### Provider Selection

Set `SEARCH_PROVIDER` environment variable:
- `auto` (default) — Try Elasticsearch, fallback to Supabase
- `elasticsearch` — Force Elasticsearch only
- `supabase` — Force PostgreSQL only

### Key Files

| File                          | Purpose                              |
|-------------------------------|--------------------------------------|
| `lib/search/index.ts`         | Unified search with auto-failover   |
| `lib/elasticsearch/client.ts` | ES client (fuzzy, autocomplete, geo)|
| `lib/search/supabase-search.ts` | PostgreSQL fallback               |
| `app/api/search/route.ts`     | REST API endpoint                   |

> **Detailed documentation:** See [search-architecture.md](./search-architecture.md)

---

## Key Patterns Summary

| Pattern              | Purpose                                           |
|----------------------|---------------------------------------------------|
| `withFallback()`     | DB-first with mock fallback                       |
| Static services      | No instantiation, clean imports                   |
| Query key hierarchy  | Efficient cache invalidation                      |
| Optimistic updates   | Instant UI feedback on mutations                  |
| Centralized mappers  | Single source of truth for type conversion        |
| 50ms delay           | Simulated network latency for realistic UX        |

---

## Service Dependency Phases

Services are organized by their dependencies on other services:

| Phase | Services                          | Dependencies           |
|-------|-----------------------------------|------------------------|
| 1     | NotificationService, ListService  | None                   |
| 2     | UserService, RestaurantService    | Phase 1                |
| 3     | UserRestaurantService, FeedService| Phases 1-2             |
| 4     | TastemakerService, MenuService    | Phases 1-3             |
| 5     | GroupDinnerService                | All previous phases    |

---

## Environment Variables

| Variable              | Required | Description                              |
|-----------------------|----------|------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key         |
| `ELASTICSEARCH_URL`   | No       | ES URL (e.g., Bonsai.io cluster)         |
| `SEARCH_PROVIDER`     | No       | `auto` / `elasticsearch` / `supabase`    |

**Demo mode:** If Supabase variables are missing, the app falls back to mock data automatically.

---

## Quick Reference

```bash
# Key directories
lib/hooks/          # React Query hooks
lib/services/       # Domain services
lib/search/         # Unified search service
lib/elasticsearch/  # Elasticsearch client
data/mock/          # Mock data files
supabase/migrations/ # Database schema

# Import examples
import { useRestaurants } from '@/lib/hooks';
import { RestaurantService } from '@/lib/services';
import { searchRestaurants, autocomplete } from '@/lib/search';
```

---

*Last updated: November 2024*
