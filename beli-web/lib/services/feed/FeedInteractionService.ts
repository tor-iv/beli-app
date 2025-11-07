/**
 * FeedInteractionService
 *
 * Manages interactions with feed activities including:
 * - Liking/unliking activities
 * - Bookmarking/unbookmarking activities
 * - Adding comments to activities
 */

import { delay } from '../base/BaseService';
import { mockActivities } from '@/data/mock/activities';
import { ActivityComment } from '@/types';

export class FeedInteractionService {
  /**
   * Like an activity
   * Adds user to the activity's likes array
   *
   * @param activityId - ID of the activity to like
   * @param userId - ID of the user liking the activity
   */
  static async likeActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const likes = activity.interactions.likes;
      if (!likes.includes(userId)) {
        likes.push(userId);
      }
    }
  }

  /**
   * Unlike an activity
   * Removes user from the activity's likes array
   *
   * @param activityId - ID of the activity to unlike
   * @param userId - ID of the user unliking the activity
   */
  static async unlikeActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const likes = activity.interactions.likes;
      const index = likes.indexOf(userId);
      if (index > -1) {
        likes.splice(index, 1);
      }
    }
  }

  /**
   * Bookmark an activity
   * Adds user to the activity's bookmarks array
   *
   * @param activityId - ID of the activity to bookmark
   * @param userId - ID of the user bookmarking the activity
   */
  static async bookmarkActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const bookmarks = activity.interactions.bookmarks;
      if (!bookmarks.includes(userId)) {
        bookmarks.push(userId);
      }
    }
  }

  /**
   * Unbookmark an activity
   * Removes user from the activity's bookmarks array
   *
   * @param activityId - ID of the activity to unbookmark
   * @param userId - ID of the user unbookmarking the activity
   */
  static async unbookmarkActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const bookmarks = activity.interactions.bookmarks;
      const index = bookmarks.indexOf(userId);
      if (index > -1) {
        bookmarks.splice(index, 1);
      }
    }
  }

  /**
   * Add a comment to an activity
   * Creates a new comment and adds it to the activity's comments array
   *
   * @param activityId - ID of the activity to comment on
   * @param userId - ID of the user adding the comment
   * @param content - Text content of the comment
   * @returns The created comment
   * @throws Error if activity is not found
   */
  static async addCommentToActivity(
    activityId: string,
    userId: string,
    content: string
  ): Promise<ActivityComment> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (!activity || !activity.interactions) {
      throw new Error('Activity not found');
    }

    const newComment: ActivityComment = {
      id: `comment-${Date.now()}`,
      userId,
      content,
      timestamp: new Date(),
    };

    activity.interactions.comments.push(newComment);
    return newComment;
  }
}
