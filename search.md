# Beli Search Infrastructure: Elasticsearch Migration & Multi-Language Support

## Executive Summary

This document outlines the migration from PostgreSQL/PostGIS-only search to a hybrid PostgreSQL + Elasticsearch architecture, and the addition of multi-language support for restaurant discovery.

**Key Decisions:**
- PostgreSQL remains the source of truth for all data
- Elasticsearch handles search, autocomplete, and faceted filtering
- PostGIS continues to handle precise geospatial calculations where needed
- Translation uses a hybrid approach: cached translations + on-demand translation API

---

## Implementation Status

**IMPLEMENTED** (as of 2025-11-24):

| Component | Status | Location |
|-----------|--------|----------|
| PostgreSQL (Supabase) | Done | `db.uxbgemvlilphfjyoeiug.supabase.co` |
| PostGIS extension | Done | Enabled in Supabase |
| Simplified schema (5 tables) | Done | `supabase/migrations/00009_simplify_schema.sql` |
| 414 NYC restaurants seeded | Done | `supabase/seed-nyc-restaurants.sql` |
| 10 demo users + ratings | Done | `supabase/seed-users.sql`, `seed-ratings.sql` |
| Elasticsearch (Docker) | Done | `docker-compose.yml` |
| ES sync script | Done | `supabase/scripts/sync-to-elasticsearch.ts` |
| ES client (Next.js) | Done | `beli-web/lib/elasticsearch/client.ts` |
| Search API route | Done | `beli-web/app/api/search/route.ts` |
| Health check API | Done | `beli-web/app/api/health/route.ts` |
| Supabase client | Done | `beli-web/lib/supabase/client.ts` |

**NOT YET IMPLEMENTED:**
- Multi-language support
- CDC with Debezium (using application-level sync instead)
- Translation services

---

## Quick Start Guide

### 1. Start Elasticsearch (Local Docker)

```bash
cd /Users/torcox/beli-app
docker compose up -d elasticsearch
```

Verify it's running:
```bash
curl http://localhost:9200/_cluster/health
```

Optional: Start Kibana for debugging:
```bash
docker compose --profile debug up -d
# Access at http://localhost:5601
```

### 2. Sync Restaurants to Elasticsearch

```bash
cd supabase/scripts
npm install  # First time only
npm run sync:elasticsearch
```

To recreate the index (e.g., after schema changes):
```bash
npm run sync:elasticsearch:recreate
```

### 3. Configure Environment Variables

In `beli-web/.env.local`:
```bash
# Supabase (get anon key from https://app.supabase.com/project/uxbgemvlilphfjyoeiug/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://uxbgemvlilphfjyoeiug.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Elasticsearch (local Docker)
ELASTICSEARCH_URL=http://localhost:9200
```

### 4. Test the Search API

```bash
# Start the Next.js dev server
cd beli-web && npm run dev

# Test search
curl "http://localhost:3000/api/search?q=pizza"

# Test autocomplete
curl "http://localhost:3000/api/search?q=piz&autocomplete=true"

# Test fuzzy search (misspelling)
curl "http://localhost:3000/api/search?q=piza"

# Test geo-search (near Times Square)
curl "http://localhost:3000/api/search?q=sushi&lat=40.758&lon=-73.9855&distance=2km"

# Test with filters
curl "http://localhost:3000/api/search?cuisine=Pizza,Italian&minRating=8"

# Health check
curl "http://localhost:3000/api/health"
```

---

## Database Schema (Simplified)

After migration 00009, we have 5 core tables:

| Table | Purpose | Records |
|-------|---------|---------|
| `restaurants` | Restaurant data with PostGIS coordinates | 414 |
| `users` | User profiles | 10 (demo) |
| `ratings` | User-restaurant relationships (been/want_to_try) | 27 |
| `user_follows` | Social graph | 18 |
| `menu_items` | Menu items for "What to Order" feature | 0 |

**Key Design Decisions:**
- Feed is computed via `get_user_feed()` function, not stored in a table
- User stats are computed via `user_stats` view
- Ratings table combines "been" and "want_to_try" with a status column

---

## Search API Reference

### `GET /api/search`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | "" | Search query |
| `autocomplete` | boolean | false | Return name suggestions only |
| `limit` | number | 20 | Max results (max 100) |
| `offset` | number | 0 | Pagination offset |
| `cuisine` | string | - | Filter by cuisine (comma-separated) |
| `priceRange` | string | - | Filter by price ($,$$,$$$,$$$$) |
| `neighborhood` | string | - | Filter by neighborhood |
| `minRating` | number | - | Minimum rating (0-10) |
| `lat` | number | - | Latitude for geo-search |
| `lon` | number | - | Longitude for geo-search |
| `distance` | string | "5km" | Geo-search radius |

