# Elasticsearch & Translation Implementation Plan for Beli

## Executive Summary

This document provides a comprehensive analysis and implementation plan for:
1. **Elasticsearch Integration** - Improving search speed and capabilities
2. **Translation/Internationalization** - Supporting multiple languages for global expansion

---

## Part 1: Current State Analysis

### Current Search Architecture

**Implementation**: Simple substring matching on mock data arrays

```typescript
// Current approach (beli-web/lib/services/restaurants/RestaurantService.ts)
async searchRestaurants(query: string, filters?: SearchFilters): Promise<Restaurant[]> {
  const normalizedQuery = query.toLowerCase().trim();
  return restaurants.filter(r =>
    r.name.toLowerCase().includes(normalizedQuery) ||
    r.location.neighborhood.toLowerCase().includes(normalizedQuery) ||
    r.cuisines.some(c => c.toLowerCase().includes(normalizedQuery)) ||
    r.popularDishes.some(d => d.toLowerCase().includes(normalizedQuery))
  );
}
```

**Limitations**:
- O(n) linear scan through all restaurants
- No relevance scoring or ranking
- No fuzzy matching (typos not handled)
- No autocomplete/suggestions
- No synonym support ("pizza" ≠ "pizzeria")
- No multilingual search support
- Distance calculations done client-side

### Planned PostgreSQL Features

The database schema already includes:
- **PostGIS** extension for geographic queries
- **pg_trgm** extension for trigram-based fuzzy text search
- GIN indexes on restaurant names and cuisines

```sql
-- From backend-database-schema.md
CREATE INDEX idx_restaurants_name_trgm ON restaurants USING gin(name gin_trgm_ops);
CREATE INDEX idx_restaurants_location_gist ON restaurants USING gist(ST_MakePoint(longitude, latitude));
```

---

## Part 2: Why Elasticsearch?

### PostgreSQL Full-Text Search vs Elasticsearch

| Feature | PostgreSQL FTS | Elasticsearch |
|---------|---------------|---------------|
| Setup Complexity | Low | Medium |
| Full-text search | Good | Excellent |
| Fuzzy matching | Basic (pg_trgm) | Advanced (Levenshtein, n-grams) |
| Autocomplete | Limited | Native support |
| Synonyms | Manual configuration | Built-in analyzers |
| Multi-language | One language per index | Multiple analyzers |
| Geo queries | PostGIS (powerful) | Native (simpler API) |
| Faceted search | Complex SQL | Native aggregations |
| Real-time indexing | Good | Near real-time |
| Scaling | Read replicas | Horizontal sharding |
| Relevance tuning | Limited | Highly customizable |
| Cost (self-hosted) | Free | Free |
| Managed service | AWS RDS | AWS OpenSearch ($50+/mo) |

### Recommendation

**Hybrid Approach**:
- **PostgreSQL**: Primary data store, transactions, complex JOINs
- **Elasticsearch**: Search, autocomplete, analytics, faceted filtering
- **PostGIS**: Geospatial queries (can use ES geo as alternative)

---

## Part 3: Elasticsearch Architecture

### Index Design

