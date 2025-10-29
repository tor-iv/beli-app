import { useQuery } from '@tanstack/react-query'
import { MockDataService } from '@/lib/mockDataService'

export function useFeaturedLists() {
  return useQuery({
    queryKey: ['featured-lists'],
    queryFn: () => MockDataService.getFeaturedLists(),
    staleTime: 15 * 60 * 1000, // 15 minutes - featured lists rarely change
  })
}
