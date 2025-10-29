import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => MockDataService.getCurrentUser(),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => MockDataService.getUserById(userId),
    enabled: !!userId,
  });
}

export function useUserByUsername(username: string) {
  return useQuery({
    queryKey: ['user', 'username', username],
    queryFn: () => MockDataService.getUserByUsername(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => MockDataService.getUserReviews(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useIsFollowing(userId: string, targetUserId: string) {
  return useQuery({
    queryKey: ['following', userId, targetUserId],
    queryFn: () => MockDataService.isFollowing(userId, targetUserId),
    enabled: !!userId && !!targetUserId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