**Response (standard search):**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "JOE'S PIZZA",
      "cuisine": ["Pizza", "Italian"],
      "neighborhood": "Greenwich Village",
      "rating": 9.1,
      "score": 3.45
    }
  ],
  "total": 31,
  "took": 12,
  "aggregations": {
    "cuisines": [{"key": "Pizza", "doc_count": 31}],
    "neighborhoods": [{"key": "SoHo", "doc_count": 5}],
    "priceRanges": [{"key": "$", "doc_count": 20}]
  },
  "type": "standard"
}
```

**Response (autocomplete):**
```json
{
  "suggestions": [
    {"id": "uuid", "name": "JOE'S PIZZA", "neighborhood": "Greenwich Village"}
  ]
}
```

---

## Data Sync Strategy

Currently using **application-level sync** (Option B from the original plan):

1. PostgreSQL (Supabase) is the source of truth
2. Manual sync script pushes to Elasticsearch
3. Run sync after restaurant data changes

**Sync Commands:**
```bash
# Full sync (non-destructive)
npm run sync:elasticsearch

# Recreate index (destroys and rebuilds)
npm run sync:elasticsearch:recreate
```

**Future Migration Path:**
When scale requires real-time sync, migrate to CDC with Debezium:
```
PostgreSQL WAL → Debezium → Kafka → ES Connector → Elasticsearch
```

---

## Troubleshooting

### Elasticsearch not running
```bash
docker compose up -d elasticsearch
docker logs beli-elasticsearch
```

### Index out of sync
```bash
# Check document counts
curl http://localhost:9200/restaurants/_count
psql -c "SELECT COUNT(*) FROM restaurants;"

# If mismatch, re-sync
npm run sync:elasticsearch:recreate
```

### Search returns 0 results
1. Check ES is running: `curl http://localhost:9200`
2. Check index exists: `curl http://localhost:9200/restaurants/_count`
3. Force refresh: `curl -X POST http://localhost:9200/restaurants/_refresh`

### API returns 503
- Elasticsearch is not running
- Fix: `docker compose up -d elasticsearch`

---

## Part 1: Elasticsearch Migration

### 1.1 Current Architecture (Assumed)

```
┌─────────────┐      ┌─────────────────────────────┐
│   Client    │─────▶│      API Server             │
└─────────────┘      └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │   PostgreSQL + PostGIS      │
                     │   - restaurants table       │
                     │   - reviews table           │
                     │   - users table             │
                     │   - Full-text search (slow) │
                     │   - Geo queries             │
                     └─────────────────────────────┘
```

**Current Pain Points:**
- PostgreSQL full-text search lacks relevance tuning
- No fuzzy matching for typos
- Faceted search requires multiple queries or complex CTEs
- Autocomplete is slow without dedicated optimization
- Scaling reads requires read replicas (vertical scaling)

### 1.2 Target Architecture

```
┌─────────────┐      ┌─────────────────────────────┐
│   Client    │─────▶│      API Server             │
└─────────────┘      └──────────┬──────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
     ┌──────────────────────┐    ┌──────────────────────┐
     │    Elasticsearch     │    │  PostgreSQL/PostGIS  │
     │    (Search Reads)    │    │  (Source of Truth)   │
     │                      │    │                      │
     │  - Full-text search  │    │  - All writes        │
     │  - Autocomplete      │    │  - Transactions      │
     │  - Faceted filters   │    │  - Complex joins     │
     │  - Geo queries       │    │  - User data         │
     └──────────┬───────────┘    └──────────┬───────────┘
                │                           │
                └───────────┬───────────────┘
                            │
                    ┌───────▼───────┐
                    │  Sync Service │
                    │  (CDC/Debezium│
                    │   or polling) │
                    └───────────────┘
```

### 1.3 Elasticsearch Index Design

