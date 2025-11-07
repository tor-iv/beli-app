/**
 * ListService
 *
 * Manages user-created lists and featured lists including:
 * - Fetching lists by user or ID
 * - Creating, updating, and deleting lists
 * - Tracking list progress
 */

import { mockLists, getUserListsByType, featuredLists } from '@/data/mock/lists';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';

import { delay } from '../base/BaseService';

import type { List, ListScope, ListCategory } from '@/types';


export class ListService {
  /**
   * Get all lists created by a user
   * @param userId - ID of the user
   * @returns Lists owned by the user
   */
  static async getUserLists(userId: string): Promise<List[]> {
    await delay();
    return mockLists.filter((list) => list.userId === userId);
  }

  /**
   * Get user lists filtered by type and category
   * @param userId - ID of the user
   * @param type - List scope (personal, public, shared)
   * @param category - List category
   * @returns Filtered lists
   */
  static async getUserListsByType(
    userId: string,
    type: ListScope,
    category: ListCategory
  ): Promise<List[]> {
    await delay();
    return getUserListsByType(userId, type, category);
  }

  /**
   * Get curated featured lists
   * @returns Featured lists
   */
  static async getFeaturedLists(): Promise<List[]> {
    await delay();
    return featuredLists;
  }

  /**
   * Get a specific list by ID
   * @param listId - ID of the list
   * @returns The list or null if not found
   */
  static async getListById(listId: string): Promise<List | null> {
    await delay();
    return mockLists.find((list) => list.id === listId) || null;
  }

  /**
   * Create a new list
   * @param list - List data (without id, createdAt, updatedAt)
   * @returns The created list with generated fields
   */
  static async createList(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List> {
    await delay();

    const newList: List = {
      ...list,
      id: `list-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real app, this would save to the backend
    mockLists.push(newList);
    return newList;
  }

  /**
   * Update an existing list
   * @param listId - ID of the list to update
   * @param updates - Partial list data to update
   * @returns The updated list or null if not found
   */
  static async updateList(listId: string, updates: Partial<List>): Promise<List | null> {
    await delay();

    const listIndex = mockLists.findIndex((list) => list.id === listId);
    if (listIndex === -1) {
      return null;
    }

    mockLists[listIndex] = {
      ...mockLists[listIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return mockLists[listIndex];
  }

  /**
   * Delete a list
   * @param listId - ID of the list to delete
   */
  static async deleteList(listId: string): Promise<void> {
    await delay();

    const index = mockLists.findIndex((list) => list.id === listId);
    if (index > -1) {
      mockLists.splice(index, 1);
    }
  }

  /**
   * Get user's progress through a list
   * Calculates how many restaurants in the list the user has visited
   * @param userId - ID of the user
   * @param listId - ID of the list
   * @returns Progress with visited and total counts
   */
  static async getUserListProgress(
    userId: string,
    listId: string
  ): Promise<{ visited: number; total: number }> {
    await delay();

    const list = mockLists.find((l) => l.id === listId);
    if (!list) {
      return { visited: 0, total: 0 };
    }

    // Get user's been list to check which restaurants they've visited (direct access to avoid nested delay)
    const userRelations = mockUserRestaurantRelations.filter(
      (relation) => relation.userId === userId
    );
    const visitedRestaurantIds = userRelations
      .filter((rel) => rel.status === 'been')
      .map((rel) => rel.restaurantId);

    // Count how many restaurants in the list the user has been to
    const visited = list.restaurants.filter((restaurantId) =>
      visitedRestaurantIds.includes(restaurantId)
    ).length;

    return {
      visited,
      total: list.restaurants.length,
    };
  }
}
