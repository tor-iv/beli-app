import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';
import { Review } from '@/types';

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
    queryFn: () => MockDataService.getRestaurantReviews(restaurantId),
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
    queryFn: () => MockDataService.getUserReviews(userId),
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
    mutationFn: (review: any) => MockDataService.addReview(review),
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
