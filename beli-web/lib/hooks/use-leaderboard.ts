import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => MockDataService.getLeaderboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes - leaderboard is computationally expensive
  });
}
