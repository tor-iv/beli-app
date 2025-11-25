/**
 * ListService
 *
 * Manages user lists including:
 * - System lists (Been, Want to Try, Recommendations)
 * - Custom playlists
 * - Featured/curated lists
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import { mockLists, featuredLists } from '../../../data/mock/lists';
import { delay, DEMO_USER_ID } from '../base/BaseService';
import type { List, ListScope, ListCategory } from '../../../types';

// Lazy import supabase
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
};

export class ListService {
  /**
   * Get all lists for a user
   */
  static async getUserLists(userId?: string): Promise<List[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', targetUserId)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as unknown as List[];
      },
      async () => {
        await delay();
        const targetUserId = userId || DEMO_USER_ID;
        return mockLists.filter((list) => list.userId === targetUserId);
      },
      { operationName: 'getUserLists' }
    );

    return data;
  }

  /**
   * Get lists by type for a user
   */
  static async getUserListsByType(
    userId: string,
    listType: ListScope,
    category: ListCategory = 'restaurants'
  ): Promise<List[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', userId)
          .eq('list_type', listType)
          .eq('category', category)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as unknown as List[];
      },
      async () => {
        await delay();
        return mockLists.filter(
          (list) =>
            list.userId === userId && list.listType === listType && list.category === category
        );
      },
      { operationName: 'getUserListsByType' }
    );

    return data;
  }

  /**
   * Get a specific list by ID
   */
  static async getListById(listId: string): Promise<List | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('id', listId)
          .single();

        if (error) throw error;
        return data as unknown as List;
      },
      async () => {
        await delay();
        return mockLists.find((list) => list.id === listId) || null;
      },
      { operationName: 'getListById' }
    );

    return data;
  }

  /**
   * Get featured/curated lists
   */
  static async getFeaturedLists(): Promise<List[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', 'admin')
          .eq('is_public', true)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as unknown as List[];
      },
      async () => {
        await delay();
        return featuredLists;
      },
      { operationName: 'getFeaturedLists' }
    );

    return data;
  }

  /**
   * Get public lists (for discovery)
   */
  static async getPublicLists(limit: number = 20): Promise<List[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('is_public', true)
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data as unknown as List[];
      },
      async () => {
        await delay();
        return mockLists.filter((list) => list.isPublic).slice(0, limit);
      },
      { operationName: 'getPublicLists' }
    );

    return data;
  }

  /**
   * Create a new list
   */
  static async createList(
    userId: string,
    name: string,
    description: string,
    listType: ListScope,
    category: ListCategory,
    isPublic: boolean = false
  ): Promise<List> {
    const newList: List = {
      id: Math.random().toString(36).substring(2),
      userId,
      name,
      description,
      restaurants: [],
      isPublic,
      category,
      listType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase.from('lists').insert({
          id: newList.id,
          user_id: userId,
          name,
          description,
          restaurants: [],
          is_public: isPublic,
          category,
          list_type: listType,
        });

        if (error) throw error;
      },
      async () => {
        await delay();
        mockLists.push(newList);
      },
      { operationName: 'createList' }
    );

    return newList;
  }

  /**
   * Add restaurant to list
   */
  static async addRestaurantToList(listId: string, restaurantId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        // First get the current list
        const { data: list, error: fetchError } = await supabase
          .from('lists')
          .select('restaurants')
          .eq('id', listId)
          .single();

        if (fetchError) throw fetchError;

        const currentRestaurants = (list?.restaurants as string[]) || [];
        if (!currentRestaurants.includes(restaurantId)) {
          const { error } = await supabase
            .from('lists')
            .update({
              restaurants: [...currentRestaurants, restaurantId],
              updated_at: new Date().toISOString(),
            })
            .eq('id', listId);

          if (error) throw error;
        }
      },
      async () => {
        await delay();
        const list = mockLists.find((l) => l.id === listId);
        if (list && !list.restaurants.includes(restaurantId)) {
          list.restaurants.push(restaurantId);
          list.updatedAt = new Date();
        }
      },
      { operationName: 'addRestaurantToList' }
    );
  }

  /**
   * Remove restaurant from list
   */
  static async removeRestaurantFromList(listId: string, restaurantId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data: list, error: fetchError } = await supabase
          .from('lists')
          .select('restaurants')
          .eq('id', listId)
          .single();

        if (fetchError) throw fetchError;

        const currentRestaurants = (list?.restaurants as string[]) || [];
        const { error } = await supabase
          .from('lists')
          .update({
            restaurants: currentRestaurants.filter((id) => id !== restaurantId),
            updated_at: new Date().toISOString(),
          })
          .eq('id', listId);

        if (error) throw error;
      },
      async () => {
        await delay();
        const list = mockLists.find((l) => l.id === listId);
        if (list) {
          list.restaurants = list.restaurants.filter((id) => id !== restaurantId);
          list.updatedAt = new Date();
        }
      },
      { operationName: 'removeRestaurantFromList' }
    );
  }

  /**
   * Delete a list
   */
  static async deleteList(listId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase.from('lists').delete().eq('id', listId);

        if (error) throw error;
      },
      async () => {
        await delay();
        const index = mockLists.findIndex((l) => l.id === listId);
        if (index !== -1) {
          mockLists.splice(index, 1);
        }
      },
      { operationName: 'deleteList' }
    );
  }

  /**
   * Update list details
   */
  static async updateList(
    listId: string,
    updates: Partial<Pick<List, 'name' | 'description' | 'isPublic' | 'thumbnailImage'>>
  ): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase
          .from('lists')
          .update({
            ...updates,
            is_public: updates.isPublic,
            thumbnail_image: updates.thumbnailImage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', listId);

        if (error) throw error;
      },
      async () => {
        await delay();
        const list = mockLists.find((l) => l.id === listId);
        if (list) {
          Object.assign(list, updates);
          list.updatedAt = new Date();
        }
      },
      { operationName: 'updateList' }
    );
  }

  /**
   * Get user's progress through a featured list
   * Returns how many restaurants in the list the user has visited
   */
  static async getUserListProgress(
    userId: string,
    listId: string
  ): Promise<{ visited: number; total: number }> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get the list
        const { data: list, error: listError } = await supabase
          .from('lists')
          .select('restaurants')
          .eq('id', listId)
          .single();

        if (listError) throw listError;

        // Get user's been list
        const { data: relations, error: relError } = await supabase
          .from('user_restaurant_relations')
          .select('restaurant_id')
          .eq('user_id', userId)
          .eq('status', 'been');

        if (relError) throw relError;

        const restaurantIds = (list?.restaurants as string[]) || [];
        const visitedIds = (relations || []).map((r: { restaurant_id: string }) => r.restaurant_id);
        const visited = restaurantIds.filter((id) => visitedIds.includes(id)).length;

        return { visited, total: restaurantIds.length };
      },
      async () => {
        await delay();
        const list = featuredLists.find((l) => l.id === listId);
        if (!list) {
          return { visited: 0, total: 0 };
        }

        // In mock mode, simulate some visited restaurants
        const visited = Math.min(
          Math.floor(Math.random() * list.restaurants.length),
          list.restaurants.length
        );

        return { visited, total: list.restaurants.length };
      },
      { operationName: 'getUserListProgress' }
    );

    return data;
  }

  /**
   * Get list counts for a user (number of restaurants in each list type)
   */
  static async getListCounts(userId: string): Promise<Record<ListScope, number>> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('lists')
          .select('list_type, restaurants')
          .eq('user_id', userId);

        if (error) throw error;

        const counts: Record<ListScope, number> = {
          been: 0,
          want_to_try: 0,
          recs: 0,
          playlists: 0,
        };

        (data || []).forEach((list: { list_type: ListScope; restaurants: string[] }) => {
          counts[list.list_type] += (list.restaurants || []).length;
        });

        return counts;
      },
      async () => {
        await delay();
        const userLists = mockLists.filter((l) => l.userId === userId);

        const counts: Record<ListScope, number> = {
          been: 0,
          want_to_try: 0,
          recs: 0,
          playlists: 0,
        };

        userLists.forEach((list) => {
          counts[list.listType] += list.restaurants.length;
        });

        return counts;
      },
      { operationName: 'getListCounts' }
    );

    return data;
  }
}
