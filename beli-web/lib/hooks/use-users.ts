import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => MockDataService.searchUsers(''),
    staleTime: 10 * 60 * 1000, // 10 minutes - user list doesn't change often
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => MockDataService.getUserById(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => MockDataService.searchUsers(query),
    enabled: query.length > 0,
  });
}

export function useUserMatchPercentage(currentUserId: string, targetUserId: string) {
  return useQuery({
    queryKey: ['user-match', currentUserId, targetUserId],
    queryFn: () => MockDataService.getUserMatchPercentage(currentUserId, targetUserId),
    enabled: !!currentUserId && !!targetUserId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useBatchMatchPercentages(currentUserId: string, targetUserIds: string[]) {
  return useQuery({
    queryKey: ['user-match-batch', currentUserId, targetUserIds.sort().join(',')],
    queryFn: () => MockDataService.getBatchMatchPercentages(currentUserId, targetUserIds),
    enabled: !!currentUserId && targetUserIds.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