#### 3.1 Restaurants Index

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
            "analyzer": "autocomplete_analyzer"
          },
          "fuzzy": {
            "type": "text",
            "analyzer": "fuzzy_analyzer"
          }
        }
      },
      "name_translations": {
        "type": "object",
        "properties": {
          "es": { "type": "text", "analyzer": "spanish" },
          "fr": { "type": "text", "analyzer": "french" },
          "zh": { "type": "text", "analyzer": "smartcn" },
          "ja": { "type": "text", "analyzer": "kuromoji" },
          "ko": { "type": "text", "analyzer": "nori" }
        }
      },
      "cuisines": {
        "type": "keyword",
        "fields": {
          "text": { "type": "text" }
        }
      },
      "cuisine_translations": {
        "type": "object",
        "properties": {
          "es": { "type": "keyword" },
          "fr": { "type": "keyword" },
          "zh": { "type": "keyword" },
          "ja": { "type": "keyword" },
          "ko": { "type": "keyword" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "english"
      },
      "description_translations": {
        "type": "object",
        "properties": {
          "es": { "type": "text", "analyzer": "spanish" },
          "fr": { "type": "text", "analyzer": "french" },
          "zh": { "type": "text", "analyzer": "smartcn" },
          "ja": { "type": "text", "analyzer": "kuromoji" },
          "ko": { "type": "text", "analyzer": "nori" }
        }
      },
      "location": {
        "type": "geo_point"
      },
      "address": { "type": "text" },
      "neighborhood": {
        "type": "keyword",
        "fields": { "text": { "type": "text" } }
      },
      "city": { "type": "keyword" },
      "state": { "type": "keyword" },
      "country": { "type": "keyword" },
      "price_range": { "type": "keyword" },
      "category": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "popular_dishes": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "average_score": { "type": "float" },
      "rating_count": { "type": "integer" },
      "accepts_reservations": { "type": "boolean" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "restaurant_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "restaurant_synonyms"]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "edge_ngram_filter"]
        },
        "fuzzy_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "ngram_filter"]
        }
      },
      "filter": {
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 20
        },
        "ngram_filter": {
          "type": "ngram",
          "min_gram": 3,
          "max_gram": 4
        },
        "restaurant_synonyms": {
          "type": "synonym",
          "synonyms": [
            "pizza, pizzeria, pie",
            "sushi, japanese, sashimi",
            "tacos, mexican, taqueria",
            "burger, hamburger, burgers",
            "coffee, cafe, espresso",
            "bbq, barbecue, barbeque"
          ]
        }
      }
    },
    "number_of_shards": 1,
    "number_of_replicas": 1
  }
}
```

#### 3.2 Users Index

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "username": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer"
          }
        }
      },
      "display_name": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer"
          }
        }
      },
      "bio": { "type": "text" },
      "city": { "type": "keyword" },
      "state": { "type": "keyword" },
      "is_tastemaker": { "type": "boolean" },
      "tastemaker_specialty": { "type": "keyword" },
      "been_count": { "type": "integer" },
      "followers_count": { "type": "integer" }
    }
  }
}
```

#### 3.3 Tastemaker Posts Index

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer"
          }
        }
      },
      "title_translations": {
        "type": "object",
        "properties": {
          "es": { "type": "text", "analyzer": "spanish" },
          "fr": { "type": "text", "analyzer": "french" },
          "zh": { "type": "text", "analyzer": "smartcn" },
          "ja": { "type": "text", "analyzer": "kuromoji" }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "english"
      },
      "content_translations": {
        "type": "object"
      },
      "tags": { "type": "keyword" },
      "author_id": { "type": "keyword" },
      "restaurant_ids": { "type": "keyword" },
      "views": { "type": "integer" },
      "likes_count": { "type": "integer" },
      "published_at": { "type": "date" }
    }
  }
}
```

---

## Part 4: Search Implementation

### 4.1 Basic Search Query

```typescript
// lib/services/elasticsearch/ElasticsearchService.ts
import { Client } from '@elastic/elasticsearch';

