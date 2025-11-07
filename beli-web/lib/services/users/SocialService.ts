/**
 * SocialService
 *
 * Manages social relationships between users including:
 * - Following/unfollowing users
 * - Getting followers and following lists
 * - Friend relationships for group features
 */

import { delay, followingRelationships } from '../base/BaseService';
import { mockUsers } from '@/data/mock/users';
import { User } from '@/types';

export class SocialService {
  /**
   * Check if a user is following another user
   * @param userId - ID of the user
   * @param targetUserId - ID of the target user
   * @returns True if user is following target
   */
  static async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    await delay(50); // Faster delay for social checks
    const userFollowing = followingRelationships.get(userId);
    return userFollowing?.has(targetUserId) || false;
  }

  /**
   * Follow a user
   * Updates both follower and following counts
   * @param userId - ID of the user doing the following
   * @param targetUserId - ID of the user to follow
   */
  static async followUser(userId: string, targetUserId: string): Promise<void> {
    await delay(100);

    // Get or create the following set for this user
    let userFollowing = followingRelationships.get(userId);
    if (!userFollowing) {
      userFollowing = new Set();
      followingRelationships.set(userId, userFollowing);
    }

    // Add the target user to following set
    userFollowing.add(targetUserId);

    // Update follower/following counts
    const user = mockUsers.find(u => u.id === userId);
    const targetUser = mockUsers.find(u => u.id === targetUserId);

    if (user && user.stats) {
      user.stats.following = (user.stats.following || 0) + 1;
    }
    if (targetUser && targetUser.stats) {
      targetUser.stats.followers = (targetUser.stats.followers || 0) + 1;
    }
  }

  /**
   * Unfollow a user
   * Updates both follower and following counts
   * @param userId - ID of the user doing the unfollowing
   * @param targetUserId - ID of the user to unfollow
   */
  static async unfollowUser(userId: string, targetUserId: string): Promise<void> {
    await delay(100);

    const userFollowing = followingRelationships.get(userId);
    if (userFollowing) {
      userFollowing.delete(targetUserId);

      // Update follower/following counts
      const user = mockUsers.find(u => u.id === userId);
      const targetUser = mockUsers.find(u => u.id === targetUserId);

      if (user && user.stats) {
        user.stats.following = Math.max(0, (user.stats.following || 0) - 1);
      }
      if (targetUser && targetUser.stats) {
        targetUser.stats.followers = Math.max(0, (targetUser.stats.followers || 0) - 1);
      }
    }
  }

  /**
   * Get all users who follow a specific user
   * @param userId - ID of the user
   * @returns Array of follower users
   */
  static async getFollowers(userId: string): Promise<User[]> {
    await delay();
    const followers: User[] = [];

    // Find all users who follow this user
    for (const [followerId, following] of followingRelationships.entries()) {
      if (following.has(userId)) {
        const follower = mockUsers.find(u => u.id === followerId);
        if (follower) {
          followers.push(follower);
        }
      }
    }

    return followers;
  }

  /**
   * Get all users that a specific user follows
   * @param userId - ID of the user
   * @returns Array of users being followed
   */
  static async getFollowing(userId: string): Promise<User[]> {
    await delay();
    const following = followingRelationships.get(userId);
    if (!following) return [];

    return mockUsers.filter(u => following.has(u.id));
  }

  /**
   * Get user's friends (simplified version of following)
   * Used for group dinner features
   * @param userId - ID of the user
   * @returns Array of friend users
   */
  static async getUserFriends(userId: string): Promise<User[]> {
    await delay();
    // Return users who the current user is following (simplified)
    // In a real app, this would be a proper friends/following relationship
    return mockUsers.filter(u => u.id !== userId).slice(0, 10);
  }

  /**
   * Get users that a user has recently dined with
   * Used for group dinner participant suggestions
   * @param userId - ID of the user
   * @returns Array of recent dining companions
   */
  static async getRecentDiningCompanions(userId: string): Promise<User[]> {
    await delay();
    // For now, return a subset of friends
    // In a real app, this would track who you've actually dined with
    return mockUsers.filter(u => u.id !== userId).slice(0, 5);
  }
}
