import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';
import { TastemakerPost } from '@/types';

export function useTastemakerPosts(limit?: number) {
  return useQuery<TastemakerPost[]>({
    queryKey: ['tastemaker-posts', limit],
    queryFn: () => MockDataService.getTastemakerPosts(limit),
  });
}

export function useFeaturedTastemakerPosts(limit?: number) {
  return useQuery<TastemakerPost[]>({
    queryKey: ['featured-tastemaker-posts', limit],
    queryFn: () => MockDataService.getFeaturedTastemakerPosts(limit),
  });
}

export function useTastemakerPost(postId: string) {
  return useQuery<TastemakerPost | null>({
    queryKey: ['tastemaker-post', postId],
    queryFn: () => MockDataService.getTastemakerPostById(postId),
    enabled: !!postId,
  });
}