export class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ES_USERNAME || 'elastic',
        password: process.env.ES_PASSWORD || ''
      }
    });
  }

  async searchRestaurants(params: {
    query: string;
    locale?: string;
    filters?: {
      cuisines?: string[];
      priceRange?: string[];
      neighborhood?: string;
      category?: string;
    };
    location?: { lat: number; lng: number };
    maxDistance?: number; // kilometers
    page?: number;
    pageSize?: number;
  }): Promise<SearchResult<Restaurant>> {
    const {
      query,
      locale = 'en',
      filters = {},
      location,
      maxDistance = 50,
      page = 1,
      pageSize = 20
    } = params;

    // Build the query
    const must: any[] = [];
    const filter: any[] = [];

    // Multi-field text search with language support
    if (query) {
      const searchFields = [
        'name^3',           // Boost name matches
        'name.autocomplete^2',
        'cuisines.text',
        'popular_dishes^1.5',
        'tags',
        'neighborhood.text'
      ];

      // Add translated fields based on locale
      if (locale !== 'en') {
        searchFields.push(
          `name_translations.${locale}^3`,
          `cuisine_translations.${locale}`,
          `description_translations.${locale}`
        );
      }

      must.push({
        multi_match: {
          query,
          fields: searchFields,
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'or',
          minimum_should_match: '75%'
        }
      });
    }

    // Cuisine filter
    if (filters.cuisines?.length) {
      filter.push({
        terms: { cuisines: filters.cuisines.map(c => c.toLowerCase()) }
      });
    }

    // Price range filter
    if (filters.priceRange?.length) {
      filter.push({
        terms: { price_range: filters.priceRange }
      });
    }

    // Neighborhood filter
    if (filters.neighborhood) {
      filter.push({
        term: { neighborhood: filters.neighborhood }
      });
    }

    // Category filter
    if (filters.category) {
      filter.push({
        term: { category: filters.category }
      });
    }

    // Geo distance filter
    if (location) {
      filter.push({
        geo_distance: {
          distance: `${maxDistance}km`,
          location: {
            lat: location.lat,
            lon: location.lng
          }
        }
      });
    }

    // Build the full query
    const esQuery: any = {
      index: 'restaurants',
      from: (page - 1) * pageSize,
      size: pageSize,
      body: {
        query: {
          bool: {
            must: must.length ? must : [{ match_all: {} }],
            filter
          }
        },
        sort: [
          { _score: 'desc' },
          { average_score: 'desc' },
          { rating_count: 'desc' }
        ],
        highlight: {
          fields: {
            name: {},
            'popular_dishes': {}
          }
        }
      }
    };

    // Add geo distance sorting if location provided
    if (location) {
      esQuery.body.sort.unshift({
        _geo_distance: {
          location: { lat: location.lat, lon: location.lng },
          order: 'asc',
          unit: 'km'
        }
      });
    }

    const response = await this.client.search(esQuery);

    return {
      results: response.hits.hits.map(hit => ({
        ...hit._source as Restaurant,
        _score: hit._score,
        _distance: hit.sort?.[0], // Distance if geo sorted
        _highlights: hit.highlight
      })),
      total: typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value || 0,
      page,
      pageSize
    };
  }
}
```

### 4.2 Autocomplete Implementation

```typescript
async autocomplete(params: {
  query: string;
  type: 'restaurants' | 'users' | 'all';
  locale?: string;
  limit?: number;
}): Promise<AutocompleteResult[]> {
  const { query, type, locale = 'en', limit = 10 } = params;

  const indices = type === 'all'
    ? ['restaurants', 'users']
    : [type];

  const response = await this.client.search({
    index: indices,
    body: {
      size: limit,
      query: {
        bool: {
          should: [
            {
              match: {
                'name.autocomplete': {
                  query,
                  boost: 2
                }
              }
            },
            {
              match: {
                [`name_translations.${locale}.autocomplete`]: {
                  query,
                  boost: 1.5
                }
              }
            },
            {
              prefix: {
                'name.keyword': {
                  value: query,
                  boost: 3
                }
              }
            }
          ]
        }
      },
      _source: ['id', 'name', 'name_translations', 'cuisines', 'neighborhood', 'username', 'display_name', 'avatar'],
      highlight: {
        fields: {
          'name.autocomplete': {},
          'username.autocomplete': {}
        }
      }
    }
  });

  return response.hits.hits.map(hit => ({
    id: hit._source.id,
    type: hit._index,
    name: locale !== 'en' && hit._source.name_translations?.[locale]
      ? hit._source.name_translations[locale]
      : hit._source.name || hit._source.display_name,
    subtitle: hit._source.cuisines?.join(', ') || hit._source.username,
    highlight: hit.highlight
  }));
}
```

### 4.3 Faceted Search (Aggregations)

```typescript
async getSearchFacets(params: {
  query?: string;
  location?: { lat: number; lng: number };
}): Promise<SearchFacets> {
  const { query, location } = params;

  const queryBody: any = {
    bool: {
      must: query ? [{
        multi_match: {
          query,
          fields: ['name^3', 'cuisines.text', 'tags']
        }
      }] : [{ match_all: {} }]
    }
  };

  if (location) {
    queryBody.bool.filter = [{
      geo_distance: {
        distance: '50km',
        location: { lat: location.lat, lon: location.lng }
      }
    }];
  }

  const response = await this.client.search({
    index: 'restaurants',
    body: {
      size: 0, // Don't return documents, just aggregations
      query: queryBody,
      aggs: {
        cuisines: {
          terms: {
            field: 'cuisines',
            size: 20
          }
        },
        price_ranges: {
          terms: {
            field: 'price_range',
            size: 4
          }
        },
        neighborhoods: {
          terms: {
            field: 'neighborhood',
            size: 30
          }
        },
        categories: {
          terms: {
            field: 'category',
            size: 10
          }
        },
        avg_rating: {
          avg: {
            field: 'average_score'
          }
        },
        rating_distribution: {
          histogram: {
            field: 'average_score',
            interval: 1
          }
        }
      }
    }
  });

  return {
    cuisines: response.aggregations.cuisines.buckets.map(b => ({
      value: b.key,
      count: b.doc_count
    })),
    priceRanges: response.aggregations.price_ranges.buckets.map(b => ({
      value: b.key,
      count: b.doc_count
    })),
    neighborhoods: response.aggregations.neighborhoods.buckets.map(b => ({
      value: b.key,
      count: b.doc_count
    })),
    categories: response.aggregations.categories.buckets.map(b => ({
      value: b.key,
      count: b.doc_count
    })),
    avgRating: response.aggregations.avg_rating.value,
    ratingDistribution: response.aggregations.rating_distribution.buckets
  };
}
```

---

## Part 5: Translation Strategy

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Translation Flow                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────┐
│ Original │ ──► │ Translation  │ ──► │ Translation │ ──► │ ES   │
│ Content  │     │ Service      │     │ Cache       │     │ Index│
└──────────┘     └──────────────┘     └─────────────┘     └──────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Translation API │
              │ (Google/DeepL)  │
              └─────────────────┘
```

