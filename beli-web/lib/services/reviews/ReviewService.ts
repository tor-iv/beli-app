/**
 * ReviewService
 *
 * Manages restaurant reviews including:
 * - Fetching reviews by restaurant or user
 * - Adding new reviews
 */

import { mockReviews } from '@/data/mock/reviews';

import { delay } from '../base/BaseService';

import type { Review } from '@/data/mock/reviews';

export class ReviewService {
  /**
   * Get all reviews for a specific restaurant
   * @param restaurantId - ID of the restaurant
   * @returns Reviews for the restaurant
   */
  static async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    await delay();
    return mockReviews.filter((review) => review.restaurantId === restaurantId);
  }

  /**
   * Get all reviews written by a specific user
   * @param userId - ID of the user
   * @returns Reviews written by the user
   */
  static async getUserReviews(userId: string): Promise<Review[]> {
    await delay();
    return mockReviews.filter((review) => review.userId === userId);
  }

  /**
   * Add a new review
   * @param review - Review data (without id, createdAt, helpfulCount)
   * @returns The created review with generated fields
   */
  static async addReview(
    review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>
  ): Promise<Review> {
    await delay();

    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date(),
      helpfulCount: 0,
    };

    // In a real app, this would save to the backend
    mockReviews.push(newReview);
    return newReview;
  }
}
