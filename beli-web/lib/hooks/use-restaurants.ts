import { useQuery } from '@tanstack/react-query';

import { RestaurantService } from '@/lib/services';

import type { Restaurant } from '@/types';
import type { UseQueryOptions } from '@tanstack/react-query';

export function useRestaurants(
  options?: Omit<UseQueryOptions<Restaurant[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => RestaurantService.getAllRestaurants(),
    staleTime: 10 * 60 * 1000, // 10 minutes - restaurants don't change often
    ...options,
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

export interface SearchLocationParams {
  lat: number;
  lng: number;
}

// Map search API result to Restaurant type
interface SearchApiResult {
  id: string;
  name: string;
  cuisine: string[];
  neighborhood: string | null;
  city: string | null;
  address: string | null;
  price_range: string | null;
  rating: number | null;
  rating_count: number;
  phone: string | null;
  website: string | null;
  location: { lat: number; lon: number } | null;
  score: number;
}

function mapSearchResultToRestaurant(result: SearchApiResult): Restaurant {
  return {
    id: result.id,
    name: result.name,
    cuisine: result.cuisine || [],
    rating: Number(result.rating) || 0,
    priceRange: result.price_range || '$$',
    location: {
      address: result.address || '',
      city: result.city || '',
      state: '', // Not provided by search API
      neighborhood: result.neighborhood || '',
      coordinates: result.location
        ? { lat: result.location.lat, lng: result.location.lon }
        : { lat: 0, lng: 0 },
    },
    phone: result.phone || undefined,
    website: result.website || undefined,
    images: [], // Not provided by search API
    popularDishes: [], // Not provided by search API
    ratingCount: result.rating_count,
    distance: result.score, // For geo-search, score is distance in km
  };
}

export function useSearchRestaurants(
  query: string,
  options?: {
    location?: SearchLocationParams;
  }
) {
  const { location } = options || {};

  return useQuery({
    queryKey: ['restaurants', 'search', query, location?.lat, location?.lng],
    queryFn: async (): Promise<Restaurant[]> => {
      // Always use /api/search - it supports both geo and non-geo search
      const params = new URLSearchParams({ q: query || '' });

      // Add location params if provided
      if (location) {
        params.set('lat', String(location.lat));
        params.set('lon', String(location.lng));
        params.set('distance', '5mi');
      }

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      const results: SearchApiResult[] = data.results || [];
      return results.map(mapSearchResultToRestaurant);
    },
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