### 5.2 Translation Service

```typescript
// lib/services/translation/TranslationService.ts
import { Translate } from '@google-cloud/translate/build/src/v2';

export class TranslationService {
  private translator: Translate;
  private cache: Map<string, TranslationCache> = new Map();

  // Supported locales
  static SUPPORTED_LOCALES = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    zh: 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    de: 'German',
    it: 'Italian'
  };

  constructor() {
    this.translator = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT
    });
  }

  async translateText(params: {
    text: string;
    sourceLocale?: string;
    targetLocale: string;
    context?: 'restaurant' | 'cuisine' | 'dish' | 'description';
  }): Promise<string> {
    const { text, sourceLocale = 'en', targetLocale, context } = params;

    if (sourceLocale === targetLocale) return text;

    // Check cache first
    const cacheKey = `${sourceLocale}:${targetLocale}:${text}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.translation;
    }

    try {
      const [translation] = await this.translator.translate(text, {
        from: sourceLocale,
        to: targetLocale
      });

      // Cache the result
      this.cache.set(cacheKey, {
        translation,
        timestamp: Date.now()
      });

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original
    }
  }

  async translateRestaurant(restaurant: Restaurant, targetLocale: string): Promise<TranslatedRestaurant> {
    if (targetLocale === 'en') {
      return restaurant as TranslatedRestaurant;
    }

    const [
      translatedName,
      translatedCuisines,
      translatedDishes,
      translatedTags
    ] = await Promise.all([
      // Some restaurant names shouldn't be translated (proper nouns)
      this.shouldTranslateName(restaurant.name)
        ? this.translateText({ text: restaurant.name, targetLocale, context: 'restaurant' })
        : restaurant.name,
      Promise.all(
        restaurant.cuisines.map(c =>
          this.translateCuisine(c, targetLocale)
        )
      ),
      Promise.all(
        restaurant.popularDishes.map(d =>
          this.translateText({ text: d, targetLocale, context: 'dish' })
        )
      ),
      restaurant.tags
        ? Promise.all(
            restaurant.tags.map(t =>
              this.translateText({ text: t, targetLocale })
            )
          )
        : []
    ]);

    return {
      ...restaurant,
      name: translatedName,
      originalName: restaurant.name, // Keep original for reference
      cuisines: translatedCuisines,
      popularDishes: translatedDishes,
      tags: translatedTags,
      locale: targetLocale
    };
  }

  // Pre-defined cuisine translations for consistency
  private cuisineTranslations: Record<string, Record<string, string>> = {
    italian: { es: 'italiano', fr: 'italien', zh: '意大利菜', ja: 'イタリア料理', ko: '이탈리아 요리' },
    japanese: { es: 'japonés', fr: 'japonais', zh: '日本料理', ja: '日本料理', ko: '일식' },
    chinese: { es: 'chino', fr: 'chinois', zh: '中餐', ja: '中華料理', ko: '중식' },
    mexican: { es: 'mexicano', fr: 'mexicain', zh: '墨西哥菜', ja: 'メキシコ料理', ko: '멕시코 요리' },
    pizza: { es: 'pizza', fr: 'pizza', zh: '披萨', ja: 'ピザ', ko: '피자' },
    sushi: { es: 'sushi', fr: 'sushi', zh: '寿司', ja: '寿司', ko: '초밥' },
    korean: { es: 'coreano', fr: 'coréen', zh: '韩国料理', ja: '韓国料理', ko: '한식' },
    thai: { es: 'tailandés', fr: 'thaïlandais', zh: '泰国菜', ja: 'タイ料理', ko: '태국 요리' },
    indian: { es: 'indio', fr: 'indien', zh: '印度菜', ja: 'インド料理', ko: '인도 요리' },
    french: { es: 'francés', fr: 'français', zh: '法国菜', ja: 'フランス料理', ko: '프랑스 요리' },
    american: { es: 'americano', fr: 'américain', zh: '美式', ja: 'アメリカ料理', ko: '미국 요리' },
    mediterranean: { es: 'mediterráneo', fr: 'méditerranéen', zh: '地中海菜', ja: '地中海料理', ko: '지중해 요리' },
    seafood: { es: 'mariscos', fr: 'fruits de mer', zh: '海鲜', ja: '海鮮', ko: '해산물' },
    steakhouse: { es: 'asador', fr: 'grillade', zh: '牛排馆', ja: 'ステーキハウス', ko: '스테이크하우스' },
    vegetarian: { es: 'vegetariano', fr: 'végétarien', zh: '素食', ja: 'ベジタリアン', ko: '채식' },
    vegan: { es: 'vegano', fr: 'végétalien', zh: '纯素', ja: 'ヴィーガン', ko: '비건' }
  };

  async translateCuisine(cuisine: string, targetLocale: string): Promise<string> {
    const normalized = cuisine.toLowerCase();
    const cached = this.cuisineTranslations[normalized]?.[targetLocale];

    if (cached) return cached;

    // Fall back to API translation for unknown cuisines
    return this.translateText({
      text: cuisine,
      targetLocale,
      context: 'cuisine'
    });
  }

  private shouldTranslateName(name: string): boolean {
    // Don't translate names that are:
    // - Proper nouns (start with capital)
    // - Already in target language
    // - Brand names
    // - Names with special characters suggesting foreign origin

    const excludePatterns = [
      /^[A-Z][a-z]+('[a-z]+)?$/, // Single capitalized word
      /[àáâãäåèéêëìíîïòóôõöùúûü]/i, // Contains accented characters
      /[\u3000-\u9fff]/,  // Contains CJK characters
      /[\u0400-\u04FF]/,  // Contains Cyrillic
    ];

    return !excludePatterns.some(pattern => pattern.test(name));
  }
}
```

### 5.3 Database Schema for Translations

```sql
-- Add translations table for user-generated content
CREATE TABLE translations (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'restaurant', 'menu_item', 'tastemaker_post'
  entity_id BIGINT NOT NULL,
  field_name VARCHAR(100) NOT NULL, -- 'name', 'description', 'content'
  locale VARCHAR(10) NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  translation_source VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual', 'verified'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(entity_type, entity_id, field_name, locale)
);

