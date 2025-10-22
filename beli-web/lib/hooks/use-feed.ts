import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useFeed(userId?: string) {
  return useQuery({
    queryKey: ['feed', userId],
    queryFn: () => MockDataService.getActivityFeed(userId),
  });
}
