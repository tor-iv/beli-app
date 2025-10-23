import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => MockDataService.getAllRestaurants(),
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => MockDataService.getRestaurantById(id),
    enabled: !!id,
  });
}

export function useSearchRestaurants(query: string, filters?: any) {
  return useQuery({
    queryKey: ['restaurants', 'search', query, filters],
    queryFn: () => MockDataService.searchRestaurants(query, filters),
    enabled: query.length > 0,
  });
}
