/**
 * SearchHistoryService
 *
 * Manages user's recent restaurant searches including:
 * - Fetching recent searches
 * - Adding new searches
 * - Clearing search history
 */

import { delay } from '../base/BaseService';
import { mockRestaurants } from '@/data/mock/restaurants';
import { mockRecentSearches } from '@/data/mock/recentSearches';
import { RecentSearch } from '@/types';

export class SearchHistoryService {
  /**
   * Get user's recent searches
   * @returns List of recent searches
   */
  static async getRecentSearches(): Promise<RecentSearch[]> {
    await delay();
    return mockRecentSearches;
  }

  /**
   * Add a restaurant to recent searches
   * Maintains a maximum of 10 recent searches
   * @param restaurantId - ID of the restaurant to add to recent searches
   */
  static async addRecentSearch(restaurantId: string): Promise<void> {
    await delay();
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const newSearch: RecentSearch = {
        id: `recent-${Date.now()}`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        location: `${restaurant.location.neighborhood}, ${restaurant.location.city}`,
        timestamp: new Date(),
      };
      mockRecentSearches.unshift(newSearch);
      // Keep only the 10 most recent
      mockRecentSearches.splice(10);
    }
  }

  /**
   * Clear a specific search from history
   * @param searchId - ID of the search to remove
   */
  static async clearRecentSearch(searchId: string): Promise<void> {
    await delay();
    const index = mockRecentSearches.findIndex(s => s.id === searchId);
    if (index !== -1) {
      mockRecentSearches.splice(index, 1);
    }
  }
}
