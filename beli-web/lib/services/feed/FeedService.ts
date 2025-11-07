/**
 * FeedService
 *
 * Manages social activity feed including:
 * - Fetching activity feed
 * - Creating new activity items
 */

import { delay } from '../base/BaseService';
import { mockActivities, Activity } from '@/data/mock/activities';
import { FeedItem } from '@/types';

export class FeedService {
  /**
   * Get activity feed
   * Returns activities sorted by timestamp (newest first)
   *
   * @param userId - Optional user ID to filter activities by user
   * @param limit - Maximum number of activities to return (default: 20)
   * @returns Sorted and filtered activities
   */
  static async getActivityFeed(userId?: string, limit: number = 20): Promise<Activity[]> {
    await delay();

    // If userId is provided, filter for that user's activity
    let activities = userId
      ? mockActivities.filter(activity => activity.user.id === userId)
      : mockActivities;

    // Sort by timestamp (newest first) and limit results
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Add a new activity to the feed
   * Creates a new activity item with interactions initialized
   *
   * @param activity - Activity data without ID
   * @returns The created activity with ID and interactions
   */
  static async addActivity(activity: Omit<FeedItem, 'id'>): Promise<Activity> {
    await delay();

    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      interactions: {
        likes: [],
        comments: [],
        bookmarks: [],
      },
    };

    // In a real app, this would save to the backend
    mockActivities.unshift(newActivity);
    return newActivity;
  }
}
