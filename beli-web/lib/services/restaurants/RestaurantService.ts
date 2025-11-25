/**
 * RestaurantService
 *
 * Core restaurant management including:
 * - Restaurant CRUD operations
 * - Search with complex filtering
 * - Trending and recommendations
 * - Discovery features
 * - Restaurant status and hours (open/closed, closing times)
 *
 * Now connected to Supabase PostgreSQL database.
 * Supports automatic fallback to mock data via withFallback().
 *
 * NOTE: Status/hours functionality (parseHours, isRestaurantOpen, getClosingTime) was merged from RestaurantStatusService.
 */

import { withFallback, useMockData } from '@/lib/data-provider';
import { mockRestaurants } from '@/data/mock/restaurants';
import { mapDbToRestaurant, DbRestaurant, DbRating, DbUserFollow } from '../mappers';
import { delay } from '../base/BaseService';

import type { Restaurant } from '@/types';

// Lazy import supabase to avoid throwing when env vars missing in mock mode
const getSupabase = async () => {
  const { supabase } = await import('@/lib/supabase/client');
  return supabase;
};

export class RestaurantService {
  /**
   * Get all restaurants
   * @returns All restaurants sorted by rating descending
   */
  static async getAllRestaurants(): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('rating', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapDbToRestaurant);
      },
      () => [...mockRestaurants].sort((a, b) => b.rating - a.rating),
      { operationName: 'getAllRestaurants' }
    );

    return data;
  }

  /**
   * Get a restaurant by ID
   * @param restaurantId - ID of the restaurant
   * @returns Restaurant or null if not found
   */
  static async getRestaurantById(restaurantId: string): Promise<Restaurant | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();

        if (error || !data) throw error || new Error('Restaurant not found');
        return mapDbToRestaurant(data);
      },
      () => mockRestaurants.find((r) => r.id === restaurantId) || null,
      { operationName: 'getRestaurantById' }
    );

    return data;
  }

  /**
   * Search restaurants with text query and filters
   * Uses PostgreSQL ILIKE for text search (Elasticsearch handles advanced search via /api/search)
   *
   * @param query - Text search query
   * @param filters - Optional filters (cuisine, price range, neighborhood, distance)
   * @returns Filtered restaurants
   */
  static async searchRestaurants(
    query: string,
    filters?: {
      cuisine?: string[];
      priceRange?: string[];
      neighborhood?: string;
      maxDistance?: number;
    }
  ): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        let queryBuilder = supabase.from('restaurants').select('*');

        // Text search using ILIKE on name (PostgreSQL full-text search fallback)
        if (query.trim()) {
          queryBuilder = queryBuilder.ilike('name', `%${query.trim()}%`);
        }

        // Cuisine filter - check if any cuisine matches
        if (filters?.cuisine && filters.cuisine.length > 0) {
          // PostgreSQL array overlap operator
          queryBuilder = queryBuilder.overlaps('cuisine', filters.cuisine);
        }

        // Price range filter
        if (filters?.priceRange && filters.priceRange.length > 0) {
          queryBuilder = queryBuilder.in('price_range', filters.priceRange);
        }

        // Neighborhood filter
        if (filters?.neighborhood) {
          queryBuilder = queryBuilder.eq('neighborhood', filters.neighborhood);
        }

        // Order by rating
        queryBuilder = queryBuilder.order('rating', { ascending: false });

        const { data, error } = await queryBuilder;
        if (error) throw error;
        return (data || []).map(mapDbToRestaurant);
      },
      () => {
        // Mock data search implementation
        let results = [...mockRestaurants];
        const q = query.trim().toLowerCase();

        if (q) {
          results = results.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
              r.location.neighborhood?.toLowerCase().includes(q)
          );
        }

        if (filters?.cuisine?.length) {
          results = results.filter((r) =>
            r.cuisine.some((c) => filters.cuisine!.includes(c))
          );
        }

        if (filters?.priceRange?.length) {
          results = results.filter((r) =>
            filters.priceRange!.includes(r.priceRange)
          );
        }

        if (filters?.neighborhood) {
          results = results.filter(
            (r) => r.location.neighborhood === filters.neighborhood
          );
        }

        return results.sort((a, b) => b.rating - a.rating);
      },
      { operationName: 'searchRestaurants' }
    );

    return data;
  }

  /**
   * Get multiple restaurants by their IDs
   * @param restaurantIds - Array of restaurant IDs
   * @returns Restaurants matching the IDs
   */
  static async getRestaurantsByIds(restaurantIds: string[]): Promise<Restaurant[]> {
    if (restaurantIds.length === 0) return [];

    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds);

        if (error) throw error;
        return (data || []).map(mapDbToRestaurant);
      },
      () => mockRestaurants.filter((r) => restaurantIds.includes(r.id)),
      { operationName: 'getRestaurantsByIds' }
    );

    return data;
  }

  /**
   * Get trending restaurants
   * Returns top-rated restaurants (rating >= 7.5)
   * @returns Trending restaurants sorted by rating
   */
  static async getTrendingRestaurants(): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .gte('rating', 7.5)
          .order('rating', { ascending: false })
          .limit(10);

        if (error) throw error;
        return (data || []).map(mapDbToRestaurant);
      },
      () =>
        mockRestaurants
          .filter((r) => r.rating >= 7.5)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10),
      { operationName: 'getTrendingRestaurants' }
    );

    return data.length > 0 ? data : this.getRandomRestaurants(6);
  }

  /**
   * Get random restaurants
   * Useful for discovery features
   * @param count - Number of random restaurants to return (default: 5)
   * @returns Random selection of restaurants
   */
  static async getRandomRestaurants(count: number = 5): Promise<Restaurant[]> {
    // Fisher-Yates shuffle for unbiased random selection
    const shuffle = <T>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('rating', { ascending: false })
          .limit(count * 3);

        if (error) throw error;
        return shuffle(data || [])
          .slice(0, count)
          .map(mapDbToRestaurant);
      },
      () => shuffle(mockRestaurants).slice(0, count),
      { operationName: 'getRandomRestaurants' }
    );

    return data;
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
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get restaurants user has already rated
        const { data: userRatings, error: ratingsError } = await supabase
          .from('ratings')
          .select('restaurant_id')
          .eq('user_id', userId)
          .returns<Pick<DbRating, 'restaurant_id'>[]>();

        if (ratingsError) throw ratingsError;

        const visitedIds = new Set((userRatings || []).map((r) => r.restaurant_id));

        // Get top-rated restaurants
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('rating', { ascending: false })
          .limit(50)
          .returns<DbRestaurant[]>();

        if (error) throw error;

        // Filter out visited restaurants
        return (data || [])
          .filter((r: DbRestaurant) => !visitedIds.has(r.id))
          .slice(0, 12)
          .map(mapDbToRestaurant);
      },
      () => {
        // For mock, just return top-rated restaurants
        return mockRestaurants
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 12);
      },
      { operationName: 'getRestaurantRecommendations' }
    );

    return data.length > 0 ? data : this.getRandomRestaurants(6);
  }

  /**
   * Get reservable restaurants
   * Used for profile page discovery
   * @param limit - Maximum number to return (default: 10)
   * @returns Top-rated reservable restaurants
   */
  static async getReservableRestaurants(limit: number = 10): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('accepts_reservations', true)
          .order('rating', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return (data || []).map(mapDbToRestaurant);
      },
      () =>
        mockRestaurants
          .filter((r) => r.acceptsReservations)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit),
      { operationName: 'getReservableRestaurants' }
    );

    return data;
  }

  /**
   * Get nearby restaurant recommendations within a distance
   * Filters to good ratings (7.5+) within the specified radius
   *
   * @param userId - ID of the user (for future location-based features)
   * @param maxDistance - Maximum distance in miles (default: 2.0) - Not yet implemented
   * @param limit - Maximum number to return (default: 10)
   * @returns Nearby restaurants sorted by rating
   */
  static async getNearbyRecommendations(
    _userId: string, // Prefixed with _ to indicate intentionally unused
    _maxDistance: number = 2.0, // TODO: Implement PostGIS ST_DWithin when user location available
    limit: number = 10
  ): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // TODO: Implement PostGIS distance query when user location is available
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .gte('rating', 7.5)
          .order('rating', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return (data || []).map(mapDbToRestaurant);
      },
      () =>
        mockRestaurants
          .filter((r) => r.rating >= 7.5)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit),
      { operationName: 'getNearbyRecommendations' }
    );

    return data;
  }

  /**
   * Get friend-recommended restaurants
   * Returns restaurants that user's friends have rated highly
   *
   * @param userId - ID of the user
   * @param limit - Maximum number to return (default: 10)
   * @returns Friend-recommended restaurants
   */
  static async getFriendRecommendations(userId: string, limit: number = 10): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get user's friends (people they follow)
        const { data: following, error: followError } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId)
          .returns<Pick<DbUserFollow, 'following_id'>[]>();

        if (followError) throw followError;

        if (!following || following.length === 0) {
          return null; // Will fallback to trending
        }

        const friendIds = following.map((f) => f.following_id);

        // Get restaurants highly rated by friends (rating >= 8.0)
        const { data: friendRatings, error: ratingsError } = await supabase
          .from('ratings')
          .select('restaurant_id, rating')
          .in('user_id', friendIds)
          .eq('status', 'been')
          .gte('rating', 8.0)
          .returns<Pick<DbRating, 'restaurant_id' | 'rating'>[]>();

        if (ratingsError) throw ratingsError;

        if (!friendRatings || friendRatings.length === 0) {
          return null; // Will fallback to trending
        }

        // Get unique restaurant IDs
        const restaurantIds = [...new Set(friendRatings.map((r) => r.restaurant_id))];

        // Fetch those restaurants
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds.slice(0, limit));

        if (error) throw error;
        return (data || []).map(mapDbToRestaurant).sort((a, b) => b.rating - a.rating);
      },
      () => {
        // For mock, return restaurants marked as recommended by friends
        return mockRestaurants
          .filter((r) => r.recommendedBy && r.recommendedBy.length > 0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit);
      },
      { operationName: 'getFriendRecommendations' }
    );

    // If null result, return trending
    if (!data || data.length === 0) {
      return this.getTrendingRestaurants();
    }

    return data;
  }

  // ============================================
  // Status Methods (merged from RestaurantStatusService)
  // ============================================

  /**
   * Parse hours string into numeric open/close times
   * @param hoursString - Hours string like "7:30 AM - 12:00 AM"
   * @returns Object with open and close times in decimal hours, or null if closed
   */
  static parseHours(hoursString: string): { open: number; close: number } | null {
    if (hoursString.toLowerCase() === 'closed') {
      return null;
    }

    // Parse hours like "7:30 AM - 12:00 AM" or "11:00 AM - 11:00 PM"
    const match = hoursString.match(
      /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );
    if (!match) return null;

    const [, openHour, openMin, openAmPm, closeHour, closeMin, closeAmPm] = match;

    let openTime = parseInt(openHour) + parseInt(openMin) / 60;
    let closeTime = parseInt(closeHour) + parseInt(closeMin) / 60;

    if (openAmPm.toUpperCase() === 'PM' && parseInt(openHour) !== 12) {
      openTime += 12;
    }
    if (openAmPm.toUpperCase() === 'AM' && parseInt(openHour) === 12) {
      openTime = parseInt(openMin) / 60;
    }

    if (closeAmPm.toUpperCase() === 'PM' && parseInt(closeHour) !== 12) {
      closeTime += 12;
    }
    if (closeAmPm.toUpperCase() === 'AM' && parseInt(closeHour) === 12) {
      closeTime = parseInt(closeMin) / 60;
    }

    // Handle overnight hours (e.g., 11 PM - 3 AM)
    if (closeTime < openTime) {
      closeTime += 24;
    }

    return { open: openTime, close: closeTime };
  }

  /**
   * Check if a restaurant is currently open
   * @param restaurant - Restaurant to check
   * @param currentTime - Optional time to check (defaults to now)
   * @returns True if restaurant is open
   */
  static isRestaurantOpen(restaurant: Restaurant, currentTime?: Date): boolean {
    if (!restaurant.hours) return false;
    const now = currentTime || new Date();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    const currentDay = dayNames[now.getDay()];
    const currentHour = now.getHours() + now.getMinutes() / 60;

    const todayHours = restaurant.hours[currentDay];
    const parsedHours = this.parseHours(todayHours);

    if (!parsedHours) return false;

    // Handle overnight restaurants
    if (parsedHours.close > 24) {
      return currentHour >= parsedHours.open || currentHour <= parsedHours.close - 24;
    }

    return currentHour >= parsedHours.open && currentHour <= parsedHours.close;
  }

  /**
   * Get the closing time for a restaurant
   * @param restaurant - Restaurant to check
   * @param currentTime - Optional time to check (defaults to now)
   * @returns Formatted closing time string or null if no hours
   */
  static getClosingTime(restaurant: Restaurant, currentTime?: Date): string | null {
    if (!restaurant.hours) return null;
    const now = currentTime || new Date();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    const currentDay = dayNames[now.getDay()];

    const todayHours = restaurant.hours[currentDay];
    const parsedHours = this.parseHours(todayHours);

    if (!parsedHours) return null;

    let closeHour = parsedHours.close;
    if (closeHour > 24) closeHour -= 24;

    const hour = Math.floor(closeHour);
    const minute = Math.round((closeHour - hour) * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  /**
   * Get restaurants with status information and filtering
   * Enriches restaurant data with isOpen, closingTime, and acceptsReservations
   * Supports filtering and sorting
   *
   * @param restaurantIds - Array of restaurant IDs to include
   * @param filters - Optional filters (openNow, acceptsReservations, sortBy)
   * @returns Restaurants with status information
   */
  static async getRestaurantsWithStatus(
    restaurantIds: string[],
    filters?: {
      openNow?: boolean;
      acceptsReservations?: boolean;
      sortBy?: 'rating' | 'distance' | 'name';
    }
  ): Promise<Restaurant[]> {
    await delay();

    let restaurants = mockRestaurants.filter((r) => restaurantIds.includes(r.id));

    // Add status information
    restaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      isOpen: this.isRestaurantOpen(restaurant),
      closingTime: this.getClosingTime(restaurant),
      acceptsReservations: Math.random() > 0.3, // Mock: 70% accept reservations
    }));

    // Apply filters
    if (filters?.openNow) {
      restaurants = restaurants.filter((r) => r.isOpen);
    }

    if (filters?.acceptsReservations) {
      restaurants = restaurants.filter((r) => r.acceptsReservations);
    }

    // Apply sorting
    if (filters?.sortBy === 'rating') {
      restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters?.sortBy === 'distance') {
      restaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (filters?.sortBy === 'name') {
      restaurants.sort((a, b) => a.name.localeCompare(b.name));
    }

    return restaurants;
  }
}
