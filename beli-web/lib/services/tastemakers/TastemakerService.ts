/**
 * TastemakerService
 *
 * Manages tastemaker (food expert) profiles including:
 * - Fetching tastemaker profiles
 * - Tastemaker discovery and search
 */

import { mockTastemakers } from '@/data/mock/tastemakers';

import { delay } from '../base/BaseService';

import type { User } from '@/types';


export class TastemakerService {
  /**
   * Get all tastemakers sorted by follower count
   * @param limit - Optional limit for number of tastemakers to return
   * @returns Tastemakers sorted by follower count (descending)
   */
  static async getTastemakers(limit?: number): Promise<User[]> {
    await delay();
    const tastemakers = mockTastemakers.sort(
      (a, b) => (b.stats.followers || 0) - (a.stats.followers || 0)
    );
    return limit ? tastemakers.slice(0, limit) : tastemakers;
  }

  /**
   * Get a tastemaker by username
   * @param username - Username of the tastemaker
   * @returns Tastemaker user or null if not found
   */
  static async getTastemakerByUsername(username: string): Promise<User | null> {
    await delay();
    return mockTastemakers.find((tm) => tm.username === username) || null;
  }
}
