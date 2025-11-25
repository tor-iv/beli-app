/**
 * Tastemaker Hooks
 *
 * React Query hooks for tastemaker profiles and content.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TastemakerService } from '../services/tastemakers/TastemakerService';
import type { User, TastemakerPost } from '../../types';

/**
 * Get all tastemakers
 */
export function useTastemakers() {
  return useQuery({
    queryKey: ['tastemakers'],
    queryFn: () => TastemakerService.getAllTastemakers(),
    staleTime: 10 * 60 * 1000, // Tastemakers don't change often
  });
}

/**
 * Get a specific tastemaker by ID
 */
export function useTastemaker(id: string | undefined) {
  return useQuery({
    queryKey: ['tastemaker', id],
    queryFn: () => TastemakerService.getTastemakerById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get tastemakers by specialty
 */
export function useTastemakersBySpecialty(specialty: string | undefined) {
  return useQuery({
    queryKey: ['tastemakers', 'specialty', specialty],
    queryFn: () => TastemakerService.getTastemakersBySpecialty(specialty!),
    enabled: !!specialty,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Search tastemakers
 */
export function useSearchTastemakers(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['tastemakers', 'search', query],
    queryFn: () => TastemakerService.searchTastemakers(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get featured tastemakers
 */
export function useFeaturedTastemakers(limit: number = 5) {
  return useQuery({
    queryKey: ['tastemakers', 'featured', limit],
    queryFn: () => TastemakerService.getFeaturedTastemakers(limit),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get all tastemaker posts
 */
export function useTastemakerPosts() {
  return useQuery({
    queryKey: ['tastemaker-posts'],
    queryFn: () => TastemakerService.getAllPosts(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get posts by a specific tastemaker
 */
export function useTastemakerPostsByAuthor(tastmakerId: string | undefined) {
  return useQuery({
    queryKey: ['tastemaker-posts', 'author', tastmakerId],
    queryFn: () => TastemakerService.getPostsByTastemaker(tastmakerId!),
    enabled: !!tastmakerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get a specific post by ID
 */
export function useTastemakerPost(postId: string | undefined) {
  return useQuery({
    queryKey: ['tastemaker-post', postId],
    queryFn: () => TastemakerService.getPostById(postId!),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get trending posts
 */
export function useTrendingPosts(limit: number = 10) {
  return useQuery({
    queryKey: ['tastemaker-posts', 'trending', limit],
    queryFn: () => TastemakerService.getTrendingPosts(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Like a post mutation
 */
export function useLikeTastemakerPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      TastemakerService.likePost(postId, userId),
    onMutate: async ({ postId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['tastemaker-post', postId] });
      const previousPost = queryClient.getQueryData<TastemakerPost>(['tastemaker-post', postId]);

      if (previousPost) {
        queryClient.setQueryData<TastemakerPost>(['tastemaker-post', postId], {
          ...previousPost,
          interactions: {
            ...previousPost.interactions,
            likes: [...previousPost.interactions.likes, userId],
          },
        });
      }

      return { previousPost };
    },
    onError: (_err, { postId }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['tastemaker-post', postId], context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tastemaker-posts'] });
    },
  });
}

/**
 * Unlike a post mutation
 */
export function useUnlikeTastemakerPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      TastemakerService.unlikePost(postId, userId),
    onMutate: async ({ postId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['tastemaker-post', postId] });
      const previousPost = queryClient.getQueryData<TastemakerPost>(['tastemaker-post', postId]);

      if (previousPost) {
        queryClient.setQueryData<TastemakerPost>(['tastemaker-post', postId], {
          ...previousPost,
          interactions: {
            ...previousPost.interactions,
            likes: previousPost.interactions.likes.filter((id) => id !== userId),
          },
        });
      }

      return { previousPost };
    },
    onError: (_err, { postId }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['tastemaker-post', postId], context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tastemaker-posts'] });
    },
  });
}
