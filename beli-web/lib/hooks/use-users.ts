import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/lib/services';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.searchUsers(''),
    staleTime: 10 * 60 * 1000, // 10 minutes - user list doesn't change often
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => UserService.searchUsers(query),
    enabled: query.length > 0,
  });
}

export function useUserMatchPercentage(currentUserId: string, targetUserId: string) {
  return useQuery({
    queryKey: ['user-match', currentUserId, targetUserId],
    queryFn: () => UserService.getUserMatchPercentage(currentUserId, targetUserId),
    enabled: !!currentUserId && !!targetUserId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useBatchMatchPercentages(currentUserId: string, targetUserIds: string[]) {
  return useQuery({
    queryKey: ['user-match-batch', currentUserId, targetUserIds.sort().join(',')],
    queryFn: () => UserService.getBatchMatchPercentages(currentUserId, targetUserIds),
    enabled: !!currentUserId && targetUserIds.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
