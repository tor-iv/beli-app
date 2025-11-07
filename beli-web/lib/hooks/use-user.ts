import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService, SocialService, ReviewService } from '@/lib/services';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => UserService.getCurrentUser(),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: !!userId,
  });
}

export function useUserByUsername(username: string) {
  return useQuery({
    queryKey: ['user', 'username', username],
    queryFn: () => UserService.getUserByUsername(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => ReviewService.getUserReviews(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useIsFollowing(userId: string, targetUserId: string) {
  return useQuery({
    queryKey: ['following', userId, targetUserId],
    queryFn: () => SocialService.isFollowing(userId, targetUserId),
    enabled: !!userId && !!targetUserId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook for following a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; targetUserId: string }) =>
      SocialService.followUser(params.userId, params.targetUserId),
    onSuccess: (_, variables) => {
      // Invalidate following status
      queryClient.invalidateQueries({
        queryKey: ['following', variables.userId, variables.targetUserId],
      });

      // Invalidate user data (follower counts may have changed)
      queryClient.invalidateQueries({
        queryKey: ['user', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', variables.targetUserId],
      });

      // Invalidate feed (may show new content from followed user)
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

/**
 * Hook for unfollowing a user
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; targetUserId: string }) =>
      SocialService.unfollowUser(params.userId, params.targetUserId),
    onSuccess: (_, variables) => {
      // Invalidate following status
      queryClient.invalidateQueries({
        queryKey: ['following', variables.userId, variables.targetUserId],
      });

      // Invalidate user data (follower counts may have changed)
      queryClient.invalidateQueries({
        queryKey: ['user', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', variables.targetUserId],
      });

      // Invalidate feed
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

// Note: useUpdateUserPreferences hook was planned but the corresponding
// MockDataService.updateUserPreferences method doesn't exist yet.
// This can be added when the service method is implemented.