#### Restaurant Index Schema

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "restaurant_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "standard"
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "restaurant_analyzer"
      },
      "cuisine_types": {
        "type": "keyword"  // For exact faceting
      },
      "cuisine_text": {
        "type": "text"     // For fuzzy search
      },
      "dishes": {
        "type": "nested",
        "properties": {
          "name": { "type": "text" },
          "description": { "type": "text" },
          "price": { "type": "float" }
        }
      },
      "location": {
        "type": "geo_point"  // ES native geo support
      },
      "address": {
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "keyword" },
          "neighborhood": { "type": "keyword" },
          "zip": { "type": "keyword" }
        }
      },
      "price_level": { "type": "integer" },  // 1-4 scale
      "average_rating": { "type": "float" },
      "review_count": { "type": "integer" },
      "is_open_now": { "type": "boolean" },
      "hours": {
        "type": "nested",
        "properties": {
          "day": { "type": "keyword" },
          "open": { "type": "keyword" },
          "close": { "type": "keyword" }
        }
      },
      "features": { "type": "keyword" },  // ["outdoor_seating", "reservations", "delivery"]
      "updated_at": { "type": "date" }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "restaurant_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "synonym_filter", "stemmer"]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "edge_ngram_filter"]
        }
      },
      "filter": {
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 15
        },
        "synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "bbq, barbecue, barbeque",
            "philly, philadelphia",
            "nyc, new york city, new york"
          ]
        }
      }
    }
  }
}
```

### 1.4 Data Synchronization Strategy

#### Option A: Change Data Capture (CDC) with Debezium (Recommended)

```
PostgreSQL ──▶ Debezium ──▶ Kafka ──▶ ES Connector ──▶ Elasticsearch
   (WAL)       (CDC)       (Stream)    (Consumer)
```

**Pros:**
- Near real-time sync (sub-second latency)
- Captures all changes including deletes
- Handles high write volumes
- No application code changes for sync

**Cons:**
- Operational complexity (Kafka, Debezium, connectors)
- Requires Kafka infrastructure

#### Option B: Application-Level Sync (Simpler Start)

```python
# In your Django/Flask app
class RestaurantService:
    def update_restaurant(self, restaurant_id: str, data: dict) -> Restaurant:
        # 1. Update PostgreSQL (source of truth)
        restaurant = self.db.update(restaurant_id, data)
        
        # 2. Sync to Elasticsearch (async)
        self.task_queue.enqueue(
            'sync_restaurant_to_es',
            restaurant_id=restaurant_id,
            retry=3
        )
        
        return restaurant

# Background worker
def sync_restaurant_to_es(restaurant_id: str):
    restaurant = db.get_restaurant(restaurant_id)
    es_doc = transform_to_es_document(restaurant)
    es_client.index(
        index='restaurants',
        id=restaurant_id,
        document=es_doc
    )
```

**Pros:**
- Simple to implement
- No additional infrastructure
- Easy to understand and debug

**Cons:**
- Slightly higher latency
- Need to handle all mutation paths
- Risk of sync drift

#### Recommendation: Start with Option B, migrate to Option A at scale

### 1.5 Search Query Examples

#### Basic Search with Geo-filtering

```python
def search_restaurants(
    query: str,
    lat: float,
    lon: float,
    radius_km: float = 5,
    cuisine: list[str] = None,
    price_levels: list[int] = None,
    min_rating: float = None,
    page: int = 1,
    size: int = 20
) -> SearchResults:
    
    must_clauses = []
    filter_clauses = []
    
    # Full-text search on name, description, dishes
    if query:
        must_clauses.append({
            "multi_match": {
                "query": query,
                "fields": ["name^3", "description", "dishes.name^2", "cuisine_text"],
                "type": "best_fields",
                "fuzziness": "AUTO"
            }
        })
    
    # Geo-distance filter
    filter_clauses.append({
        "geo_distance": {
            "distance": f"{radius_km}km",
            "location": {"lat": lat, "lon": lon}
        }
    })
    
    # Facet filters
    if cuisine:
        filter_clauses.append({"terms": {"cuisine_types": cuisine}})
    
    if price_levels:
        filter_clauses.append({"terms": {"price_level": price_levels}})
    
    if min_rating:
        filter_clauses.append({"range": {"average_rating": {"gte": min_rating}}})
    
    body = {
        "query": {
            "bool": {
                "must": must_clauses if must_clauses else [{"match_all": {}}],
                "filter": filter_clauses
            }
        },
        "sort": [
            "_score",
            {
                "_geo_distance": {
                    "location": {"lat": lat, "lon": lon},
                    "order": "asc",
                    "unit": "km"
                }
            }
        ],
        "from": (page - 1) * size,
        "size": size,
        "aggs": {
            "cuisines": {"terms": {"field": "cuisine_types", "size": 20}},
            "price_levels": {"terms": {"field": "price_level"}},
            "avg_rating_ranges": {
                "range": {
                    "field": "average_rating",
                    "ranges": [
                        {"key": "4+", "from": 4.0},
                        {"key": "3-4", "from": 3.0, "to": 4.0},
                        {"key": "<3", "to": 3.0}
                    ]
                }
            }
        }
    }
    
    return es_client.search(index="restaurants", body=body)
