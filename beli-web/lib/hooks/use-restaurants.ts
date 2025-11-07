import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => MockDataService.getAllRestaurants(),
    staleTime: 10 * 60 * 1000, // 10 minutes - restaurants don't change often
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => MockDataService.getRestaurantById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRestaurantsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['restaurants', 'byIds', [...ids].sort().join(',')], // Fix: Create copy before sorting to avoid mutation
    queryFn: () => MockDataService.getRestaurantsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchRestaurants(query: string, filters?: any) {
  return useQuery({
    queryKey: ['restaurants', 'search', query, filters],
    queryFn: () => MockDataService.searchRestaurants(query, filters),
    enabled: query.length > 0,
  });
}
