/**
 * ListService
 *
 * Manages user-created lists and featured lists including:
 * - Fetching lists by user or ID
 * - Creating, updating, and deleting lists
 * - Tracking list progress
 *
 * Now connected to Supabase PostgreSQL database.
 * Supports automatic fallback to mock data via withFallback().
 */

import { withFallback } from '@/lib/data-provider';
import { mockLists, getUserListsByType, featuredLists } from '@/data/mock/lists';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mapDbToList, DbList } from '../mappers';

import type { List, ListScope, ListCategory } from '@/types';
import type { Database } from '@/lib/supabase/types';

// Type alias for lists table operations
type ListRow = Database['public']['Tables']['lists']['Row'];
type ListInsert = Database['public']['Tables']['lists']['Insert'];
type ListUpdate = Database['public']['Tables']['lists']['Update'];

// Lazy import supabase to avoid throwing when env vars missing in mock mode
const getSupabase = async () => {
  const { supabase } = await import('@/lib/supabase/client');
  return supabase;
};

export class ListService {
  /**
   * Get all lists created by a user
   * @param userId - ID of the user
   * @returns Lists owned by the user
   */
  static async getUserLists(userId: string): Promise<List[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Use type assertion for lists table
        const { data, error } = await (supabase.from('lists') as any)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return ((data || []) as ListRow[]).map(mapDbToList);
      },
      () => mockLists.filter((list) => list.userId === userId),
      { operationName: 'getUserLists' }
    );

    return data;
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
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Use type assertion for lists table
        const { data, error } = await (supabase.from('lists') as any)
          .select('*')
          .eq('user_id', userId)
          .eq('list_type', type)
          .eq('category', category)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return ((data || []) as ListRow[]).map(mapDbToList);
      },
      () => getUserListsByType(userId, type, category),
      { operationName: 'getUserListsByType' }
    );

    return data;
  }

  /**
   * Get curated featured lists
   * @returns Featured lists
   */
  static async getFeaturedLists(): Promise<List[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Use type assertion for lists table
        const { data, error } = await (supabase.from('lists') as any)
          .select('*')
          .eq('is_public', true)
          .not('thumbnail_image', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return ((data || []) as ListRow[]).map(mapDbToList);
      },
      () => featuredLists,
      { operationName: 'getFeaturedLists' }
    );

    return data;
  }

  /**
   * Get a specific list by ID
   * @param listId - ID of the list
   * @returns The list or null if not found
   */
  static async getListById(listId: string): Promise<List | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Use type assertion for lists table
        const { data, error } = await (supabase.from('lists') as any)
          .select('*')
          .eq('id', listId)
          .single();

        if (error || !data) throw error || new Error('List not found');
        return mapDbToList(data as ListRow);
      },
      () => mockLists.find((list) => list.id === listId) || null,
      { operationName: 'getListById' }
    );

    return data;
  }

  /**
   * Create a new list
   * @param list - List data (without id, createdAt, updatedAt)
   * @returns The created list with generated fields
   */
  static async createList(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const insertData: ListInsert = {
          user_id: list.userId,
          name: list.name,
          description: list.description,
          category: list.category,
          list_type: list.listType,
          restaurant_ids: list.restaurants,
          is_public: list.isPublic,
          thumbnail_image: list.thumbnailImage || null,
        };
        // Use type assertion to work around Supabase generic inference issues
        const { data, error } = await (supabase.from('lists') as any)
          .insert(insertData)
          .select()
          .single();

        if (error || !data) throw error || new Error('Failed to create list');
        return mapDbToList(data as ListRow);
      },
      () => {
        const newList: List = {
          ...list,
          id: `list-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // In mock mode, push to mock array for consistency
        mockLists.push(newList);
        return newList;
      },
      { operationName: 'createList' }
    );

    return data;
  }

  /**
   * Update an existing list
   * @param listId - ID of the list to update
   * @param updates - Partial list data to update
   * @returns The updated list or null if not found
   */
  static async updateList(listId: string, updates: Partial<List>): Promise<List | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Build update object with snake_case keys
        const dbUpdates: ListUpdate = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.listType !== undefined) dbUpdates.list_type = updates.listType;
        if (updates.restaurants !== undefined) dbUpdates.restaurant_ids = updates.restaurants;
        if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
        if (updates.thumbnailImage !== undefined)
          dbUpdates.thumbnail_image = updates.thumbnailImage || null;

        // Use type assertion to work around Supabase generic inference issues
        const { data, error } = await (supabase.from('lists') as any)
          .update(dbUpdates)
          .eq('id', listId)
          .select()
          .single();

        if (error || !data) throw error || new Error('List not found');
        return mapDbToList(data as ListRow);
      },
      () => {
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
      },
      { operationName: 'updateList' }
    );

    return data;
  }

  /**
   * Delete a list
   * @param listId - ID of the list to delete
   */
  static async deleteList(listId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Use type assertion for lists table
        const { error } = await (supabase.from('lists') as any).delete().eq('id', listId);

        if (error) throw error;
        return undefined;
      },
      () => {
        const index = mockLists.findIndex((list) => list.id === listId);
        if (index > -1) {
          mockLists.splice(index, 1);
        }
        return undefined;
      },
      { operationName: 'deleteList' }
    );
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
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get the list first (use type assertion for lists table)
        const { data: listData, error: listError } = await (supabase.from('lists') as any)
          .select('restaurant_ids')
          .eq('id', listId)
          .single();

        if (listError || !listData) {
          return { visited: 0, total: 0 };
        }

        const restaurantIds = (listData as { restaurant_ids: string[] }).restaurant_ids || [];
        if (restaurantIds.length === 0) {
          return { visited: 0, total: 0 };
        }

        // Get user's been restaurants
        const { data: ratings, error: ratingsError } = await supabase
          .from('ratings')
          .select('restaurant_id')
          .eq('user_id', userId)
          .eq('status', 'been')
          .in('restaurant_id', restaurantIds);

        if (ratingsError) throw ratingsError;

        return {
          visited: ratings?.length || 0,
          total: restaurantIds.length,
        };
      },
      () => {
        const list = mockLists.find((l) => l.id === listId);
        if (!list) {
          return { visited: 0, total: 0 };
        }

        // Get user's been list to check which restaurants they've visited
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
      },
      { operationName: 'getUserListProgress' }
    );

    return data;
  }
}
