/**
 * RestaurantService
 *
 * Core restaurant management including:
 * - Restaurant CRUD operations
 * - Search with complex filtering
 * - Trending and recommendations
 * - Discovery features
 */

import { delay } from '../base/BaseService';
import { mockRestaurants } from '@/data/mock/restaurants';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockUsers } from '@/data/mock/users';
import { trendingRestaurants } from '@/data/mock/activities';
import { Restaurant } from '@/types';

export class RestaurantService {
  /**
   * Get all restaurants
   * @returns All restaurants
   */
  static async getAllRestaurants(): Promise<Restaurant[]> {
    await delay();
    return mockRestaurants;
  }

  /**
   * Get a restaurant by ID
   * @param restaurantId - ID of the restaurant
   * @returns Restaurant or null if not found
   */
  static async getRestaurantById(restaurantId: string): Promise<Restaurant | null> {
    await delay();
    return mockRestaurants.find(restaurant => restaurant.id === restaurantId) || null;
  }

  /**
   * Search restaurants with text query and filters
   * Searches across name, location, cuisine, tags, and popular dishes
   *
   * @param query - Text search query
   * @param filters - Optional filters (cuisine, price range, neighborhood, distance)
   * @returns Filtered restaurants
   */
  static async searchRestaurants(query: string, filters?: {
    cuisine?: string[];
    priceRange?: string[];
    neighborhood?: string;
    maxDistance?: number;
  }): Promise<Restaurant[]> {
    await delay();
    let filteredRestaurants = mockRestaurants;

    // Text search
    if (query.trim()) {
      const lowercaseQuery = query.trim().toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(restaurant => {
        const textFields: string[] = [
          restaurant.name,
          restaurant.location.neighborhood,
          restaurant.location.city,
          restaurant.location.state,
          restaurant.location.address,
          restaurant.priceRange,
          ...(restaurant.cuisine ?? []),
          ...(restaurant.tags ?? []),
          ...(restaurant.popularDishes ?? []),
        ];

        return textFields.some(field =>
          typeof field === 'string' && field.toLowerCase().includes(lowercaseQuery)
        );
      });
    }

    // Cuisine filter
    if (filters?.cuisine && filters.cuisine.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.cuisine.some(c => filters.cuisine!.includes(c))
      );
    }

    // Price range filter
    if (filters?.priceRange && filters.priceRange.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        filters.priceRange!.includes(restaurant.priceRange)
      );
    }

    // Neighborhood filter
    if (filters?.neighborhood) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.location.neighborhood === filters.neighborhood
      );
    }

    // Distance filter
    if (filters?.maxDistance) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.distance && restaurant.distance <= filters.maxDistance!
      );
    }

    return filteredRestaurants;
  }

  /**
   * Get multiple restaurants by their IDs
   * @param restaurantIds - Array of restaurant IDs
   * @returns Restaurants matching the IDs
   */
  static async getRestaurantsByIds(restaurantIds: string[]): Promise<Restaurant[]> {
    await delay();
    const idSet = new Set(restaurantIds);
    return mockRestaurants.filter(restaurant => idSet.has(restaurant.id));
  }

  /**
   * Get trending restaurants
   * Returns restaurants from trending activity or random high-rated restaurants
   * @returns Trending restaurants sorted by rating
   */
  static async getTrendingRestaurants(): Promise<Restaurant[]> {
    const restaurantIds = trendingRestaurants.map(restaurant => restaurant.id);
    if (restaurantIds.length === 0) {
      const randomSelection = await this.getRandomRestaurants(6);
      return randomSelection.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const restaurants = await this.getRestaurantsByIds(restaurantIds);
    return restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * Get random restaurants
   * Useful for discovery features
   * @param count - Number of random restaurants to return (default: 5)
   * @returns Random selection of restaurants
   */
  static async getRandomRestaurants(count: number = 5): Promise<Restaurant[]> {
    await delay();
    const shuffled = [...mockRestaurants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get personalized restaurant recommendations for a user
   * Excludes restaurants the user has already visited
   * Returns top-rated restaurants they haven't been to
   *
   * @param userId - ID of the user
   * @returns Recommended restaurants sorted by rating
   */
  static async getRestaurantRecommendations(userId: string): Promise<Restaurant[]> {
    await delay();

    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];

    const visitedIds = new Set(
      mockUserRestaurantRelations
        .filter(relation => relation.userId === userId)
        .map(relation => relation.restaurantId)
    );

    const candidates = mockRestaurants
      .filter(restaurant => !visitedIds.has(restaurant.id))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 12);

    if (candidates.length === 0) {
      const randomSelection = await this.getRandomRestaurants(6);
      return randomSelection.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return candidates;
  }

  /**
   * Get reservable restaurants
   * Used for profile page discovery
   * @param limit - Maximum number to return (default: 10)
   * @returns Top-rated reservable restaurants
   */
  static async getReservableRestaurants(limit: number = 10): Promise<Restaurant[]> {
    await delay();
    return mockRestaurants
      .filter(r => r.acceptsReservations === true)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  /**
   * Get nearby restaurant recommendations within a distance
   * Filters to good ratings (7.5+) within the specified radius
   *
   * @param userId - ID of the user (for future location-based features)
   * @param maxDistance - Maximum distance in miles (default: 2.0)
   * @param limit - Maximum number to return (default: 10)
   * @returns Nearby restaurants sorted by rating then distance
   */
  static async getNearbyRecommendations(userId: string, maxDistance: number = 2.0, limit: number = 10): Promise<Restaurant[]> {
    await delay();
    // Get restaurants that are nearby (within maxDistance miles) and have good ratings
    return mockRestaurants
      .filter(r => r.distance && r.distance <= maxDistance && r.rating >= 7.5)
      .sort((a, b) => {
        // Sort by rating descending, then by distance ascending
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
        return (a.distance || 0) - (b.distance || 0);
      })
      .slice(0, limit);
  }

  /**
   * Get friend-recommended restaurants
   * Returns restaurants that user's friends have been to or recommended
   *
   * @param userId - ID of the user
   * @param limit - Maximum number to return (default: 10)
   * @returns Friend-recommended restaurants
   */
  static async getFriendRecommendations(userId: string, limit: number = 10): Promise<Restaurant[]> {
    await delay();
    // For mock data, return highly-rated restaurants
    // In real app, would check friends' recommendations
    return mockRestaurants
      .filter(r => r.rating >= 8.0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }
}
