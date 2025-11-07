import { useQuery } from '@tanstack/react-query';
import { LeaderboardService } from '@/lib/services';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => LeaderboardService.getLeaderboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes - leaderboard is computationally expensive
  });
}