```

#### Autocomplete Query

```python
def autocomplete(query: str, lat: float, lon: float) -> list[str]:
    body = {
        "query": {
            "bool": {
                "must": {
                    "match": {
                        "name.autocomplete": {
                            "query": query,
                            "operator": "and"
                        }
                    }
                },
                "filter": {
                    "geo_distance": {
                        "distance": "25km",
                        "location": {"lat": lat, "lon": lon}
                    }
                }
            }
        },
        "sort": [
            "_score",
            {"review_count": "desc"}  # Prioritize popular restaurants
        ],
        "size": 10,
        "_source": ["id", "name", "cuisine_types"]
    }
    
    return es_client.search(index="restaurants", body=body)
```

### 1.6 Migration Plan

#### Phase 1: Setup & Shadow Mode (Week 1-2)
1. Set up Elasticsearch cluster (AWS OpenSearch or self-managed)
2. Create index with mappings
3. Build initial sync: full PostgreSQL → ES bulk load
4. Run both search systems in parallel, log differences

#### Phase 2: Read Migration (Week 3-4)
1. A/B test: 10% traffic to ES search
2. Monitor latency, relevance metrics
3. Gradually increase to 100%
4. Keep PostgreSQL search as fallback

#### Phase 3: Full Migration (Week 5-6)
1. Remove PostgreSQL full-text search code
2. Implement real-time sync (CDC or app-level)
3. Set up monitoring and alerting
4. Document runbooks

### 1.7 Operational Considerations

#### Monitoring
- **Sync lag**: Time between PostgreSQL write and ES availability
- **Search latency**: P50, P95, P99 latencies
- **Relevance metrics**: Click-through rate, zero-result rate
- **Index health**: Document count, index size, shard distribution

#### Failure Modes
| Failure | Impact | Mitigation |
|---------|--------|------------|
| ES cluster down | Search unavailable | Fall back to PostgreSQL search |
| Sync lag > 1min | Stale data shown | Alert, investigate sync pipeline |
| Index corruption | Bad search results | Re-index from PostgreSQL |

---

## Part 2: Multi-Language Translation Support

### 2.1 Complexity Assessment

| Component | Difficulty | Notes |
|-----------|------------|-------|
| UI strings (buttons, labels) | **Low** | Standard i18n libraries |
| Static content (cuisine types) | **Low** | Pre-translated lookup tables |
| User-generated content (reviews) | **Medium** | Translation API + caching |
| Restaurant names | **Special** | Usually NOT translated |
| Restaurant descriptions | **Medium-High** | Translation API, quality concerns |
| Search queries | **Medium** | Query expansion or translation |

**Overall Difficulty: Medium** — Mostly engineering work, not novel problems.

### 2.2 Architecture for Multi-Language

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                          │
│                    Accept-Language: es-MX                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Gateway                            │
│              Extract locale, pass to services                   │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────────┐    ┌───────────────────┐
│  UI Strings   │    │   Search Service  │    │  Content Service  │
│  (Static i18n)│    │                   │    │                   │
└───────────────┘    └─────────┬─────────┘    └─────────┬─────────┘
                               │                        │
                               ▼                        ▼
                    ┌───────────────────┐    ┌───────────────────┐
                    │  Query Translator │    │Translation Service│
                    │  (cuisine → cocina│    │   (Lazy + Cache)  │
                    └───────────────────┘    └─────────┬─────────┘
                                                       │
                                      ┌────────────────┼────────────────┐
                                      ▼                ▼                ▼
                              ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                              │ Translation │  │   Redis     │  │ PostgreSQL  │
                              │     API     │  │   Cache     │  │ Translations│
                              │(DeepL/Google│  │  (Hot data) │  │(Persistent) │
                              └─────────────┘  └─────────────┘  └─────────────┘
```

### 2.3 Implementation Strategy by Content Type

#### A. UI Strings (Buttons, Labels, Error Messages)

**Approach:** Standard i18n with JSON/YAML translation files

```
/locales
  /en.json
  /es.json
  /zh.json
  /ja.json
```