CREATE INDEX idx_translations_entity ON translations(entity_type, entity_id);
CREATE INDEX idx_translations_locale ON translations(locale);

-- Add locale column to restaurants for primary language
ALTER TABLE restaurants ADD COLUMN primary_locale VARCHAR(10) DEFAULT 'en';

-- Add locale preference to users
ALTER TABLE users ADD COLUMN preferred_locale VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN secondary_locales TEXT[]; -- Additional languages user understands
```

### 5.4 Elasticsearch Multi-Language Indexing

```typescript
// lib/services/elasticsearch/indexing.ts
async indexRestaurantWithTranslations(restaurant: Restaurant): Promise<void> {
  const translationService = new TranslationService();
  const targetLocales = ['es', 'fr', 'zh', 'ja', 'ko'];

  // Generate translations for all supported locales
  const translations: Record<string, any> = {};

  await Promise.all(
    targetLocales.map(async (locale) => {
      const translated = await translationService.translateRestaurant(restaurant, locale);
      translations[locale] = {
        name: translated.name,
        cuisines: translated.cuisines,
        popularDishes: translated.popularDishes,
        tags: translated.tags
      };
    })
  );

  // Index document with translations
  await this.client.index({
    index: 'restaurants',
    id: restaurant.id,
    body: {
      ...restaurant,
      location: {
        lat: restaurant.location.coordinates.lat,
        lon: restaurant.location.coordinates.lng
      },
      name_translations: Object.fromEntries(
        targetLocales.map(locale => [locale, translations[locale].name])
      ),
      cuisine_translations: Object.fromEntries(
        targetLocales.map(locale => [locale, translations[locale].cuisines])
      ),
      popular_dishes_translations: Object.fromEntries(
        targetLocales.map(locale => [locale, translations[locale].popularDishes])
      ),
      indexed_at: new Date().toISOString()
    }
  });
}
```

---

## Part 6: API Integration

### 6.1 Search API Endpoints

```typescript
// app/api/search/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';
import { ElasticsearchService } from '@/lib/services/elasticsearch';

