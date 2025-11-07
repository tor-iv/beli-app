import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ReviewService } from '@/lib/services';

import type { Review } from '@/types';
import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Hook for fetching all reviews for a specific restaurant
 * @param restaurantId - The ID of the restaurant
 * @param options - Additional React Query options
 */
export function useRestaurantReviews(
  restaurantId: string,
  options?: Omit<UseQueryOptions<Review[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reviews', 'restaurant', restaurantId],
    queryFn: () => ReviewService.getRestaurantReviews(restaurantId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook for fetching all reviews by a specific user
 * NOTE: This duplicates useUserReviews from use-user.ts
 * Consider importing from there instead to avoid duplication
 */
export function useUserReviews(
  userId: string,
  options?: Omit<UseQueryOptions<Review[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => ReviewService.getUserReviews(userId),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook for adding a new review
 */
export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (review: any) => ReviewService.addReview(review),
    onSuccess: (newReview) => {
      // Invalidate restaurant reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'restaurant', newReview.restaurantId],
      });

      // Invalidate user reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'user', newReview.userId],
      });

      // Invalidate restaurant data (rating may have changed)
      queryClient.invalidateQueries({
        queryKey: ['restaurant', newReview.restaurantId],
      });

      // Invalidate feed (new review activity)
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

// Note: updateReview and deleteReview hooks were planned but the corresponding
// MockDataService methods don't exist yet. These can be added when the service
// methods are implemented.