```json
// en.json
{
  "search": {
    "placeholder": "Search restaurants, cuisines, dishes...",
    "no_results": "No restaurants found",
    "filters": {
      "cuisine": "Cuisine",
      "price": "Price",
      "rating": "Rating"
    }
  }
}

// es.json
{
  "search": {
    "placeholder": "Buscar restaurantes, cocinas, platillos...",
    "no_results": "No se encontraron restaurantes",
    "filters": {
      "cuisine": "Cocina",
      "price": "Precio",
      "rating": "Calificación"
    }
  }
}
```

**Frontend (React):**
```typescript
import { useTranslation } from 'react-i18next';

function SearchBar() {
  const { t } = useTranslation();
  return (
    <input placeholder={t('search.placeholder')} />
  );
}
```

**Effort:** 1-2 weeks for initial setup, ongoing maintenance

#### B. Static Taxonomies (Cuisines, Features, Neighborhoods)

**Approach:** Pre-translated lookup tables in PostgreSQL

```sql
CREATE TABLE cuisine_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL  -- 'italian', 'japanese', etc.
);

CREATE TABLE cuisine_translations (
    cuisine_id INTEGER REFERENCES cuisine_types(id),
    locale VARCHAR(10) NOT NULL,  -- 'en', 'es', 'zh-CN'
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (cuisine_id, locale)
);

-- Data
INSERT INTO cuisine_types (code) VALUES ('italian'), ('japanese'), ('mexican');

INSERT INTO cuisine_translations VALUES
    (1, 'en', 'Italian'),
    (1, 'es', 'Italiana'),
    (1, 'ja', 'イタリアン'),
    (2, 'en', 'Japanese'),
    (2, 'es', 'Japonesa'),
    (2, 'ja', '日本料理');
```

**Query:**
```python
def get_cuisines(locale: str) -> list[dict]:
    return db.query("""
        SELECT ct.code, COALESCE(tr.name, en.name) as name
        FROM cuisine_types ct
        LEFT JOIN cuisine_translations tr ON ct.id = tr.cuisine_id AND tr.locale = %s
        LEFT JOIN cuisine_translations en ON ct.id = en.cuisine_id AND en.locale = 'en'
        ORDER BY name
    """, [locale])
```

**Effort:** 1 week setup, ~50 cuisines × ~10 languages = 500 translations (manual or bulk-translated)

#### C. Restaurant Descriptions (User-Generated/Owner-Provided)

**Approach:** Lazy translation with caching

```python
class TranslationService:
    def __init__(self, translation_api, redis_client, db):
        self.api = translation_api  # DeepL or Google Translate
        self.cache = redis_client
        self.db = db
    
    async def get_translation(
        self,
        text: str,
        source_locale: str,
        target_locale: str,
        content_type: str,  # 'restaurant_description', 'review', etc.
        content_id: str
    ) -> str:
        if source_locale == target_locale:
            return text
        
        # 1. Check Redis cache (hot data)
        cache_key = f"trans:{content_type}:{content_id}:{target_locale}"
        cached = await self.cache.get(cache_key)
        if cached:
            return cached
        
        # 2. Check PostgreSQL (persistent storage)
        db_trans = await self.db.get_translation(content_type, content_id, target_locale)
        if db_trans:
            await self.cache.setex(cache_key, 3600, db_trans)  # Cache 1 hour
            return db_trans
        
        # 3. Call translation API
        translated = await self.api.translate(
            text=text,
            source=source_locale,
            target=target_locale
        )
        
        # 4. Store persistently and cache
        await self.db.save_translation(content_type, content_id, target_locale, translated)
        await self.cache.setex(cache_key, 3600, translated)
        
        return translated
```

**Database schema:**
```sql
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,  -- 'restaurant_description', 'review'
    content_id VARCHAR(100) NOT NULL,
    source_locale VARCHAR(10) NOT NULL,
    target_locale VARCHAR(10) NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    translation_provider VARCHAR(20),  -- 'deepl', 'google', 'human'
    quality_score FLOAT,  -- Optional: for human review prioritization
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (content_type, content_id, target_locale)
);

CREATE INDEX idx_translations_lookup 
    ON translations(content_type, content_id, target_locale);
```

**Effort:** 2-3 weeks for infrastructure, ongoing API costs

#### D. Search Query Translation

**Approach:** Query expansion with translated synonyms in Elasticsearch

