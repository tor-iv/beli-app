import { useQuery } from '@tanstack/react-query';
import { FeedService } from '@/lib/services';

export function useFeed(userId?: string) {
  return useQuery({
    queryKey: ['feed', userId],
    queryFn: () => FeedService.getActivityFeed(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes - feed updates frequently but not instantly
  });
}

// Note: useLikeActivity, useBookmarkActivity, and useAddComment are already
// defined in use-feed-interactions.ts with optimistic updates. Use those instead.
