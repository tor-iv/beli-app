/**
 * UserRestaurantService
 *
 * Manages user-restaurant relationships including:
 * - Getting user's restaurant relations
 * - Adding/removing restaurants from user lists
 * - Filtering restaurants by status (been/want-to-try/recommended)
 */

import { mockRestaurants } from '@/data/mock/restaurants';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';

import { delay } from '../base/BaseService';

import type { Restaurant, UserRestaurantRelation } from '@/types';


export class UserRestaurantService {
  /**
   * Get all restaurant relations for a user
   * @param userId - ID of the user
   * @returns Array of user-restaurant relations
   */
  static async getUserRestaurantRelations(userId: string): Promise<UserRestaurantRelation[]> {
    await delay();
    return mockUserRestaurantRelations.filter((relation) => relation.userId === userId);
  }

  /**
   * Get restaurants filtered by user's status
   * @param userId - ID of the user
   * @param status - Filter by been/want_to_try/recommended
   * @returns Restaurants matching the status
   */
  static async getUserRestaurantsByStatus(
    userId: string,
    status: 'been' | 'want_to_try' | 'recommended'
  ): Promise<Restaurant[]> {
    await delay();
    const relations = mockUserRestaurantRelations.filter(
      (relation) => relation.userId === userId && relation.status === status
    );
    const restaurantIds = relations.map((relation) => relation.restaurantId);
    return mockRestaurants.filter((restaurant) => restaurantIds.includes(restaurant.id));
  }

  /**
   * Add a restaurant to a user's list
   * Creates a new user-restaurant relation with optional metadata
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant
   * @param status - List status (been/want_to_try/recommended)
   * @param data - Optional metadata (rating, notes, photos, tags)
   * @returns The created user-restaurant relation
   */
  static async addRestaurantToUserList(
    userId: string,
    restaurantId: string,
    status: 'been' | 'want_to_try' | 'recommended',
    data?: {
      rating?: number;
      notes?: string;
      photos?: string[];
      tags?: string[];
    }
  ): Promise<UserRestaurantRelation> {
    await delay();

    const newRelation: UserRestaurantRelation = {
      userId,
      restaurantId,
      status,
      rating: data?.rating,
      notes: data?.notes,
      photos: data?.photos,
      tags: data?.tags,
      createdAt: new Date(),
      visitDate: status === 'been' ? new Date() : undefined,
    };

    // In a real app, this would save to the backend
    mockUserRestaurantRelations.push(newRelation);
    return newRelation;
  }

  /**
   * Remove a restaurant from a user's list
   * Deletes the user-restaurant relation
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant to remove
   */
  static async removeRestaurantFromUserList(userId: string, restaurantId: string): Promise<void> {
    await delay();

    // In a real app, this would remove from the backend
    const index = mockUserRestaurantRelations.findIndex(
      (relation) => relation.userId === userId && relation.restaurantId === restaurantId
    );
    if (index > -1) {
      mockUserRestaurantRelations.splice(index, 1);
    }
  }
}
