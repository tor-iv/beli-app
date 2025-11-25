/**
 * BaseService
 *
 * Provides shared utilities for all data services including:
 * - Network delay simulation
 * - Cache management
 * - Common helper functions
 *
 * Ported from beli-web with React Native adaptations.
 */

/**
 * Simulates network latency for mock data operations
 * @param ms - Delay in milliseconds (default: 100ms for mobile, slightly higher than web)
 */
export async function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cache entry with value and timestamp
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Simple in-memory cache with TTL support
 */
export class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttl: number;
  private maxSize: number;

  constructor(ttlMs: number = 5 * 60 * 1000, maxSize: number = 100) {
    this.ttl = ttlMs;
    this.maxSize = maxSize;
  }

  /**
   * Get cached value if not expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cached value with current timestamp
   * Implements LRU eviction if cache is full
   */
  set(key: string, value: T): void {
    // Evict oldest entries if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldest: { key: string; timestamp: number } | null = null;

    for (const [key, entry] of this.cache) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = { key, timestamp: entry.timestamp };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Global cache instance for match percentages
 * Exported for use across services that need user match calculations
 */
export const matchPercentageCache = new SimpleCache<number>(5 * 60 * 1000); // 5-minute TTL

/**
 * Global following relationships storage
 * Exported for use by social-related services
 */
export const followingRelationships: Map<string, Set<string>> = new Map();

/**
 * Demo user ID used across the app
 */
export const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';

/**
 * Generate a unique ID (for mock data)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Deep clone an object (for mock data mutations)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
