/**
 * TastemakerPostService
 *
 * Manages tastemaker posts and articles including:
 * - Fetching posts with filters
 * - Post interactions (likes, bookmarks, views)
 * - Featured and user-specific posts
 */

import { mockRestaurants } from '@/data/mock/restaurants';
import {
  mockTastemakerPosts,
  getFeaturedPosts,
  getPostsByUserId,
} from '@/data/mock/tastemakerPosts';
import { mockTastemakers } from '@/data/mock/tastemakers';

import { delay } from '../base/BaseService';

import type { TastemakerPost } from '@/types';


export class TastemakerPostService {
  /**
   * Get all tastemaker posts with user data populated
   * @param limit - Optional limit for number of posts to return
   * @returns Posts sorted by publish date (newest first)
   */
  static async getTastemakerPosts(limit?: number): Promise<TastemakerPost[]> {
    await delay();
    // Populate user data for each post
    const postsWithUsers = mockTastemakerPosts.map((post) => ({
      ...post,
      user: mockTastemakers.find((tm) => tm.id === post.userId),
    }));

    const sorted = postsWithUsers.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get featured tastemaker posts
   * Returns posts sorted by view count
   *
   * @param limit - Optional limit for number of posts to return
   * @returns Featured posts sorted by views (descending)
   */
  static async getFeaturedTastemakerPosts(limit?: number): Promise<TastemakerPost[]> {
    await delay();
    const featured = getFeaturedPosts().map((post) => ({
      ...post,
      user: mockTastemakers.find((tm) => tm.id === post.userId),
    }));

    const sorted = featured.sort((a, b) => b.interactions.views - a.interactions.views);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get a tastemaker post by ID
   * Includes populated user and restaurant data
   *
   * @param postId - ID of the post
   * @returns Post with user and restaurant data, or null if not found
   */
  static async getTastemakerPostById(postId: string): Promise<TastemakerPost | null> {
    await delay();
    const post = mockTastemakerPosts.find((p) => p.id === postId);
    if (!post) return null;

    // Populate user and restaurant data
    const user = mockTastemakers.find((tm) => tm.id === post.userId);
    const restaurants = mockRestaurants.filter((r) => post.restaurantIds.includes(r.id));

    return {
      ...post,
      user,
      restaurants,
    };
  }

  /**
   * Get all posts by a specific tastemaker
   * @param userId - ID of the tastemaker
   * @param limit - Optional limit for number of posts to return
   * @returns User's posts sorted by publish date (newest first)
   */
  static async getTastemakerPostsByUser(userId: string, limit?: number): Promise<TastemakerPost[]> {
    await delay();
    const userPosts = getPostsByUserId(userId).map((post) => ({
      ...post,
      user: mockTastemakers.find((tm) => tm.id === userId),
    }));

    const sorted = userPosts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Like a tastemaker post
   * Adds user to the post's likes array
   *
   * @param postId - ID of the post to like
   * @param userId - ID of the user liking the post
   */
  static async likeTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find((p) => p.id === postId);
    if (post && !post.interactions.likes.includes(userId)) {
      post.interactions.likes.push(userId);
    }
  }

  /**
   * Unlike a tastemaker post
   * Removes user from the post's likes array
   *
   * @param postId - ID of the post to unlike
   * @param userId - ID of the user unliking the post
   */
  static async unlikeTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find((p) => p.id === postId);
    if (post) {
      const index = post.interactions.likes.indexOf(userId);
      if (index > -1) {
        post.interactions.likes.splice(index, 1);
      }
    }
  }

  /**
   * Bookmark a tastemaker post
   * Adds user to the post's bookmarks array
   *
   * @param postId - ID of the post to bookmark
   * @param userId - ID of the user bookmarking the post
   */
  static async bookmarkTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find((p) => p.id === postId);
    if (post && !post.interactions.bookmarks.includes(userId)) {
      post.interactions.bookmarks.push(userId);
    }
  }

  /**
   * Unbookmark a tastemaker post
   * Removes user from the post's bookmarks array
   *
   * @param postId - ID of the post to unbookmark
   * @param userId - ID of the user unbookmarking the post
   */
  static async unbookmarkTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find((p) => p.id === postId);
    if (post) {
      const index = post.interactions.bookmarks.indexOf(userId);
      if (index > -1) {
        post.interactions.bookmarks.splice(index, 1);
      }
    }
  }

  /**
   * Increment view count for a post
   * Used to track post engagement
   *
   * @param postId - ID of the post to increment views
   */
  static async incrementPostViews(postId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find((p) => p.id === postId);
    if (post) {
      post.interactions.views += 1;
    }
  }
}
