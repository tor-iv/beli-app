# Semantic Search Plan (SHELVED)

> **Status:** On hold - Focus on Elasticsearch performance demo first
> **Revisit after:** Demonstrating ES speed gains over Supabase ILIKE

---

## What It Does

Enables natural language queries like "cozy date night spot" to find restaurants by *meaning*, not just keywords.

```
"romantic Italian dinner" → Finds Le Bernardin, Carbone
(even though those exact words aren't in the restaurant data)
```

---

## How It Works (Simple)

1. **Gemini API** converts query text → 768 numbers (embedding)
2. **Supabase pgvector** finds restaurants with similar number patterns
3. Results ranked by semantic similarity

---

## Why It's Slower Than Elasticsearch

| Search Type | Latency | Why |
|-------------|---------|-----|
| Elasticsearch | 10-50ms | All internal, indexed |
| Semantic | 150-400ms | External API call to Gemini |

**Not ideal for demonstrating speed.** Save for "smart search" feature later.

---

## How Companies Handle Semantic Search at Scale

### The Problem
Every search query needs an embedding (API call = 100-300ms latency).

### Solutions Used in Production

#### 1. **Embedding Cache** (Most Common)
Store query → embedding mappings. Same query = instant lookup.

```
"date night" → [0.023, -0.041, ...] (cached)
"DATE NIGHT" → normalize → "date night" → cache hit!
```

**Who uses it:** Everyone. Redis or in-memory LRU cache.

#### 2. **Pre-computed Popular Queries**
Generate embeddings for common searches ahead of time.

```
Top 1000 queries:
- "pizza" → [...]
- "sushi" → [...]
- "date night" → [...]
- "cheap eats" → [...]
```

**Who uses it:** Yelp, DoorDash, Airbnb

#### 3. **Local Embedding Models**
Run embedding model on your own servers (no API latency).

| Model | Latency | Quality |
|-------|---------|---------|
| Gemini API | 100-300ms | Excellent |
| Local all-MiniLM | 5-20ms | Good |
| Local GPU model | 1-5ms | Excellent |

**Who uses it:** Google, Netflix, Spotify (they have GPU infrastructure)

#### 4. **Async/Background Embedding**
Don't block the search - show keyword results first, then enhance.

```
1. User searches "cozy dinner"
2. Instantly show keyword results (ES)
3. In background: generate embedding
4. Update results with semantic matches (feels like "more results loading")
```

**Who uses it:** Google Search, Amazon

#### 5. **Hybrid with Smart Routing**
Only use semantic search when needed.

```
"Balthazar" → keyword only (exact match likely)
"cozy romantic spot" → semantic (no exact match possible)
```

**Who uses it:** Airbnb, Zillow

#### 6. **Edge/CDN Embedding**
Run small embedding models at CDN edge locations.

**Who uses it:** Cloudflare Workers AI, Vercel Edge Functions

---

## What We Could Do (Future)

### Quick Win: Query Cache
```typescript
const cache = new Map<string, number[]>();

async function getEmbedding(query: string): Promise<number[]> {
  const normalized = query.toLowerCase().trim();

  if (cache.has(normalized)) {
    return cache.get(normalized)!; // Instant!
  }

  const embedding = await geminiEmbed(normalized);
  cache.set(normalized, embedding);
  return embedding;
}
```

### Medium Effort: Pre-compute Top Queries
```typescript
const COMMON_QUERIES = [
  "pizza", "sushi", "italian", "mexican", "thai",
  "date night", "brunch", "cheap eats", "fine dining",
  "outdoor seating", "late night", "family friendly"
];

// Run once at startup or daily
for (const query of COMMON_QUERIES) {
  await precomputeEmbedding(query);
}
```

### Advanced: Hybrid Routing
```typescript
function shouldUseSemantic(query: string): boolean {
  // Skip semantic for likely restaurant names
  if (isProperNoun(query)) return false;

  // Use semantic for descriptive queries
  const descriptiveWords = ["cozy", "romantic", "cheap", "best", "good for"];
  return descriptiveWords.some(w => query.includes(w));
}
```

---

## Implementation Summary (When Ready)

### Cost: $0/month
- Gemini free tier (1,500 requests/day)
- Supabase pgvector (free)

### Files to Create
- `beli-web/lib/embeddings/embedding-service.ts` - Gemini client + cache
- `beli-web/lib/search/semantic-search.ts` - pgvector queries
- `supabase/migrations/00013_semantic_search.sql` - Add vector column

### Time Estimate: ~6.5 hours

---

## Key Takeaway

> **At scale, the secret is caching and pre-computation.**
> The embedding model is slow, but the same queries repeat constantly.
> Cache aggressively, pre-compute popular queries, and use semantic search selectively.
