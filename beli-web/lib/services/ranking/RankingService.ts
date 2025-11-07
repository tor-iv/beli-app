/**
 * RankingService
 *
 * Manages restaurant ranking functionality including:
 * - Binary search ranking insertion
 * - Ranked restaurant retrieval
 * - Rank index maintenance
 */

import { delay } from '../base/BaseService';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockRestaurants } from '@/data/mock/restaurants';
import { Restaurant, UserRestaurantRelation, ListCategory, RankedRestaurant } from '@/types';

export class RankingService {
  /**
   * Get ranked restaurants for a user
   * Returns restaurants sorted by their rank index (lower index = higher rank)
   *
   * @param userId - ID of the user
   * @param category - List category (currently all go to 'restaurants')
   * @returns Ranked restaurants with user ratings attached
   */
  static async getRankedRestaurants(userId: string, category: ListCategory): Promise<RankedRestaurant[]> {
    await delay();

    // Get all restaurants in the 'been' list for this user
    const relations = mockUserRestaurantRelations.filter(
      relation => relation.userId === userId && relation.status === 'been'
    );

    // Filter by category (for now, all restaurants go into 'restaurants' category)
    // In a real app, you might filter by restaurant type based on category

    // Get full restaurant objects with their rank indices and user ratings
    const restaurantsWithRanks = relations
      .map(relation => {
        const restaurant = mockRestaurants.find(r => r.id === relation.restaurantId);
        return restaurant ? {
          restaurant,
          rankIndex: relation.rankIndex ?? 999999,
          userRating: relation.rating
        } : null;
      })
      .filter((item): item is { restaurant: Restaurant; rankIndex: number; userRating: number | undefined } => item !== null);

    // Sort by rank index (lower index = higher rank)
    restaurantsWithRanks.sort((a, b) => a.rankIndex - b.rankIndex);

    // Attach userRating to restaurant objects
    return restaurantsWithRanks.map(item => ({
      ...item.restaurant,
      userRating: item.userRating
    }));
  }

  /**
   * Insert a restaurant at a specific rank position
   * Uses binary search ranking algorithm to place restaurant in ranked list
   * Updates rank indices for affected restaurants
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant to insert
   * @param category - List category
   * @param position - Rank position to insert at (0 = top)
   * @param rating - User's rating for the restaurant
   * @param data - Optional metadata (notes, photos, tags, companions)
   * @returns The created user-restaurant relation with ranking
   */
  static async insertRankedRestaurant(
    userId: string,
    restaurantId: string,
    category: ListCategory,
    position: number,
    rating: number,
    data?: {
      notes?: string;
      photos?: string[];
      tags?: string[];
      companions?: string[];
    }
  ): Promise<UserRestaurantRelation> {
    await delay();

    // Update rank indices for existing restaurants at or after this position
    await this.updateRankIndices(userId, category, position);

    // Create the new relation with rank index
    const newRelation: UserRestaurantRelation = {
      userId,
      restaurantId,
      status: 'been',
      rating,
      rankIndex: position,
      notes: data?.notes,
      photos: data?.photos,
      tags: data?.tags,
      companions: data?.companions,
      createdAt: new Date(),
      visitDate: new Date(),
    };

    // Add to the list
    mockUserRestaurantRelations.push(newRelation);

    return newRelation;
  }

  /**
   * Update rank indices for existing restaurants
   * Increments rank indices for all restaurants at or after the given position
   * Used when inserting a new restaurant into a ranked list
   *
   * @param userId - ID of the user
   * @param category - List category
   * @param fromIndex - Position from which to start incrementing indices
   */
  static async updateRankIndices(
    userId: string,
    category: ListCategory,
    fromIndex: number
  ): Promise<void> {
    await delay();

    // Find all relations for this user in the 'been' status
    const relations = mockUserRestaurantRelations.filter(
      relation => relation.userId === userId && relation.status === 'been'
    );

    // Increment rank index for all items at or after the insertion point
    relations.forEach(relation => {
      if (relation.rankIndex !== undefined && relation.rankIndex >= fromIndex) {
        relation.rankIndex += 1;
      }
    });
  }
}
