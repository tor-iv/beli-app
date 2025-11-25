/**
 * Restaurant Hooks
 *
 * React Query hooks for restaurant data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RestaurantService } from '../services';
import type { Restaurant } from '../../types';

/**
 * Get all restaurants
 */
export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => RestaurantService.getAllRestaurants(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get a single restaurant by ID
 */
export function useRestaurant(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => RestaurantService.getRestaurantById(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Search restaurants with query and filters
 */
export function useSearchRestaurants(
  query: string,
  filters?: {
    cuisine?: string[];
    priceRange?: string[];
    neighborhood?: string;
    maxDistance?: number;
  },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['restaurants', 'search', query, filters],
    queryFn: () => RestaurantService.searchRestaurants(query, filters),
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get trending restaurants
 */
export function useTrendingRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'trending'],
    queryFn: () => RestaurantService.getTrendingRestaurants(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Get random restaurants
 */
export function useRandomRestaurants(count: number = 5) {
  return useQuery({
    queryKey: ['restaurants', 'random', count],
    queryFn: () => RestaurantService.getRandomRestaurants(count),
    staleTime: 0, // Always fetch fresh random restaurants
    refetchOnMount: true,
  });
}

/**
 * Get restaurant recommendations for a user
 */
export function useRestaurantRecommendations(userId: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', 'recommendations', userId],
    queryFn: () => RestaurantService.getRestaurantRecommendations(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get multiple restaurants by IDs
 */
export function useRestaurantsByIds(restaurantIds: string[]) {
  return useQuery({
    queryKey: ['restaurants', 'byIds', restaurantIds],
    queryFn: () => RestaurantService.getRestaurantsByIds(restaurantIds),
    enabled: restaurantIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get restaurants with status (open/closed)
 */
export function useRestaurantsWithStatus(
  restaurantIds: string[],
  filters?: {
    openNow?: boolean;
    acceptsReservations?: boolean;
    sortBy?: 'rating' | 'distance' | 'name';
  }
) {
  return useQuery({
    queryKey: ['restaurants', 'withStatus', restaurantIds, filters],
    queryFn: () => RestaurantService.getRestaurantsWithStatus(restaurantIds, filters),
    enabled: restaurantIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes (status changes frequently)
  });
}
