import { useQuery } from '@tanstack/react-query';
import MockDataService from '@/lib/mockDataService';
import { TasteProfileStats } from '@/types';

export function useTasteProfile(userId: string, days: number = 30, enabled: boolean = true) {
  return useQuery<TasteProfileStats>({
    queryKey: ['tasteProfile', userId, days],
    queryFn: () => MockDataService.getUserTasteProfile(userId, days),
    enabled: !!userId && enabled, // Only run query when userId is available AND enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
