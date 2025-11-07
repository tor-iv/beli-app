import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { RestaurantService } from '@/lib/services';
import { Restaurant } from '@/types';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => RestaurantService.getAllRestaurants(),
    staleTime: 10 * 60 * 1000, // 10 minutes - restaurants don't change often
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => RestaurantService.getRestaurantById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRestaurantsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['restaurants', 'byIds', [...ids].sort().join(',')], // Fix: Create copy before sorting to avoid mutation
    queryFn: () => RestaurantService.getRestaurantsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchRestaurants(query: string, filters?: any) {
  return useQuery({
    queryKey: ['restaurants', 'search', query, filters],
    queryFn: () => RestaurantService.searchRestaurants(query, filters),
    enabled: query.length > 0,
  });
}

/**
 * Hook for fetching trending restaurants
 */
export function useTrendingRestaurants(
  options?: Omit<UseQueryOptions<Restaurant[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['restaurants', 'trending'],
    queryFn: () => RestaurantService.getTrendingRestaurants(),
    staleTime: 5 * 60 * 1000, // 5 minutes - trending updates fairly frequently
    ...options,
  });
}

/**
 * Hook for fetching nearby restaurant recommendations
 */
export function useNearbyRecommendations(
  userId: string = 'current-user',
  radiusMiles: number = 2.0,
  limit: number = 20,
  options?: Omit<UseQueryOptions<Restaurant[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['restaurants', 'nearby', userId, radiusMiles, limit],
    queryFn: () => RestaurantService.getNearbyRecommendations(userId, radiusMiles, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook for fetching friend recommendations
 */
export function useFriendRecommendations(
  userId: string = 'current-user',
  limit: number = 20,
  options?: Omit<UseQueryOptions<Restaurant[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['restaurants', 'friend-recs', userId, limit],
    queryFn: () => RestaurantService.getFriendRecommendations(userId, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
