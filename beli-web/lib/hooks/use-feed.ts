import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useFeed(userId?: string) {
  return useQuery({
    queryKey: ['feed', userId],
    queryFn: () => MockDataService.getActivityFeed(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes - feed updates frequently but not instantly
  });
}