const es = new ElasticsearchService();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get('q') || '';
  const locale = searchParams.get('locale') || 'en';
  const type = searchParams.get('type') || 'all'; // restaurants, users, posts, all
  const cuisines = searchParams.get('cuisines')?.split(',');
  const priceRange = searchParams.get('priceRange')?.split(',');
  const neighborhood = searchParams.get('neighborhood');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const maxDistance = searchParams.get('maxDistance');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    const location = lat && lng
      ? { lat: parseFloat(lat), lng: parseFloat(lng) }
      : undefined;

    let results;

    switch (type) {
      case 'restaurants':
        results = await es.searchRestaurants({
          query,
          locale,
          filters: { cuisines, priceRange, neighborhood },
          location,
          maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
          page,
          pageSize
        });
        break;

      case 'users':
        results = await es.searchUsers({ query, locale, page, pageSize });
        break;

      case 'posts':
        results = await es.searchPosts({ query, locale, page, pageSize });
        break;

      case 'all':
      default:
        const [restaurants, users, posts] = await Promise.all([
          es.searchRestaurants({ query, locale, filters: {}, page: 1, pageSize: 5 }),
          es.searchUsers({ query, locale, page: 1, pageSize: 5 }),
          es.searchPosts({ query, locale, page: 1, pageSize: 3 })
        ]);
        results = { restaurants, users, posts };
    }

    return NextResponse.json({
      success: true,
      data: results,
      meta: { locale, query }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SEARCH_ERROR', message: 'Search failed' } },
      { status: 500 }
    );
  }
}
```

### 6.2 Autocomplete API

```typescript
// app/api/search/autocomplete/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const locale = searchParams.get('locale') || 'en';

  if (query.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const suggestions = await es.autocomplete({
      query,
      type: type as 'restaurants' | 'users' | 'all',
      locale,
      limit: 8
    });

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTOCOMPLETE_ERROR' } },
      { status: 500 }
    );
  }
}
```

### 6.3 React Query Hooks

```typescript
// lib/hooks/use-search.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        q: params.query,
        locale: params.locale || 'en',
        type: params.type || 'all',
        page: String(params.page || 1),
        pageSize: String(params.pageSize || 20)
      });

      if (params.filters?.cuisines) {
        searchParams.set('cuisines', params.filters.cuisines.join(','));
      }
      if (params.location) {
        searchParams.set('lat', String(params.location.lat));
        searchParams.set('lng', String(params.location.lng));
      }

      const response = await fetch(`/api/search?${searchParams}`);
      return response.json();
    },
    enabled: params.query.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAutocomplete(query: string, options?: { type?: string; locale?: string }) {
  return useQuery({
    queryKey: ['autocomplete', query, options],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        type: options?.type || 'all',
        locale: options?.locale || 'en'
      });
      const response = await fetch(`/api/search/autocomplete?${params}`);
      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}
```

---

## Part 7: Synchronization Strategy

### 7.1 PostgreSQL to Elasticsearch Sync

```typescript
// lib/services/elasticsearch/sync.ts
import { Client } from '@elastic/elasticsearch';
import { Pool } from 'pg';

export class ElasticsearchSyncService {
  private es: Client;
  private pg: Pool;

