import { useQuery } from '@tanstack/react-query'
import { ListService } from '@/lib/services'

export function useListProgress(userId: string, listId: string) {
  return useQuery({
    queryKey: ['list-progress', userId, listId],
    queryFn: () => ListService.getUserListProgress(userId, listId),
    enabled: !!userId && !!listId,
    staleTime: 5 * 60 * 1000, // 5 minutes - progress doesn't change frequently
  })
}
