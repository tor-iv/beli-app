import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => MockDataService.searchUsers(''),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => MockDataService.getUserById(userId),
    enabled: !!userId,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => MockDataService.searchUsers(query),
    enabled: query.length > 0,
  });
}
