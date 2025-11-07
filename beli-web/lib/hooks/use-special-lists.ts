import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';
import { Restaurant } from '@/types';

/**
 * Hook for fetching reservable restaurants
 * @param limit - Number of restaurants to fetch (default: 20)
 * @param options - Additional React Query options
 */
export function useReservableRestaurants(
  limit: number = 20,
  options?: Omit<UseQueryOptions<Restaurant[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['restaurants', 'reservable', limit],
    queryFn: () => MockDataService.getReservableRestaurants(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Note: Additional special list hooks (group-friendly, delivery, outdoor seating, date-night, budget)
// were planned but the corresponding MockDataService methods don't exist yet.
// These can be added when the service methods are implemented.