  // Sync all restaurants (for initial index or full rebuild)
  async fullSync(): Promise<void> {
    console.log('Starting full Elasticsearch sync...');

    const batchSize = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { rows } = await this.pg.query(`
        SELECT r.*,
               array_agg(DISTINCT t.translated_text) as translations
        FROM restaurants r
        LEFT JOIN translations t ON t.entity_type = 'restaurant'
                                AND t.entity_id = r.id
        WHERE r.deleted_at IS NULL
        GROUP BY r.id
        ORDER BY r.id
        LIMIT $1 OFFSET $2
      `, [batchSize, offset]);

      if (rows.length === 0) {
        hasMore = false;
        continue;
      }

      // Bulk index
      const body = rows.flatMap(row => [
        { index: { _index: 'restaurants', _id: row.id } },
        this.transformRestaurantForES(row)
      ]);

      await this.es.bulk({ body, refresh: false });

      offset += batchSize;
      console.log(`Indexed ${offset} restaurants...`);
    }

    await this.es.indices.refresh({ index: 'restaurants' });
    console.log('Full sync completed');
  }

  // Real-time sync using PostgreSQL LISTEN/NOTIFY
  async startRealtimeSync(): Promise<void> {
    const client = await this.pg.connect();

    await client.query('LISTEN restaurant_changes');
    await client.query('LISTEN user_changes');

    client.on('notification', async (msg) => {
      const payload = JSON.parse(msg.payload || '{}');

      switch (msg.channel) {
        case 'restaurant_changes':
          await this.handleRestaurantChange(payload);
          break;
        case 'user_changes':
          await this.handleUserChange(payload);
          break;
      }
    });
  }

  private async handleRestaurantChange(payload: {
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    id: number
  }): Promise<void> {
    if (payload.operation === 'DELETE') {
      await this.es.delete({
        index: 'restaurants',
        id: String(payload.id)
      });
    } else {
      const { rows } = await this.pg.query(
        'SELECT * FROM restaurants WHERE id = $1',
        [payload.id]
      );

      if (rows[0]) {
        await this.es.index({
          index: 'restaurants',
          id: String(payload.id),
          body: this.transformRestaurantForES(rows[0])
        });
      }
    }
  }

  private transformRestaurantForES(row: any): any {
    return {
      id: row.id,
      name: row.name,
      cuisines: row.cuisines,
      category: row.category,
      price_range: row.price_range,
      location: {
        lat: row.latitude,
        lon: row.longitude
      },
      address: row.address,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      country: row.country,
      tags: row.tags,
      popular_dishes: row.popular_dishes,
      average_score: row.average_score,
      rating_count: row.rating_count,
      accepts_reservations: row.accepts_reservations,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
```

### 7.2 PostgreSQL Trigger for Real-time Sync

```sql
-- Create notification function
CREATE OR REPLACE FUNCTION notify_elasticsearch()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM pg_notify(
      TG_TABLE_NAME || '_changes',
      json_build_object('operation', TG_OP, 'id', OLD.id)::text
    );
    RETURN OLD;
  ELSE
    PERFORM pg_notify(
      TG_TABLE_NAME || '_changes',
      json_build_object('operation', TG_OP, 'id', NEW.id)::text
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply to restaurants table
CREATE TRIGGER restaurant_es_sync
AFTER INSERT OR UPDATE OR DELETE ON restaurants
FOR EACH ROW EXECUTE FUNCTION notify_elasticsearch();

-- Apply to users table
CREATE TRIGGER user_es_sync
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION notify_elasticsearch();
```

---

## Part 8: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

1. **Set up Elasticsearch infrastructure**
   - Deploy Elasticsearch cluster (AWS OpenSearch or self-hosted)
   - Configure security, networking
   - Set up monitoring (Kibana)

2. **Create index mappings**
   - Restaurants index with analyzers
   - Users index
   - Tastemaker posts index

3. **Build synchronization service**
   - Full sync from PostgreSQL
   - Real-time LISTEN/NOTIFY sync
   - Sync monitoring and error handling

### Phase 2: Core Search (Week 3-4)

1. **Implement search service**
   - Basic text search
   - Fuzzy matching
   - Geo queries
   - Filtering and facets

2. **Build API endpoints**
   - Search endpoint
   - Autocomplete endpoint
   - Facets/aggregations endpoint

3. **Update frontend**
   - New search hooks
   - Autocomplete component
   - Filter UI with facets

### Phase 3: Translation (Week 5-6)

1. **Set up translation service**
   - Google Cloud Translation API integration
   - Translation caching
   - Cuisine/tag translation dictionaries

2. **Database schema updates**
   - Translations table
   - Locale preferences

3. **Multi-language indexing**
   - Index restaurants with translations
   - Language-specific analyzers

4. **Frontend i18n**
   - Locale detection
   - UI translation (next-intl)
   - Search in user's language

### Phase 4: Optimization (Week 7-8)

1. **Performance tuning**
   - Query optimization
   - Index settings
   - Caching strategies

2. **Analytics integration**
   - Search analytics
   - Popular queries
   - Trending restaurants

3. **Testing and monitoring**
   - Load testing
   - Search quality testing
   - Production monitoring

---

## Part 9: Cost Analysis

### Elasticsearch Hosting Options

| Option | Monthly Cost | Features |
|--------|-------------|----------|
| **Elastic Cloud (self-managed)** | $0 | Free, manual ops |
| **AWS OpenSearch Serverless** | ~$50-200 | Auto-scaling, managed |
| **Elastic Cloud (managed)** | $95+ | Full features, support |
| **Railway + ES container** | ~$20-50 | Simple, affordable |

### Translation API Costs

| Provider | Cost per 1M Characters |
|----------|----------------------|
| **Google Cloud Translation** | $20 |
| **DeepL API Pro** | $25 |
| **AWS Translate** | $15 |
| **Azure Translator** | $10 |

**Estimated monthly translation costs** (10k restaurants, 5 languages):
- Initial indexing: ~$50-100 (one-time)
- Ongoing updates: ~$10-20/month

---

## Part 10: Fallback Strategy

If Elasticsearch is unavailable:

```typescript
// lib/services/search/SearchService.ts
export class SearchService {
  private es: ElasticsearchService;
  private pg: PostgresSearchService;

  async search(params: SearchParams): Promise<SearchResult> {
    try {
      // Try Elasticsearch first
      return await this.es.search(params);
    } catch (error) {
      console.error('ES search failed, falling back to PostgreSQL:', error);

      // Fallback to PostgreSQL with pg_trgm
      return await this.pg.search(params);
    }
  }
}

// PostgreSQL fallback using trigram similarity
class PostgresSearchService {
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, filters, location, page = 1, pageSize = 20 } = params;

    const result = await this.pool.query(`
      SELECT r.*,
             similarity(r.name, $1) AS name_sim,
             CASE WHEN $2::float IS NOT NULL
                  THEN ST_Distance(
                    ST_MakePoint(r.longitude, r.latitude)::geography,
                    ST_MakePoint($2, $3)::geography
                  ) / 1000.0
                  ELSE NULL
             END AS distance_km
      FROM restaurants r
      WHERE r.deleted_at IS NULL
        AND (
          r.name % $1
          OR r.name ILIKE '%' || $1 || '%'
          OR EXISTS (SELECT 1 FROM unnest(r.cuisines) c WHERE c ILIKE '%' || $1 || '%')
        )
        ${filters.cuisines?.length ? 'AND r.cuisines && $4' : ''}
        ${filters.priceRange?.length ? 'AND r.price_range = ANY($5)' : ''}
      ORDER BY name_sim DESC, r.average_score DESC
      LIMIT $6 OFFSET $7
    `, [query, location?.lng, location?.lat, filters.cuisines, filters.priceRange, pageSize, (page - 1) * pageSize]);

    return {
      results: result.rows,
      total: result.rowCount,
      page,
      pageSize
    };
  }
}
```

---

## Conclusion

This implementation plan provides:

1. **Elasticsearch Integration**: Full-text search with fuzzy matching, geo queries, faceted search, and autocomplete
2. **Translation Support**: Multi-language search and content translation for global expansion
3. **Hybrid Architecture**: PostgreSQL as source of truth, Elasticsearch for search, with automatic synchronization
4. **Fallback Strategy**: Graceful degradation to PostgreSQL if Elasticsearch is unavailable
5. **Scalability**: Architecture supports growth from MVP to 100k+ users

The estimated timeline is 6-8 weeks for full implementation, with costs ranging from $50-300/month depending on scale and hosting choices.
