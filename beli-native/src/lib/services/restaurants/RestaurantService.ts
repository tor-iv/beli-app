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
 * Ported from beli-web with React Native adaptations.
 * Supports automatic fallback to mock data via withFallback().
 */

import { withFallback } from '../../data-provider';
import { mockRestaurants } from '../../../data/mock/restaurants';
import { mapDbToRestaurant, DbRestaurant } from '../mappers';
import { delay } from '../base/BaseService';
import type { Restaurant } from '../../../types';

// Lazy import supabase to avoid throwing when env vars missing in mock mode
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
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
        return (data || []).map((row: DbRestaurant) => mapDbToRestaurant(row));
      },
      async () => {
        await delay();
        return [...mockRestaurants].sort((a, b) => b.rating - a.rating);
      },
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
        return mapDbToRestaurant(data as DbRestaurant);
      },
      async () => {
        await delay();
        return mockRestaurants.find((r) => r.id === restaurantId) || null;
      },
      { operationName: 'getRestaurantById' }
    );

    return data;
  }

  /**
   * Search restaurants with text query and filters
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

        // Text search using ILIKE on name
        if (query.trim()) {
          queryBuilder = queryBuilder.ilike('name', `%${query.trim()}%`);
        }

        // Cuisine filter
        if (filters?.cuisine && filters.cuisine.length > 0) {
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

        queryBuilder = queryBuilder.order('rating', { ascending: false });

        const { data, error } = await queryBuilder;
        if (error) throw error;
        return (data || []).map((row: DbRestaurant) => mapDbToRestaurant(row));
      },
      async () => {
        await delay();
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
        return (data || []).map((row: DbRestaurant) => mapDbToRestaurant(row));
      },
      async () => {
        await delay();
        return mockRestaurants.filter((r) => restaurantIds.includes(r.id));
      },
      { operationName: 'getRestaurantsByIds' }
    );

    return data;
  }

  /**
   * Get trending restaurants
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
        return (data || []).map((row: DbRestaurant) => mapDbToRestaurant(row));
      },
      async () => {
        await delay();
        return mockRestaurants
          .filter((r) => r.rating >= 7.5)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);
      },
      { operationName: 'getTrendingRestaurants' }
    );

    return data.length > 0 ? data : this.getRandomRestaurants(6);
  }

  /**
   * Get random restaurants
   */
  static async getRandomRestaurants(count: number = 5): Promise<Restaurant[]> {
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
          .map((row: DbRestaurant) => mapDbToRestaurant(row));
      },
      async () => {
        await delay();
        return shuffle(mockRestaurants).slice(0, count);
      },
      { operationName: 'getRandomRestaurants' }
    );

    return data;
  }

  /**
   * Get personalized restaurant recommendations for a user
   */
  static async getRestaurantRecommendations(userId: string): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get restaurants user has already rated
        const { data: userRatings, error: ratingsError } = await supabase
          .from('ratings')
          .select('restaurant_id')
          .eq('user_id', userId);

        if (ratingsError) throw ratingsError;

        const visitedIds = new Set((userRatings || []).map((r: { restaurant_id: string }) => r.restaurant_id));

        // Get top-rated restaurants
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('rating', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Filter out visited restaurants
        return (data || [])
          .filter((r: DbRestaurant) => !visitedIds.has(r.id))
          .slice(0, 12)
          .map((row: DbRestaurant) => mapDbToRestaurant(row));
      },
      async () => {
        await delay();
        return mockRestaurants
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 12);
      },
      { operationName: 'getRestaurantRecommendations' }
    );

    return data.length > 0 ? data : this.getRandomRestaurants(6);
  }

  // ============================================
  // Status Methods
  // ============================================

  /**
   * Parse hours string into numeric open/close times
   */
  static parseHours(hoursString: string): { open: number; close: number } | null {
    if (hoursString.toLowerCase() === 'closed') {
      return null;
    }

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

    if (closeTime < openTime) {
      closeTime += 24;
    }

    return { open: openTime, close: closeTime };
  }

  /**
   * Check if a restaurant is currently open
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

    if (parsedHours.close > 24) {
      return currentHour >= parsedHours.open || currentHour <= parsedHours.close - 24;
    }

    return currentHour >= parsedHours.open && currentHour <= parsedHours.close;
  }

  /**
   * Get the closing time for a restaurant
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

    restaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      isOpen: this.isRestaurantOpen(restaurant),
      closingTime: this.getClosingTime(restaurant),
      acceptsReservations: restaurant.acceptsReservations ?? Math.random() > 0.3,
    }));

    if (filters?.openNow) {
      restaurants = restaurants.filter((r) => r.isOpen);
    }

    if (filters?.acceptsReservations) {
      restaurants = restaurants.filter((r) => r.acceptsReservations);
    }

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
