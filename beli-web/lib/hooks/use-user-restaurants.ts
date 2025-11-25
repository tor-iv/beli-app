import { useQuery } from '@tanstack/react-query';

import { UserRestaurantService } from '@/lib/services';

import type { ListCategory } from '@/types';

/**
 * Hook for fetching user's restaurants by status (been, want_to_try, recommended)
 * with optional category filtering.
 *
 * This hook directly queries the user-restaurant relationship data,
 * bypassing the legacy ListService which reads from mockLists.
 *
 * @param userId - The user's ID
 * @param status - The relationship status to filter by
 * @param category - Optional category filter ('all' means no filter)
 * @param options - Query options like enabled
 */
export function useUserRestaurantsByStatus(
  userId: string,
  status: 'been' | 'want_to_try' | 'recommended',
  category?: ListCategory | 'all',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['user-restaurants', userId, status, category],
    queryFn: () => UserRestaurantService.getUserRestaurantsByStatus(userId, status, category),
    ...options,
  });
}

/**
 * Hook for fetching all of a user's restaurant relations (been, want_to_try, recommended)
 *
 * @param userId - The user's ID
 * @param options - Query options like enabled
 */
export function useUserRestaurantRelations(userId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['restaurant-relations', userId],
    queryFn: () => UserRestaurantService.getUserRestaurantRelations(userId),
    ...options,
  });
}
