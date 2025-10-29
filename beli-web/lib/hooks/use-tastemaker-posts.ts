import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';
import { TastemakerPost } from '@/types';

export function useTastemakerPosts(limit?: number) {
  return useQuery<TastemakerPost[]>({
    queryKey: ['tastemaker-posts', limit],
    queryFn: () => MockDataService.getTastemakerPosts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - posts don't change frequently
  });
}

export function useFeaturedTastemakerPosts(limit?: number) {
  return useQuery<TastemakerPost[]>({
    queryKey: ['featured-tastemaker-posts', limit],
    queryFn: () => MockDataService.getFeaturedTastemakerPosts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - featured posts rarely change
  });
}

export function useTastemakerPost(postId: string) {
  return useQuery<TastemakerPost | null>({
    queryKey: ['tastemaker-post', postId],
    queryFn: () => MockDataService.getTastemakerPostById(postId),
    enabled: !!postId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
