import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useLists(userId?: string) {
  return useQuery({
    queryKey: ['lists', userId],
    queryFn: () => MockDataService.getUserLists(userId || 'user1'),
  });
}
