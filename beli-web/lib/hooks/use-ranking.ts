import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { RankingService } from '@/lib/services';

import type { Restaurant, ListCategory, RankingResult } from '@/types';

// Query hook to fetch ranked restaurants
export function useRankedRestaurants(userId: string | undefined, category: ListCategory) {
  return useQuery({
    queryKey: ['ranked-restaurants', userId, category],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return RankingService.getRankedRestaurants(userId, category);
    },
    enabled: !!userId,
  });
}

// Mutation hook to add a ranked restaurant
export function useAddRankedRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      restaurantId,
      result,
      data,
    }: {
      userId: string;
      restaurantId: string;
      result: RankingResult;
      data?: {
        notes?: string;
        photos?: string[];
        tags?: string[];
        companions?: string[];
      };
    }) => {
      return RankingService.insertRankedRestaurant(
        userId,
        restaurantId,
        result.category,
        result.finalPosition,
        result.rating,
        data
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate ranked restaurants query
      queryClient.invalidateQueries({
        queryKey: ['ranked-restaurants', variables.userId, variables.result.category],
      });

      // Invalidate feed query
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });

      // Invalidate user lists
      queryClient.invalidateQueries({
        queryKey: ['user-lists', variables.userId],
      });

      // Invalidate restaurant detail if it exists
      queryClient.invalidateQueries({
        queryKey: ['restaurant', variables.restaurantId],
      });

      // Invalidate user stats
      queryClient.invalidateQueries({
        queryKey: ['user', variables.userId],
      });
    },
  });
}
