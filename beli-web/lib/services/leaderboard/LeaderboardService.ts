/**
 * LeaderboardService
 *
 * Manages user leaderboard and rankings including:
 * - Fetching leaderboard with optional city filtering
 * - User ranking comparisons
 */

import { mockUsers } from '@/data/mock/users';

import { delay } from '../base/BaseService';

import type { User } from '@/types';


export class LeaderboardService {
  /**
   * Get leaderboard of users sorted by rank
   * @param city - Optional city filter
   * @param limit - Maximum number of users to return (default: 50)
   * @returns Users sorted by rank (lower is better)
   */
  static async getLeaderboard(city?: string, limit: number = 50): Promise<User[]> {
    await delay();

    let users = [...mockUsers];

    // Filter by city if provided
    if (city) {
      users = users.filter((user) => user.location.city === city);
    }

    // Sort by rank (lower is better)
    return users.sort((a, b) => a.stats.rank - b.stats.rank).slice(0, limit);
  }
}
