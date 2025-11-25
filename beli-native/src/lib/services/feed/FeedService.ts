/**
 * FeedService
 *
 * Manages social activity feed including:
 * - Fetching activity feed from followed users
 * - Creating new activity items
 * - Feed interactions (likes, bookmarks, comments)
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import { mockActivities, Activity } from '../../../data/mock/activities';
import { delay, DEMO_USER_ID } from '../base/BaseService';
import type { FeedItem, ActivityComment } from '../../../types';

// Re-export Activity type for convenience
export type { Activity } from '../../../data/mock/activities';

// Lazy import supabase
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
};

export class FeedService {
  /**
   * Get activity feed for the current user
   */
  static async getActivityFeed(userId?: string, limit: number = 50): Promise<Activity[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        // Get user's feed using RPC function or fallback query
        const { data, error } = await supabase
          .rpc('get_user_feed', { p_user_id: targetUserId, p_limit: limit });

        if (error) throw error;

        // Transform to Activity type (simplified for now)
        return (data || []).map((row: Record<string, unknown>) => ({
          ...row,
          interactions: { likes: [], comments: [], bookmarks: [] },
        })) as Activity[];
      },
      async () => {
        await delay();
        return [...mockActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      },
      { operationName: 'getActivityFeed' }
    );

    return data;
  }

  /**
   * Get activities for a specific user
   */
  static async getUserActivities(userId: string, limit: number = 20): Promise<Activity[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data as unknown as Activity[];
      },
      async () => {
        await delay();
        return mockActivities
          .filter((a) => a.user.id === userId)
          .slice(0, limit);
      },
      { operationName: 'getUserActivities' }
    );

    return data;
  }

  /**
   * Like an activity
   */
  static async likeActivity(activityId: string, userId: string): Promise<void> {
    await withFallback(
      async () => {
        // Supabase implementation would go here
        throw new Error('Not implemented');
      },
      async () => {
        await delay();
        const activity = mockActivities.find((a) => a.id === activityId);
        if (activity?.interactions && !activity.interactions.likes.includes(userId)) {
          activity.interactions.likes.push(userId);
        }
      },
      { operationName: 'likeActivity' }
    );
  }

  /**
   * Unlike an activity
   */
  static async unlikeActivity(activityId: string, userId: string): Promise<void> {
    await withFallback(
      async () => {
        throw new Error('Not implemented');
      },
      async () => {
        await delay();
        const activity = mockActivities.find((a) => a.id === activityId);
        if (activity?.interactions) {
          activity.interactions.likes = activity.interactions.likes.filter((id) => id !== userId);
        }
      },
      { operationName: 'unlikeActivity' }
    );
  }

  /**
   * Bookmark an activity
   */
  static async bookmarkActivity(activityId: string, userId: string): Promise<void> {
    await withFallback(
      async () => {
        throw new Error('Not implemented');
      },
      async () => {
        await delay();
        const activity = mockActivities.find((a) => a.id === activityId);
        if (activity?.interactions && !activity.interactions.bookmarks.includes(userId)) {
          activity.interactions.bookmarks.push(userId);
        }
      },
      { operationName: 'bookmarkActivity' }
    );
  }

  /**
   * Remove bookmark from activity
   */
  static async unbookmarkActivity(activityId: string, userId: string): Promise<void> {
    await withFallback(
      async () => {
        throw new Error('Not implemented');
      },
      async () => {
        await delay();
        const activity = mockActivities.find((a) => a.id === activityId);
        if (activity?.interactions) {
          activity.interactions.bookmarks = activity.interactions.bookmarks.filter((id) => id !== userId);
        }
      },
      { operationName: 'unbookmarkActivity' }
    );
  }

  /**
   * Add a comment to an activity
   */
  static async addComment(
    activityId: string,
    userId: string,
    content: string
  ): Promise<ActivityComment> {
    const comment: ActivityComment = {
      id: Math.random().toString(36).substring(2),
      userId,
      content,
      timestamp: new Date(),
    };

    await withFallback(
      async () => {
        throw new Error('Not implemented');
      },
      async () => {
        await delay();
        const activity = mockActivities.find((a) => a.id === activityId);
        if (activity?.interactions) {
          activity.interactions.comments.push(comment);
        }
      },
      { operationName: 'addComment' }
    );

    return comment;
  }

  /**
   * Check if user has liked an activity
   */
  static isLikedByUser(activity: Activity, userId: string): boolean {
    return activity.interactions?.likes.includes(userId) || false;
  }

  /**
   * Check if user has bookmarked an activity
   */
  static isBookmarkedByUser(activity: Activity, userId: string): boolean {
    return activity.interactions?.bookmarks.includes(userId) || false;
  }
}
