import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ListService, UserRestaurantService } from '@/lib/services';

import type { List } from '@/types';
import type { UseQueryOptions } from '@tanstack/react-query';

export function useLists(
  userId?: string,
  options?: Omit<UseQueryOptions<List[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['lists', userId],
    queryFn: () => ListService.getUserLists(userId || '00000000-0000-0000-0000-000000000001'),
    ...options,
  });
}

/**
 * Hook for adding a restaurant to a user's list
 */
export function useAddToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      userId: string;
      restaurantId: string;
      status: 'been' | 'want_to_try' | 'recommended';
      data?: {
        rating?: number;
        review?: string;
        visitDate?: string;
      };
    }) =>
      UserRestaurantService.addRestaurantToUserList(
        params.userId,
        params.restaurantId,
        params.status,
        params.data
      ),
    onSuccess: (_, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: ['lists', variables.userId],
      });

      // Invalidate list counts
      queryClient.invalidateQueries({
        queryKey: ['list-counts', variables.userId],
      });

      // Invalidate restaurant relations
      queryClient.invalidateQueries({
        queryKey: ['restaurant-relations', variables.userId],
      });

      // Invalidate user-restaurants (new query key for UserRestaurantService)
      queryClient.invalidateQueries({
        queryKey: ['user-restaurants', variables.userId],
      });

      // Invalidate feed
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

/**
 * Hook for removing a restaurant from a user's list
 */
export function useRemoveFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; restaurantId: string }) =>
      UserRestaurantService.removeRestaurantFromUserList(params.userId, params.restaurantId),
    onSuccess: (_, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: ['lists', variables.userId],
      });

      // Invalidate list counts
      queryClient.invalidateQueries({
        queryKey: ['list-counts', variables.userId],
      });

      // Invalidate restaurant relations
      queryClient.invalidateQueries({
        queryKey: ['restaurant-relations', variables.userId],
      });

      // Invalidate user-restaurants (new query key for UserRestaurantService)
      queryClient.invalidateQueries({
        queryKey: ['user-restaurants', variables.userId],
      });

      // Invalidate feed (may show remove activity)
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

/**
 * Hook for updating a list
 */
export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { listId: string; updates: Partial<List> }) =>
      ListService.updateList(params.listId, params.updates),
    onSuccess: () => {
      // Invalidate all lists (we don't know which user owns it)
      queryClient.invalidateQueries({
        queryKey: ['lists'],
      });
    },
  });
}
