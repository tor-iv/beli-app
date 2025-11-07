import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FeedInteractionService } from '@/lib/services';

import type { Activity, ActivityComment } from '@/types';

/**
 * Hook to toggle like on an activity
 * Uses optimistic updates for instant UI feedback
 */
export function useLikeActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activityId,
      userId,
      isLiked,
    }: {
      activityId: string;
      userId: string;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        await FeedInteractionService.unlikeActivity(activityId, userId);
      } else {
        await FeedInteractionService.likeActivity(activityId, userId);
      }
    },
    onMutate: async ({ activityId, userId, isLiked }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot the previous value for rollback
      const previousFeed = queryClient.getQueryData<Activity[]>(['feed']);

      // Optimistically update the cache
      if (previousFeed) {
        queryClient.setQueryData<Activity[]>(
          ['feed'],
          previousFeed.map((activity) => {
            if (activity.id === activityId && activity.interactions) {
              const likes = [...activity.interactions.likes];
              if (isLiked) {
                // Remove like
                const index = likes.indexOf(userId);
                if (index > -1) likes.splice(index, 1);
              } else {
                // Add like
                if (!likes.includes(userId)) likes.push(userId);
              }
              return {
                ...activity,
                interactions: {
                  ...activity.interactions,
                  likes,
                },
              };
            }
            return activity;
          })
        );
      }

      // Return context with snapshotted value
      return { previousFeed };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Hook to toggle bookmark on an activity
 * Uses optimistic updates for instant UI feedback
 */
export function useBookmarkActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activityId,
      userId,
      isBookmarked,
    }: {
      activityId: string;
      userId: string;
      isBookmarked: boolean;
    }) => {
      if (isBookmarked) {
        await FeedInteractionService.unbookmarkActivity(activityId, userId);
      } else {
        await FeedInteractionService.bookmarkActivity(activityId, userId);
      }
    },
    onMutate: async ({ activityId, userId, isBookmarked }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot the previous value for rollback
      const previousFeed = queryClient.getQueryData<Activity[]>(['feed']);

      // Optimistically update the cache
      if (previousFeed) {
        queryClient.setQueryData<Activity[]>(
          ['feed'],
          previousFeed.map((activity) => {
            if (activity.id === activityId && activity.interactions) {
              const bookmarks = [...activity.interactions.bookmarks];
              if (isBookmarked) {
                // Remove bookmark
                const index = bookmarks.indexOf(userId);
                if (index > -1) bookmarks.splice(index, 1);
              } else {
                // Add bookmark
                if (!bookmarks.includes(userId)) bookmarks.push(userId);
              }
              return {
                ...activity,
                interactions: {
                  ...activity.interactions,
                  bookmarks,
                },
              };
            }
            return activity;
          })
        );
      }

      // Return context with snapshotted value
      return { previousFeed };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Hook to add a comment to an activity
 * Uses optimistic updates for instant UI feedback
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activityId,
      userId,
      content,
    }: {
      activityId: string;
      userId: string;
      content: string;
    }) => {
      return FeedInteractionService.addCommentToActivity(activityId, userId, content);
    },
    onMutate: async ({ activityId, userId, content }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot the previous value for rollback
      const previousFeed = queryClient.getQueryData<Activity[]>(['feed']);

      // Create optimistic comment
      const optimisticComment: ActivityComment = {
        id: `temp-${Date.now()}`,
        userId,
        content,
        timestamp: new Date(),
      };

      // Optimistically update the cache
      if (previousFeed) {
        queryClient.setQueryData<Activity[]>(
          ['feed'],
          previousFeed.map((activity) => {
            if (activity.id === activityId && activity.interactions) {
              return {
                ...activity,
                interactions: {
                  ...activity.interactions,
                  comments: [...activity.interactions.comments, optimisticComment],
                },
              };
            }
            return activity;
          })
        );
      }

      // Return context with snapshotted value
      return { previousFeed };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