```python
def search_with_locale(query: str, locale: str, lat: float, lon: float):
    # Option 1: Translate query to English (index language)
    if locale != 'en':
        query_en = translation_service.translate(query, locale, 'en')
        # Search with both original and translated
        search_query = f"{query} {query_en}"
    
    # Option 2: Use locale-specific synonym expansion
    # "sushi" in ES synonyms → "sushi, 寿司, スシ"
    
    return es_client.search(...)
```

**Better approach for scale:** Maintain multi-language index

```json
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "en": {"type": "text", "analyzer": "english"},
          "es": {"type": "text", "analyzer": "spanish"},
          "ja": {"type": "text", "analyzer": "kuromoji"},
          "zh": {"type": "text", "analyzer": "smartcn"}
        }
      }
    }
  }
}
```

**Effort:** 2-4 weeks depending on approach

### 2.4 Translation API Comparison

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **DeepL** | Best quality for European languages | Limited language support | $20/1M chars |
| **Google Translate** | Most languages, good quality | Can be inconsistent | $20/1M chars |
| **Amazon Translate** | AWS integration, good for Asian languages | Medium quality | $15/1M chars |
| **LibreTranslate** | Self-hosted, free | Lower quality | Infrastructure only |

**Recommendation:** DeepL for European languages, Google for Asian languages, with fallback chain.

### 2.5 Multi-Language Elasticsearch Configuration

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "english_analyzer": {
          "type": "standard",
          "stopwords": "_english_"
        },
        "spanish_analyzer": {
          "type": "standard", 
          "stopwords": "_spanish_"
        },
        "japanese_analyzer": {
          "type": "kuromoji"
        },
        "chinese_analyzer": {
          "type": "smartcn"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name_translations": {
        "properties": {
          "en": {"type": "text", "analyzer": "english_analyzer"},
          "es": {"type": "text", "analyzer": "spanish_analyzer"},
          "ja": {"type": "text", "analyzer": "japanese_analyzer"},
          "zh": {"type": "text", "analyzer": "chinese_analyzer"}
        }
      }
    }
  }
}
```

### 2.6 Implementation Roadmap

#### Phase 1: Foundation (Weeks 1-3)
- [ ] Set up i18n framework (react-i18next or similar)
- [ ] Translate UI strings for top 3 languages
- [ ] Create cuisine/feature translation tables
- [ ] Set up translation service with caching

#### Phase 2: Content Translation (Weeks 4-6)
- [ ] Implement lazy translation for descriptions
- [ ] Add translation API integration
- [ ] Build translation cache layer
- [ ] Create admin UI for translation review

#### Phase 3: Search Localization (Weeks 7-8)
- [ ] Add language-specific analyzers to ES
- [ ] Implement query translation/expansion
- [ ] Test search quality per language
- [ ] Optimize relevance tuning

#### Phase 4: Polish (Weeks 9-10)
- [ ] RTL support (Arabic, Hebrew)
- [ ] Date/time/currency localization
- [ ] Quality review of machine translations
- [ ] Performance optimization

---

## Part 3: Cost Estimates

### Elasticsearch Infrastructure

| Cluster Size | Use Case | Monthly Cost (AWS OpenSearch) |
|--------------|----------|-------------------------------|
| 2x r6g.large | Dev/Staging | ~$200 |
| 3x r6g.xlarge | Production (100K restaurants) | ~$600 |
| 3x r6g.2xlarge + 2 replicas | Production (1M+ restaurants) | ~$2,000 |

### Translation API Costs

| Scale | Monthly Translations | Estimated Cost |
|-------|---------------------|----------------|
| Small (10K restaurants, 5 languages) | ~500K chars | ~$10 |
| Medium (100K restaurants, 10 languages) | ~5M chars | ~$100 |
| Large (1M restaurants, 15 languages) | ~50M chars | ~$1,000 |

*Note: Caching reduces ongoing costs by 80-90% after initial translation*

---

## Appendix: Quick Wins vs. Major Efforts

### Do First (High Impact, Low Effort)
1. Add Elasticsearch for search (2-3 weeks)
2. UI string internationalization (1-2 weeks)
3. Cuisine type translations (1 week)

### Do Later (High Impact, Higher Effort)
1. Full CDC pipeline with Debezium (4-6 weeks)
2. Multi-language search analyzers (3-4 weeks)
3. Real-time translation with quality review (ongoing)

### Consider Carefully
1. User review translation (quality concerns)
2. RTL language support (significant UI work)
3. Voice search in multiple languages (complex)