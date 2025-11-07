import { useQuery } from '@tanstack/react-query';

import { ListService } from '@/lib/services';

export function useFeaturedLists() {
  return useQuery({
    queryKey: ['featured-lists'],
    queryFn: () => ListService.getFeaturedLists(),
    staleTime: 15 * 60 * 1000, // 15 minutes - featured lists rarely change
  });
}
