import { useQuery } from '@tanstack/react-query'
import { MockDataService } from '@/lib/mockDataService'

export function useListProgress(userId: string, listId: string) {
  return useQuery({
    queryKey: ['list-progress', userId, listId],
    queryFn: () => MockDataService.getUserListProgress(userId, listId),
    enabled: !!userId && !!listId,
    staleTime: 5 * 60 * 1000, // 5 minutes - progress doesn't change frequently
  })
}
