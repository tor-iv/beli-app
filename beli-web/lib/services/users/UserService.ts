/**
 * UserService
 *
 * Core user management including:
 * - User CRUD operations
 * - User search
 * - User statistics
 * - User match percentages (taste compatibility)
 */

import { mockRestaurants } from '@/data/mock/restaurants';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockUsers, currentUser } from '@/data/mock/users';

import { delay, matchPercentageCache } from '../base/BaseService';

import type { User } from '@/types';


const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class UserService {
  /**
   * Get the current logged-in user
   * @returns Current user
   */
  static async getCurrentUser(): Promise<User> {
    await delay();
    return currentUser;
  }

  /**
   * Get a user by ID
   * @param userId - ID of the user
   * @returns User or null if not found
   */
  static async getUserById(userId: string): Promise<User | null> {
    await delay();
    return mockUsers.find((user) => user.id === userId) || null;
  }

  /**
   * Get a user by username
   * @param username - Username to search for
   * @returns User or null if not found
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    await delay();
    return mockUsers.find((user) => user.username === username) || null;
  }

  /**
   * Search for users by username or display name
   * @param query - Search query
   * @returns Matching users
   */
  static async searchUsers(query: string): Promise<User[]> {
    await delay();
    const lowercaseQuery = query.toLowerCase();
    return mockUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.displayName.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get user statistics
   * @param userId - ID of the user
   * @returns User stats or null if user not found
   */
  static async getUserStats(userId: string): Promise<User['stats'] | null> {
    await delay();
    const user = mockUsers.find((u) => u.id === userId);
    return user?.stats || null;
  }

  /**
   * Calculate match percentage between two users based on their restaurant preferences
   * Uses Jaccard similarity for restaurant overlap and cuisine preferences
   * Results are cached for 5 minutes
   *
   * @param userId - ID of the first user
   * @param targetUserId - ID of the second user
   * @returns Match percentage (30-99)
   */
  static async getUserMatchPercentage(userId: string, targetUserId: string): Promise<number> {
    // Check cache first
    const cacheKey = `${userId}-${targetUserId}`;
    const cached = matchPercentageCache.get(cacheKey);
    if (cached !== null) {
      return cached; // Return cached value without delay
    }

    await delay();

    // Get both users' restaurant relations
    const userRelations = mockUserRestaurantRelations.filter(
      (rel) => rel.userId === userId && (rel.status === 'been' || rel.status === 'want_to_try')
    );
    const targetRelations = mockUserRestaurantRelations.filter(
      (rel) =>
        rel.userId === targetUserId && (rel.status === 'been' || rel.status === 'want_to_try')
    );

    if (userRelations.length === 0 || targetRelations.length === 0) {
      // Return a baseline match percentage (30-50%) if either user has no data
      return Math.floor(Math.random() * 21) + 30; // Random between 30-50
    }

    // Calculate overlap in restaurants
    const userRestaurantIds = new Set(userRelations.map((rel) => rel.restaurantId));
    const targetRestaurantIds = new Set(targetRelations.map((rel) => rel.restaurantId));

    const intersection = [...userRestaurantIds].filter((id) => targetRestaurantIds.has(id));
    const union = new Set([...userRestaurantIds, ...targetRestaurantIds]);

    // Jaccard similarity coefficient
    const jaccardSimilarity = intersection.length / union.size;

    // Also consider cuisine preferences
    const userCuisines = new Set<string>();
    const targetCuisines = new Set<string>();

    userRelations.forEach((rel) => {
      const restaurant = mockRestaurants.find((r) => r.id === rel.restaurantId);
      restaurant?.cuisine.forEach((c) => userCuisines.add(c));
    });

    targetRelations.forEach((rel) => {
      const restaurant = mockRestaurants.find((r) => r.id === rel.restaurantId);
      restaurant?.cuisine.forEach((c) => targetCuisines.add(c));
    });

    const cuisineIntersection = [...userCuisines].filter((c) => targetCuisines.has(c));
    const cuisineUnion = new Set([...userCuisines, ...targetCuisines]);
    const cuisineSimilarity = cuisineIntersection.length / cuisineUnion.size;

    // Combined score: 70% restaurant overlap + 30% cuisine similarity
    const matchScore = (jaccardSimilarity * 0.7 + cuisineSimilarity * 0.3) * 100;

    // Add some variance and ensure it's between 30-99
    const variance = Math.floor(Math.random() * 11) - 5; // -5 to +5
    const finalScore = Math.max(30, Math.min(99, Math.floor(matchScore + variance)));

    // Cache the result
    matchPercentageCache.set(cacheKey, finalScore);

    return finalScore;
  }

  /**
   * Batch version of getUserMatchPercentage to avoid N+1 queries
   * More efficient when calculating match percentages for multiple users
   *
   * @param userId - ID of the base user
   * @param targetUserIds - Array of target user IDs
   * @returns Object mapping user IDs to match percentages
   */
  static async getBatchMatchPercentages(
    userId: string,
    targetUserIds: string[]
  ): Promise<Record<string, number>> {
    await delay();

    const results: Record<string, number> = {};

    // Get user's relations once
    const userRelations = mockUserRestaurantRelations.filter(
      (rel) => rel.userId === userId && (rel.status === 'been' || rel.status === 'want_to_try')
    );
    const userRestaurantIds = new Set(userRelations.map((rel) => rel.restaurantId));

    // Get user's cuisines once
    const userCuisines = new Set<string>();
    userRelations.forEach((rel) => {
      const restaurant = mockRestaurants.find((r) => r.id === rel.restaurantId);
      restaurant?.cuisine.forEach((c) => userCuisines.add(c));
    });

    // Calculate match percentage for each target user
    targetUserIds.forEach((targetUserId) => {
      const targetRelations = mockUserRestaurantRelations.filter(
        (rel) =>
          rel.userId === targetUserId && (rel.status === 'been' || rel.status === 'want_to_try')
      );

      if (userRelations.length === 0 || targetRelations.length === 0) {
        results[targetUserId] = Math.floor(Math.random() * 21) + 30;
        return;
      }

      const targetRestaurantIds = new Set(targetRelations.map((rel) => rel.restaurantId));
      const intersection = [...userRestaurantIds].filter((id) => targetRestaurantIds.has(id));
      const union = new Set([...userRestaurantIds, ...targetRestaurantIds]);
      const jaccardSimilarity = intersection.length / union.size;

      // Get target user's cuisines
      const targetCuisines = new Set<string>();
      targetRelations.forEach((rel) => {
        const restaurant = mockRestaurants.find((r) => r.id === rel.restaurantId);
        restaurant?.cuisine.forEach((c) => targetCuisines.add(c));
      });

      const cuisineIntersection = [...userCuisines].filter((c) => targetCuisines.has(c));
      const cuisineUnion = new Set([...userCuisines, ...targetCuisines]);
      const cuisineSimilarity =
        cuisineUnion.size > 0 ? cuisineIntersection.length / cuisineUnion.size : 0;

      // Combined score
      const matchScore = (jaccardSimilarity * 0.7 + cuisineSimilarity * 0.3) * 100;
      const variance = Math.floor(Math.random() * 11) - 5;
      results[targetUserId] = Math.max(30, Math.min(99, Math.floor(matchScore + variance)));
    });

    return results;
  }
}
