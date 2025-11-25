/**
 * User Hooks
 *
 * React Query hooks for user data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services';
import { useSyncStore } from '../store/syncStore';
import { isOnline } from '../data-provider';
import type { User } from '../../types';

/**
 * Get the current logged-in user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => UserService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get a user by ID
 */
export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUserById(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get a user by username
 */
export function useUserByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['user', 'username', username],
    queryFn: () => UserService.getUserByUsername(username!),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search users
 */
export function useSearchUsers(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => UserService.searchUsers(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get user statistics
 */
export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId, 'stats'],
    queryFn: () => UserService.getUserStats(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get match percentage between current user and another user
 */
export function useMatchPercentage(userId: string, targetUserId: string | undefined) {
  return useQuery({
    queryKey: ['match', userId, targetUserId],
    queryFn: () => UserService.getUserMatchPercentage(userId, targetUserId!),
    enabled: !!targetUserId && userId !== targetUserId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Check if current user is following another user
 */
export function useIsFollowing(userId: string, targetUserId: string | undefined) {
  return useQuery({
    queryKey: ['following', userId, targetUserId],
    queryFn: () => UserService.isFollowing(userId, targetUserId!),
    enabled: !!targetUserId && userId !== targetUserId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Follow a user mutation
 */
export function useFollowUser() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ userId, targetUserId }: { userId: string; targetUserId: string }) => {
      if (!isOnline()) {
        // Queue for offline sync
        addMutation('follow_user', { userId, targetUserId });
        return;
      }
      return UserService.followUser(userId, targetUserId);
    },
    onMutate: async ({ userId, targetUserId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['following', userId, targetUserId] });
      const previous = queryClient.getQueryData(['following', userId, targetUserId]);
      queryClient.setQueryData(['following', userId, targetUserId], true);
      return { previous };
    },
    onError: (_err, { userId, targetUserId }, context) => {
      // Rollback on error
      queryClient.setQueryData(['following', userId, targetUserId], context?.previous);
    },
    onSettled: (_, __, { userId, targetUserId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
      queryClient.invalidateQueries({ queryKey: ['user', targetUserId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId, 'stats'] });
    },
  });
}

/**
 * Unfollow a user mutation
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ userId, targetUserId }: { userId: string; targetUserId: string }) => {
      if (!isOnline()) {
        addMutation('unfollow_user', { userId, targetUserId });
        return;
      }
      return UserService.unfollowUser(userId, targetUserId);
    },
    onMutate: async ({ userId, targetUserId }) => {
      await queryClient.cancelQueries({ queryKey: ['following', userId, targetUserId] });
      const previous = queryClient.getQueryData(['following', userId, targetUserId]);
      queryClient.setQueryData(['following', userId, targetUserId], false);
      return { previous };
    },
    onError: (_err, { userId, targetUserId }, context) => {
      queryClient.setQueryData(['following', userId, targetUserId], context?.previous);
    },
    onSettled: (_, __, { userId, targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
      queryClient.invalidateQueries({ queryKey: ['user', targetUserId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId, 'stats'] });
    },
  });
}

/**
 * Get user's followers
 */
export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId, 'followers'],
    queryFn: () => UserService.getFollowers(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get users that a user is following
 */
export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId, 'following'],
    queryFn: () => UserService.getFollowing(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get leaderboard
 */
export function useLeaderboard(city?: string, limit: number = 20) {
  return useQuery({
    queryKey: ['leaderboard', city, limit],
    queryFn: () => UserService.getLeaderboard(city, limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get user's friends (for group dinner)
 */
export function useUserFriends(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId, 'friends'],
    queryFn: () => UserService.getUserFriends(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
