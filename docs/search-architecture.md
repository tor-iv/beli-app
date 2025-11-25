# Beli-Web Search Architecture

## Overview

Beli-web uses a **dual-backend search system** with automatic failover:
- **Primary**: Elasticsearch (via Bonsai.io in production)
- **Fallback**: Supabase PostgreSQL

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
