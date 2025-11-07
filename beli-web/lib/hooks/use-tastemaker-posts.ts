import { useQuery } from '@tanstack/react-query';

import { TastemakerPostService } from '@/lib/services';

import type { TastemakerPost } from '@/types';

export function useTastemakerPosts(limit?: number) {
  return useQuery<TastemakerPost[]>({
    queryKey: ['tastemaker-posts', limit],
    queryFn: () => TastemakerPostService.getTastemakerPosts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - posts don't change frequently
  });
}

export function useFeaturedTastemakerPosts(limit?: number) {
  return useQuery<TastemakerPost[]>({
    queryKey: ['featured-tastemaker-posts', limit],
    queryFn: () => TastemakerPostService.getFeaturedTastemakerPosts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - featured posts rarely change
  });
}

export function useTastemakerPost(postId: string) {
  return useQuery<TastemakerPost | null>({
    queryKey: ['tastemaker-post', postId],
    queryFn: () => TastemakerPostService.getTastemakerPostById(postId),
    enabled: !!postId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
