/**
 * BaseService
 *
 * Provides shared utilities for all data services including:
 * - Network delay simulation
 * - Cache management
 * - Common helper functions
 */

/**
 * Simulates network latency for mock data operations
 * @param ms - Delay in milliseconds (default: 50ms)
 */
export async function delay(ms: number = 50): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttl = ttlMs;
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
   */
  set(key: string, value: T): void {
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
