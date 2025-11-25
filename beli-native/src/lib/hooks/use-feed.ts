/**
 * Feed Hooks
 *
 * React Query hooks for activity feed data and interactions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedService, Activity } from '../services/feed/FeedService';
import { useSyncStore } from '../store/syncStore';
import { isOnline } from '../data-provider';

/**
 * Get the activity feed for current user
 */
export function useFeed(userId?: string, limit: number = 50) {
  return useQuery({
    queryKey: ['feed', userId, limit],
    queryFn: () => FeedService.getActivityFeed(userId, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - feed should be relatively fresh
  });
}

/**
 * Get activities for a specific user
 */
export function useUserActivities(userId: string | undefined, limit: number = 20) {
  return useQuery({
    queryKey: ['activities', userId, limit],
    queryFn: () => FeedService.getUserActivities(userId!, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Like an activity mutation
 */
export function useLikeActivity() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ activityId, userId }: { activityId: string; userId: string }) => {
      if (!isOnline()) {
        addMutation('like_activity', { activityId, userId });
        return;
      }
      return FeedService.likeActivity(activityId, userId);
    },
    onMutate: async ({ activityId, userId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData<Activity[]>(['feed']);

      // Optimistically update the feed
      if (previousFeed) {
        queryClient.setQueryData<Activity[]>(['feed'], (old): Activity[] | undefined => {
          if (!old) return old;
          return old.map((activity): Activity =>
            activity.id === activityId
              ? {
                  ...activity,
                  interactions: {
                    likes: [...(activity.interactions?.likes || []), userId],
                    comments: activity.interactions?.comments || [],
                    bookmarks: activity.interactions?.bookmarks || [],
                  },
                }
              : activity
          );
        });
      }

      return { previousFeed };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Unlike an activity mutation
 */
export function useUnlikeActivity() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ activityId, userId }: { activityId: string; userId: string }) => {
      if (!isOnline()) {
        addMutation('unlike_activity', { activityId, userId });
        return;
      }
      return FeedService.unlikeActivity(activityId, userId);
    },
    onMutate: async ({ activityId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData<Activity[]>(['feed']);

      if (previousFeed) {
        queryClient.setQueryData<Activity[]>(['feed'], (old): Activity[] | undefined => {
          if (!old) return old;
          return old.map((activity): Activity =>
            activity.id === activityId
              ? {
                  ...activity,
                  interactions: {
                    likes: activity.interactions?.likes.filter((id) => id !== userId) || [],
                    comments: activity.interactions?.comments || [],
                    bookmarks: activity.interactions?.bookmarks || [],
                  },
                }
              : activity
          );
        });
      }

      return { previousFeed };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Bookmark an activity mutation
 */
export function useBookmarkActivity() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ activityId, userId }: { activityId: string; userId: string }) => {
      if (!isOnline()) {
        addMutation('bookmark_activity', { activityId, userId });
        return;
      }
      return FeedService.bookmarkActivity(activityId, userId);
    },
    onMutate: async ({ activityId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData<Activity[]>(['feed']);

      if (previousFeed) {
        queryClient.setQueryData<Activity[]>(['feed'], (old): Activity[] | undefined => {
          if (!old) return old;
          return old.map((activity): Activity =>
            activity.id === activityId
              ? {
                  ...activity,
                  interactions: {
                    likes: activity.interactions?.likes || [],
                    comments: activity.interactions?.comments || [],
                    bookmarks: [...(activity.interactions?.bookmarks || []), userId],
                  },
                }
              : activity
          );
        });
      }

      return { previousFeed };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Remove bookmark mutation
 */
export function useUnbookmarkActivity() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ activityId, userId }: { activityId: string; userId: string }) => {
      if (!isOnline()) {
        addMutation('unbookmark_activity', { activityId, userId });
        return;
      }
      return FeedService.unbookmarkActivity(activityId, userId);
    },
    onMutate: async ({ activityId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData<Activity[]>(['feed']);

      if (previousFeed) {
        queryClient.setQueryData<Activity[]>(['feed'], (old): Activity[] | undefined => {
          if (!old) return old;
          return old.map((activity): Activity =>
            activity.id === activityId
              ? {
                  ...activity,
                  interactions: {
                    likes: activity.interactions?.likes || [],
                    comments: activity.interactions?.comments || [],
                    bookmarks: activity.interactions?.bookmarks.filter((id) => id !== userId) || [],
                  },
                }
              : activity
          );
        });
      }

      return { previousFeed };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Add comment mutation
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

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
      if (!isOnline()) {
        addMutation('add_comment', { activityId, userId, content });
        return { id: 'pending', userId, content, timestamp: new Date() };
      }
      return FeedService.addComment(activityId, userId, content);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Utility hook to check if activity is liked
 */
export function useIsActivityLiked(activity: Activity | undefined, userId: string): boolean {
  if (!activity) return false;
  return FeedService.isLikedByUser(activity, userId);
}

/**
 * Utility hook to check if activity is bookmarked
 */
export function useIsActivityBookmarked(activity: Activity | undefined, userId: string): boolean {
  if (!activity) return false;
  return FeedService.isBookmarkedByUser(activity, userId);
}
