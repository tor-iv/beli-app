# Beli-Web Search Architecture

## Overview

Beli-web uses a **dual-backend search system** with automatic failover:
- **Primary**: Elasticsearch (via Bonsai.io in production)
- **Fallback**: Supabase PostgreSQL

---

## Why Elasticsearch? (For Founders)

**Every Beli search = Text + Location**. Users search for "pizza near me" or "sushi in Brooklyn" — combined geo + text queries are ES's sweet spot.

### The Key Difference

| Query Type | PostgreSQL | Elasticsearch | Winner |
|------------|------------|---------------|--------|
| Autocomplete ("piz") | 40-100ms | 5-15ms | **ES 5-8x faster** |
| Fuzzy/typo ("itlaian") | 80-200ms | 10-30ms | **ES 3-6x faster** |
| Geo + Text ("pizza near me") | Two operations | Single pass | **ES optimized** |
| Under load (20 concurrent) | Connection pool stress | Built for concurrency | **ES handles scale** |

### Why This Matters

1. **Combined geo+text is the default** — ES handles in one optimized pass, PG needs two steps
2. **Autocomplete must be instant** — ES edge n-grams are pre-computed at index time
3. **Typo tolerance is expected** — ES fuzzy matching with `fuzziness: AUTO`
4. **Scale to millions of users** — ES is built for high concurrency

### Benchmark Dashboard

Test it yourself: **`/dev/search-benchmark`**

- Interactive side-by-side comparison
- Stress test with 20 concurrent queries
- Real data from production (~5,600 restaurants)

---

## Search API

**Endpoint**: `GET /api/search`

| Parameter | Description | Example |
|-----------|-------------|---------|
| `q` | Search query (required) | `?q=pizza` |
| `autocomplete` | Fast suggestion mode | `?autocomplete=true` |
| `limit` | Max results (default: 20) | `?limit=10` |
| `offset` | Pagination offset | `?offset=20` |
| `cuisine` | Filter by cuisine | `?cuisine=italian,japanese` |
| `priceRange` | Price filter | `?priceRange=$$,$$$` |
| `neighborhood` | Location filter | `?neighborhood=SoHo` |
| `minRating` | Minimum rating (0-10) | `?minRating=7.5` |
| `lat/lon/distance` | Geo-search | `?lat=40.758&lon=-73.98&distance=2km` |
| `status` | Check provider status | `?status=true` |

## Key Files

| File | Purpose |
|------|---------|
| `app/api/search/route.ts` | API endpoint |
| `lib/search/index.ts` | Unified search service with failover |
| `lib/search/supabase-search.ts` | PostgreSQL fallback |
| `lib/elasticsearch/client.ts` | Elasticsearch client |
| `lib/services/restaurants/RestaurantService.ts` | Restaurant service layer |
| `lib/hooks/use-restaurants.ts` | React Query hooks |
| `app/search/page.tsx` | Search UI |

## Provider Configuration

Set `SEARCH_PROVIDER` in `.env.local`:
- `auto` (default) — Try Elasticsearch, fallback to Supabase
- `elasticsearch` — Force Elasticsearch only
- `supabase` — Force PostgreSQL only

## Elasticsearch Features

- **Full-text search** with fuzzy matching (`fuzziness: AUTO`)
- **Autocomplete** via edge n-gram analyzer
- **Geo-distance search** with distance sorting
- **Aggregations** for faceted filters (cuisine, price, neighborhood)
- **Field boosting**: name^3, cuisine^1.5

## Supabase Fallback

- Text search via `ILIKE` pattern matching
- Array overlap for cuisine filtering
- Sorted by rating (no relevance scoring)
- Limited geo-filtering (requires PostGIS)

## Data Sync

Sync restaurants from Supabase → Elasticsearch:

```bash
cd supabase/scripts
npx ts-node sync-to-elasticsearch.ts
npx ts-node sync-to-elasticsearch.ts --recreate-index  # Full rebuild
```

## Local Development

Start Elasticsearch locally:

```bash
docker-compose up elasticsearch
# Optional: Add Kibana for debugging
docker-compose --profile debug up
```

## Caching Strategy

- Elasticsearch health check: cached 30 seconds
- React Query stale times:
  - Restaurant data: 10 minutes
  - Trending/recommendations: 5 minutes
- Query keys include filters for cache invalidation
