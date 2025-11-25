/**
 * UserRestaurantService
 *
 * Manages user-restaurant relationships including:
 * - Been/Want to try/Recommendations status
 * - Ratings and reviews
 * - Visit tracking
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import { mockUserRestaurantRelations } from '../../../data/mock/userRestaurantRelations';
import { delay, DEMO_USER_ID } from '../base/BaseService';
import type { UserRestaurantRelation } from '../../../types';

// Lazy import supabase
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
};

export class UserRestaurantService {
  /**
   * Get all relations for a user
   */
  static async getUserRelations(userId?: string): Promise<UserRestaurantRelation[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { data, error } = await supabase
          .from('user_restaurant_relations')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as unknown as UserRestaurantRelation[];
      },
      async () => {
        await delay();
        const targetUserId = userId || DEMO_USER_ID;
        return mockUserRestaurantRelations.filter((rel) => rel.userId === targetUserId);
      },
      { operationName: 'getUserRelations' }
    );

    return data;
  }

  /**
   * Get relation for a specific restaurant
   */
  static async getRelation(
    userId: string,
    restaurantId: string
  ): Promise<UserRestaurantRelation | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('user_restaurant_relations')
          .select('*')
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore not found
        return data as unknown as UserRestaurantRelation | null;
      },
      async () => {
        await delay();
        return (
          mockUserRestaurantRelations.find(
            (rel) => rel.userId === userId && rel.restaurantId === restaurantId
          ) || null
        );
      },
      { operationName: 'getRelation' }
    );

    return data;
  }

  /**
   * Get all "been" restaurants for a user
   */
  static async getBeenRestaurants(userId?: string): Promise<UserRestaurantRelation[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { data, error } = await supabase
          .from('user_restaurant_relations')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('status', 'been')
          .order('visit_date', { ascending: false });

        if (error) throw error;
        return data as unknown as UserRestaurantRelation[];
      },
      async () => {
        await delay();
        const targetUserId = userId || DEMO_USER_ID;
        return mockUserRestaurantRelations
          .filter((rel) => rel.userId === targetUserId && rel.status === 'been')
          .sort((a, b) => {
            const dateA = a.visitDate?.getTime() || 0;
            const dateB = b.visitDate?.getTime() || 0;
            return dateB - dateA;
          });
      },
      { operationName: 'getBeenRestaurants' }
    );

    return data;
  }

  /**
   * Get all "want to try" restaurants for a user
   */
  static async getWantToTryRestaurants(userId?: string): Promise<UserRestaurantRelation[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { data, error } = await supabase
          .from('user_restaurant_relations')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('status', 'want_to_try')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as unknown as UserRestaurantRelation[];
      },
      async () => {
        await delay();
        const targetUserId = userId || DEMO_USER_ID;
        return mockUserRestaurantRelations
          .filter((rel) => rel.userId === targetUserId && rel.status === 'want_to_try')
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
      { operationName: 'getWantToTryRestaurants' }
    );

    return data;
  }

  /**
   * Mark a restaurant as "been"
   */
  static async markAsBeen(
    userId: string,
    restaurantId: string,
    rating?: number,
    notes?: string,
    tags?: string[],
    visitDate?: Date
  ): Promise<UserRestaurantRelation> {
    const relation: UserRestaurantRelation = {
      userId,
      restaurantId,
      status: 'been',
      rating,
      notes,
      tags,
      visitDate: visitDate || new Date(),
      createdAt: new Date(),
    };

    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase.from('user_restaurant_relations').upsert({
          user_id: userId,
          restaurant_id: restaurantId,
          status: 'been',
          rating,
          notes,
          tags,
          visit_date: relation.visitDate?.toISOString(),
        });

        if (error) throw error;
      },
      async () => {
        await delay();
        const existingIndex = mockUserRestaurantRelations.findIndex(
          (rel) => rel.userId === userId && rel.restaurantId === restaurantId
        );

        if (existingIndex !== -1) {
          mockUserRestaurantRelations[existingIndex] = relation;
        } else {
          mockUserRestaurantRelations.push(relation);
        }
      },
      { operationName: 'markAsBeen' }
    );

    return relation;
  }

  /**
   * Mark a restaurant as "want to try"
   */
  static async markAsWantToTry(
    userId: string,
    restaurantId: string,
    notes?: string,
    tags?: string[]
  ): Promise<UserRestaurantRelation> {
    const relation: UserRestaurantRelation = {
      userId,
      restaurantId,
      status: 'want_to_try',
      notes,
      tags,
      createdAt: new Date(),
    };

    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase.from('user_restaurant_relations').upsert({
          user_id: userId,
          restaurant_id: restaurantId,
          status: 'want_to_try',
          notes,
          tags,
        });

        if (error) throw error;
      },
      async () => {
        await delay();
        const existingIndex = mockUserRestaurantRelations.findIndex(
          (rel) => rel.userId === userId && rel.restaurantId === restaurantId
        );

        if (existingIndex !== -1) {
          mockUserRestaurantRelations[existingIndex] = relation;
        } else {
          mockUserRestaurantRelations.push(relation);
        }
      },
      { operationName: 'markAsWantToTry' }
    );

    return relation;
  }

  /**
   * Update rating for a restaurant
   */
  static async updateRating(
    userId: string,
    restaurantId: string,
    rating: number
  ): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase
          .from('user_restaurant_relations')
          .update({ rating })
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;
      },
      async () => {
        await delay();
        const relation = mockUserRestaurantRelations.find(
          (rel) => rel.userId === userId && rel.restaurantId === restaurantId
        );

        if (relation) {
          relation.rating = rating;
        }
      },
      { operationName: 'updateRating' }
    );
  }

  /**
   * Remove a restaurant relation
   */
  static async removeRelation(userId: string, restaurantId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase
          .from('user_restaurant_relations')
          .delete()
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;
      },
      async () => {
        await delay();
        const index = mockUserRestaurantRelations.findIndex(
          (rel) => rel.userId === userId && rel.restaurantId === restaurantId
        );

        if (index !== -1) {
          mockUserRestaurantRelations.splice(index, 1);
        }
      },
      { operationName: 'removeRelation' }
    );
  }

  /**
   * Get restaurant status for a user
   */
  static async getRestaurantStatus(
    userId: string,
    restaurantId: string
  ): Promise<'been' | 'want_to_try' | 'recommended' | null> {
    const relation = await this.getRelation(userId, restaurantId);
    return relation?.status ?? null;
  }

  /**
   * Check if user has been to a restaurant
   */
  static async hasBeenTo(userId: string, restaurantId: string): Promise<boolean> {
    const status = await this.getRestaurantStatus(userId, restaurantId);
    return status === 'been';
  }

  /**
   * Check if user wants to try a restaurant
   */
  static async wantsToTry(userId: string, restaurantId: string): Promise<boolean> {
    const status = await this.getRestaurantStatus(userId, restaurantId);
    return status === 'want_to_try';
  }

  /**
   * Get user's average rating
   */
  static async getUserAverageRating(userId: string): Promise<number | null> {
    const relations = await this.getBeenRestaurants(userId);
    const ratingsWithValues = relations.filter((r) => r.rating !== undefined);

    if (ratingsWithValues.length === 0) return null;

    const total = ratingsWithValues.reduce((sum, r) => sum + (r.rating || 0), 0);
    return total / ratingsWithValues.length;
  }

  /**
   * Get restaurants with a specific tag
   */
  static async getRestaurantsByTag(
    userId: string,
    tag: string
  ): Promise<UserRestaurantRelation[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('user_restaurant_relations')
          .select('*')
          .eq('user_id', userId)
          .contains('tags', [tag]);

        if (error) throw error;
        return data as unknown as UserRestaurantRelation[];
      },
      async () => {
        await delay();
        return mockUserRestaurantRelations.filter(
          (rel) => rel.userId === userId && rel.tags?.includes(tag)
        );
      },
      { operationName: 'getRestaurantsByTag' }
    );

    return data;
  }
}
