/**
 * UserRestaurantService
 *
 * Manages user-restaurant relationships including:
 * - Getting user's restaurant relations
 * - Adding/removing restaurants from user lists
 * - Filtering restaurants by status (been/want-to-try/recommended)
 * - Watchlist management (want-to-try stored on users table)
 * - Friend recommendations (computed on-the-fly from friends' ratings)
 * - Ranking: Binary search ranking insertion and rank index maintenance
 * - Reviews: User reviews with notes, photos, tags, and companions
 *
 * Now connected to Supabase PostgreSQL database.
 * Supports automatic fallback to mock data via withFallback().
 *
 * Architecture Notes:
 * - "Been" list: Stored in ratings table with status='been'
 * - "Want to Try" list: Stored in users.watchlist array (not in ratings)
 * - "Recommendations": Computed from friends' high ratings (not stored)
 * - Rankings: Uses rank_index column on ratings table
 * - Reviews: Ratings with non-empty notes field are considered reviews
 *
 * NOTE: Ranking functionality was merged from RankingService.
 * NOTE: Review functionality was merged from ReviewService.
 */

import { withFallback } from '@/lib/data-provider';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockRestaurants } from '@/data/mock/restaurants';
import { mockReviews } from '@/data/mock/reviews';
import { mapDbToRestaurant, mapDbToRelation, DbRating, DbRestaurant } from '../mappers';

import type { Database } from '@/lib/supabase/types';
import type { Restaurant, UserRestaurantRelation, ListCategory, RankedRestaurant } from '@/types';

// Lazy import supabase to avoid throwing when env vars missing in mock mode
const getSupabase = async () => {
  const { supabase } = await import('@/lib/supabase/client');
  return supabase;
};

// Database types for Insert/Update (not in centralized mappers)
type DbRatingInsert = Database['public']['Tables']['ratings']['Insert'];
type DbRatingUpdate = Database['public']['Tables']['ratings']['Update'];

// In-memory mock watchlist (for demo mode)
const mockWatchlist = new Map<string, Set<string>>();

// Initialize some default mock watchlist entries
function initMockWatchlist() {
  if (mockWatchlist.size === 0) {
    // Extract want_to_try entries from mock relations
    const wantToTryByUser = new Map<string, Set<string>>();
    mockUserRestaurantRelations
      .filter((r) => r.status === 'want_to_try')
      .forEach((r) => {
        if (!wantToTryByUser.has(r.userId)) {
          wantToTryByUser.set(r.userId, new Set());
        }
        wantToTryByUser.get(r.userId)!.add(r.restaurantId);
      });
    wantToTryByUser.forEach((restaurants, userId) => {
      mockWatchlist.set(userId, restaurants);
    });
  }
}
initMockWatchlist();

export class UserRestaurantService {
  /**
   * Get all restaurant relations for a user
   * @param userId - ID of the user
   * @returns Array of user-restaurant relations
   */
  static async getUserRestaurantRelations(userId: string): Promise<UserRestaurantRelation[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .returns<DbRating[]>();

        if (error) throw error;
        return (data || []).map(mapDbToRelation);
      },
      () => mockUserRestaurantRelations.filter((r) => r.userId === userId),
      { operationName: 'getUserRestaurantRelations' }
    );

    return data;
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
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Get user's ratings with this status
        const { data: ratings, error: ratingsError } = await supabase
          .from('ratings')
          .select('restaurant_id')
          .eq('user_id', userId)
          .eq('status', status)
          .returns<Pick<DbRating, 'restaurant_id'>[]>();

        if (ratingsError) throw ratingsError;

        if (!ratings || ratings.length === 0) {
          return [];
        }

        // Get the restaurant details
        const restaurantIds = ratings.map((r) => r.restaurant_id);
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds)
          .returns<DbRestaurant[]>();

        if (restaurantsError) throw restaurantsError;

        return (restaurants || []).map(mapDbToRestaurant);
      },
      () => {
        // Get restaurant IDs with matching status
        const restaurantIds = mockUserRestaurantRelations
          .filter((r) => r.userId === userId && r.status === status)
          .map((r) => r.restaurantId);

        return mockRestaurants.filter((r) => restaurantIds.includes(r.id));
      },
      { operationName: 'getUserRestaurantsByStatus' }
    );

    return data;
  }

  /**
   * Add a restaurant to a user's list
   * Creates or updates a user-restaurant relation with optional metadata
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant
   * @param status - List status (been/want_to_try/recommended)
   * @param data - Optional metadata (rating, notes, photos, tags)
   * @returns The created/updated user-restaurant relation
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
    const { data: result } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const insertData: DbRatingInsert = {
          user_id: userId,
          restaurant_id: restaurantId,
          status,
          rating: data?.rating ?? null,
          notes: data?.notes ?? null,
          photos: data?.photos || [],
          tags: data?.tags || [],
          visit_date: status === 'been' ? new Date().toISOString() : null,
          companions: [],
          rank_index: null,
        };

        // Upsert - insert or update if exists
        const { data: result, error } = await (supabase.from('ratings') as any)
          .upsert(insertData, { onConflict: 'user_id,restaurant_id' })
          .select()
          .single();

        if (error) throw error;
        return mapDbToRelation(result as DbRating);
      },
      () => {
        // In mock mode, return a temporary relation (not persisted)
        return {
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
      },
      { operationName: 'addRestaurantToUserList' }
    );

    return result;
  }

  /**
   * Remove a restaurant from a user's list
   * Deletes the user-restaurant relation
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant to remove
   */
  static async removeRestaurantFromUserList(userId: string, restaurantId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { error } = await supabase
          .from('ratings')
          .delete()
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;
      },
      () => {
        // In mock mode, this is a no-op (mock data is static)
        console.log(`[Mock] Removed restaurant ${restaurantId} from user ${userId}'s list`);
      },
      { operationName: 'removeRestaurantFromUserList' }
    );
  }

  /**
   * Get a specific user-restaurant relation
   * Useful for checking if a user has already rated a restaurant
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant
   * @returns The relation or null if not found
   */
  static async getUserRestaurantRelation(
    userId: string,
    restaurantId: string
  ): Promise<UserRestaurantRelation | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId)
          .returns<DbRating[]>()
          .single();

        if (error) {
          // PGRST116 is "no rows returned" - not an error, just no relation exists
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        return mapDbToRelation(data);
      },
      () =>
        mockUserRestaurantRelations.find(
          (r) => r.userId === userId && r.restaurantId === restaurantId
        ) || null,
      { operationName: 'getUserRestaurantRelation' }
    );

    return data;
  }

  /**
   * Update an existing user-restaurant relation
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant
   * @param updates - Fields to update
   * @returns The updated relation or null if not found
   */
  static async updateUserRestaurantRelation(
    userId: string,
    restaurantId: string,
    updates: {
      status?: 'been' | 'want_to_try' | 'recommended';
      rating?: number;
      notes?: string;
      photos?: string[];
      tags?: string[];
      rankIndex?: number;
    }
  ): Promise<UserRestaurantRelation | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const updateData: DbRatingUpdate = {};

        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.rating !== undefined) updateData.rating = updates.rating;
        if (updates.notes !== undefined) updateData.notes = updates.notes;
        if (updates.photos !== undefined) updateData.photos = updates.photos;
        if (updates.tags !== undefined) updateData.tags = updates.tags;
        if (updates.rankIndex !== undefined) updateData.rank_index = updates.rankIndex;

        const { data, error } = await (supabase.from('ratings') as any)
          .update(updateData)
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId)
          .select()
          .single();

        if (error) throw error;
        return mapDbToRelation(data as DbRating);
      },
      () => {
        // In mock mode, return existing relation with updates applied
        const existing = mockUserRestaurantRelations.find(
          (r) => r.userId === userId && r.restaurantId === restaurantId
        );
        if (!existing) return null;
        return {
          ...existing,
          ...updates,
        };
      },
      { operationName: 'updateUserRestaurantRelation' }
    );

    return data;
  }

  // ============================================================
  // WATCHLIST METHODS (Want-to-Try stored on users.watchlist array)
  // ============================================================

  /**
   * Get user's watchlist (want-to-try restaurants)
   * Reads from users.watchlist array and fetches full restaurant details.
   *
   * @param userId - ID of the user
   * @returns Array of restaurants on the user's watchlist
   */
  static async getWatchlist(userId: string): Promise<Restaurant[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // First get the user's watchlist array
        // Type assertion needed because watchlist is a new column
        const { data: userData, error: userError } = (await supabase
          .from('users')
          .select('watchlist')
          .eq('id', userId)
          .single()) as { data: { watchlist: string[] | null } | null; error: any };

        if (userError) throw userError;

        const watchlist = userData?.watchlist || [];
        if (watchlist.length === 0) {
          return [];
        }

        // Fetch the restaurant details
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', watchlist)
          .returns<DbRestaurant[]>();

        if (restaurantsError) throw restaurantsError;

        return (restaurants || []).map(mapDbToRestaurant);
      },
      () => {
        // Get watchlist from mock data
        const watchlistIds = mockWatchlist.get(userId);
        if (!watchlistIds || watchlistIds.size === 0) {
          return [];
        }
        return mockRestaurants.filter((r) => watchlistIds.has(r.id));
      },
      { operationName: 'getWatchlist' }
    );

    return data;
  }

  /**
   * Add a restaurant to user's watchlist
   * Uses PostgreSQL function for atomic array append operation.
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant to add
   * @returns true if added successfully, false if already in watchlist or error
   */
  static async addToWatchlist(userId: string, restaurantId: string): Promise<boolean> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Type assertion for RPC call - these functions return boolean
        const { data, error } = (await (supabase.rpc as any)('add_to_watchlist', {
          p_user_id: userId,
          p_restaurant_id: restaurantId,
        })) as { data: boolean | null; error: any };

        if (error) throw error;
        return data === true;
      },
      () => {
        // In mock mode, update in-memory watchlist
        if (!mockWatchlist.has(userId)) {
          mockWatchlist.set(userId, new Set());
        }
        const watchlist = mockWatchlist.get(userId)!;
        if (watchlist.has(restaurantId)) {
          return false; // Already in watchlist
        }
        watchlist.add(restaurantId);
        return true;
      },
      { operationName: 'addToWatchlist' }
    );

    return data;
  }

  /**
   * Remove a restaurant from user's watchlist
   * Uses PostgreSQL function for atomic array removal operation.
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant to remove
   * @returns true if removed successfully, false if not in watchlist or error
   */
  static async removeFromWatchlist(userId: string, restaurantId: string): Promise<boolean> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Type assertion for RPC call
        const { data, error } = (await (supabase.rpc as any)('remove_from_watchlist', {
          p_user_id: userId,
          p_restaurant_id: restaurantId,
        })) as { data: boolean | null; error: any };

        if (error) throw error;
        return data === true;
      },
      () => {
        // In mock mode, update in-memory watchlist
        const watchlist = mockWatchlist.get(userId);
        if (!watchlist || !watchlist.has(restaurantId)) {
          return false; // Not in watchlist
        }
        watchlist.delete(restaurantId);
        return true;
      },
      { operationName: 'removeFromWatchlist' }
    );

    return data;
  }

  /**
   * Check if a restaurant is in user's watchlist
   * Uses PostgreSQL function for efficient array membership check.
   *
   * @param userId - ID of the user
   * @param restaurantId - ID of the restaurant to check
   * @returns true if restaurant is in watchlist
   */
  static async isInWatchlist(userId: string, restaurantId: string): Promise<boolean> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Type assertion for RPC call
        const { data, error } = (await (supabase.rpc as any)('is_in_watchlist', {
          p_user_id: userId,
          p_restaurant_id: restaurantId,
        })) as { data: boolean | null; error: any };

        if (error) throw error;
        return data === true;
      },
      () => mockWatchlist.get(userId)?.has(restaurantId) || false,
      { operationName: 'isInWatchlist' }
    );

    return data;
  }

  // ============================================================
  // FRIEND RECOMMENDATIONS (Computed on-the-fly, not stored)
  // ============================================================

  /**
   * Get friend recommendations for a user
   * Returns restaurants that user's friends have rated highly (8.0+)
   * that the user hasn't visited yet.
   *
   * Computed on-the-fly using PostgreSQL function for efficiency.
   * Results include which friend recommended it and their rating.
   *
   * @param userId - ID of the user
   * @param minRating - Minimum rating to consider (default: 8.0)
   * @param limit - Maximum number of recommendations (default: 20)
   * @returns Restaurants recommended by friends with recommender info
   */
  static async getFriendRecommendations(
    userId: string,
    minRating: number = 8.0,
    limit: number = 20
  ): Promise<FriendRecommendation[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Type for the RPC result
        type FriendRecRow = {
          id: string;
          name: string;
          cuisine: string[];
          category: string;
          price_range: string;
          address: string;
          city: string;
          state: string;
          neighborhood: string;
          rating: number;
          rating_count: number;
          images: string[];
          is_open: boolean;
          accepts_reservations: boolean;
          friend_rating: number;
          recommender_name: string;
          recommender_username: string;
          recommender_count: number;
        };

        // Type assertion for RPC call
        const { data, error } = (await (supabase.rpc as any)('get_friend_recommendations', {
          p_user_id: userId,
          p_min_rating: minRating,
          p_limit: limit,
        })) as { data: FriendRecRow[] | null; error: any };

        if (error) throw error;

        // Map database result to FriendRecommendation type
        return (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          cuisine: row.cuisine,
          category: row.category,
          priceRange: row.price_range,
          address: row.address,
          city: row.city,
          state: row.state,
          neighborhood: row.neighborhood,
          rating: row.rating,
          ratingCount: row.rating_count,
          images: row.images,
          isOpen: row.is_open,
          acceptsReservations: row.accepts_reservations,
          friendRating: row.friend_rating,
          recommenderName: row.recommender_name,
          recommenderUsername: row.recommender_username,
          recommenderCount: row.recommender_count,
        }));
      },
      () => {
        // In mock mode, find highly rated restaurants from mock relations
        const highlyRated = mockUserRestaurantRelations.filter(
          (r) => r.status === 'been' && r.rating !== undefined && r.rating >= minRating
        );

        // Get unique restaurant IDs the user hasn't visited
        const userVisited = new Set(
          mockUserRestaurantRelations.filter((r) => r.userId === userId).map((r) => r.restaurantId)
        );

        const recommendations: FriendRecommendation[] = [];
        const seen = new Set<string>();

        for (const relation of highlyRated) {
          if (seen.has(relation.restaurantId) || userVisited.has(relation.restaurantId)) continue;
          seen.add(relation.restaurantId);

          const restaurant = mockRestaurants.find((r) => r.id === relation.restaurantId);
          if (!restaurant) continue;

          recommendations.push({
            id: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            category: restaurant.category || 'all',
            priceRange: restaurant.priceRange,
            address: restaurant.location.address,
            city: restaurant.location.city,
            state: restaurant.location.state,
            neighborhood: restaurant.location.neighborhood,
            rating: restaurant.rating,
            ratingCount: restaurant.ratingCount ?? 0,
            images: restaurant.images,
            isOpen: restaurant.isOpen ?? false,
            acceptsReservations: restaurant.acceptsReservations ?? false,
            friendRating: relation.rating!,
            recommenderName: `User ${relation.userId}`,
            recommenderUsername: `user${relation.userId}`,
            recommenderCount: 1,
          });

          if (recommendations.length >= limit) break;
        }

        return recommendations;
      },
      { operationName: 'getFriendRecommendations' }
    );

    return data;
  }

  // ============================================
  // Ranking Methods (merged from RankingService)
  // ============================================

  /**
   * Get ranked restaurants for a user
   * Returns restaurants sorted by their rank index (lower index = higher rank)
   *
   * @param userId - ID of the user
   * @param category - List category (filters by restaurant.category)
   * @returns Ranked restaurants with user ratings attached
   */
  static async getRankedRestaurants(
    userId: string,
    category: ListCategory
  ): Promise<RankedRestaurant[]> {
    // Build query to get user's rated restaurants with rank indices
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('ratings')
          .select(
            `
            id, user_id, restaurant_id, status, rating, rank_index,
            restaurants!inner(*)
          `
          )
          .eq('user_id', userId)
          .eq('status', 'been')
          .order('rank_index', { ascending: true, nullsFirst: false });

        if (error) {
          console.error('Error fetching ranked restaurants:', error);
          return [];
        }

        // Type for rating with joined restaurant data
        type RatingWithRestaurant = DbRating & { restaurants: DbRestaurant };
        let filteredData = (data || []) as unknown as RatingWithRestaurant[];

        // Filter by category if not 'restaurants' (the default)
        if (category !== 'restaurants') {
          filteredData = filteredData.filter(
            (row) => row.restaurants.category === category
          );
        }

        // Map to RankedRestaurant (Restaurant + userRating)
        return filteredData.map((row) => ({
          ...mapDbToRestaurant(row.restaurants),
          userRating: row.rating || undefined,
        }));
      },
      () => {
        // Mock fallback: get user's been restaurants with ratings
        const userRelations = mockUserRestaurantRelations
          .filter((r) => r.userId === userId && r.status === 'been')
          .sort((a, b) => (a.rankIndex || 999) - (b.rankIndex || 999));

        const results: RankedRestaurant[] = [];
        for (const rel of userRelations) {
          const restaurant = mockRestaurants.find((r) => r.id === rel.restaurantId);
          if (!restaurant) continue;
          if (category !== 'restaurants' && restaurant.category !== category) continue;
          results.push({
            ...restaurant,
            userRating: rel.rating,
          });
        }
        return results;
      },
      { operationName: 'getRankedRestaurants' }
    );

    return data || [];
  }

  /**
   * Insert a restaurant at a specific rank position
   * Uses binary search ranking algorithm to place restaurant in ranked list
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
    insertData?: {
      notes?: string;
      photos?: string[];
      tags?: string[];
      companions?: string[];
    }
  ): Promise<UserRestaurantRelation> {
    // Update rank indices for existing restaurants at or after this position
    await this.updateRankIndices(userId, category, position);

    // Upsert the rating with rank index
    const { data: result } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: upsertedData, error } = await (supabase.from('ratings') as any)
          .upsert(
            {
              user_id: userId,
              restaurant_id: restaurantId,
              status: 'been' as const,
              rating,
              rank_index: position,
              notes: insertData?.notes || null,
              photos: insertData?.photos || [],
              tags: insertData?.tags || [],
              companions: insertData?.companions || [],
              visit_date: new Date().toISOString(),
            },
            { onConflict: 'user_id,restaurant_id' }
          )
          .select('*')
          .single();

        if (error) {
          console.error('Error inserting ranked restaurant:', error);
          throw error;
        }

        return mapDbToRelation(upsertedData as DbRating);
      },
      () => {
        // Return a fallback relation on mock mode
        return {
          userId,
          restaurantId,
          status: 'been' as const,
          rating,
          rankIndex: position,
          notes: insertData?.notes,
          photos: insertData?.photos,
          tags: insertData?.tags,
          companions: insertData?.companions,
          createdAt: new Date(),
          visitDate: new Date(),
        };
      },
      { operationName: 'insertRankedRestaurant' }
    );

    return result;
  }

  /**
   * Update rank indices for existing restaurants
   * Increments rank indices for all restaurants at or after the given position
   *
   * @param userId - ID of the user
   * @param category - List category (not used in current implementation)
   * @param fromIndex - Position from which to start incrementing indices
   */
  static async updateRankIndices(
    userId: string,
    _category: ListCategory,
    fromIndex: number
  ): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Fetch all ratings for this user with rank_index >= fromIndex
        const { data: ratingsToUpdate, error: fetchError } = await supabase
          .from('ratings')
          .select('id, rank_index')
          .eq('user_id', userId)
          .eq('status', 'been')
          .gte('rank_index', fromIndex);

        if (fetchError) {
          console.error('Error fetching ratings to update:', fetchError);
          return;
        }

        if (!ratingsToUpdate || ratingsToUpdate.length === 0) {
          return;
        }

        type RatingRankRow = { id: string; rank_index: number | null };
        const typedRatings = ratingsToUpdate as RatingRankRow[];

        // Update each rating's rank_index by incrementing by 1
        const updatePromises = typedRatings.map((rating) =>
          (supabase.from('ratings') as any)
            .update({ rank_index: (rating.rank_index || 0) + 1 })
            .eq('id', rating.id)
        );

        const results = await Promise.all(updatePromises);

        results.forEach((result, index) => {
          if (result.error) {
            console.error(`Error updating rank for rating ${typedRatings[index].id}:`, result.error);
          }
        });
      },
      () => {
        // Mock mode: no-op for now
        console.log(`[Mock] Would update rank indices from ${fromIndex} for user ${userId}`);
      },
      { operationName: 'updateRankIndices' }
    );
  }

  // ============================================
  // Review Methods (merged from ReviewService)
  // ============================================

  /**
   * Get all reviews for a specific restaurant
   * Reviews are ratings with non-empty notes
   *
   * @param restaurantId - ID of the restaurant
   * @returns Reviews for the restaurant, sorted by newest first
   */
  static async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('ratings')
          .select(
            `
            *,
            users!inner(username, display_name, avatar)
          `
          )
          .eq('restaurant_id', restaurantId)
          .not('notes', 'is', null)
          .neq('notes', '')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map((row) => mapDbToReview(row as RatingWithUser));
      },
      () =>
        mockReviews
          .filter((r) => r.restaurantId === restaurantId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      { operationName: 'getRestaurantReviews' }
    );

    return data;
  }

  /**
   * Get all reviews written by a specific user
   *
   * @param userId - ID of the user
   * @returns Reviews written by the user, sorted by newest first
   */
  static async getUserReviews(userId: string): Promise<Review[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('ratings')
          .select(
            `
            *,
            users!inner(username, display_name, avatar)
          `
          )
          .eq('user_id', userId)
          .not('notes', 'is', null)
          .neq('notes', '')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map((row) => mapDbToReview(row as RatingWithUser));
      },
      () =>
        mockReviews
          .filter((r) => r.userId === userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      { operationName: 'getUserReviews' }
    );

    return data;
  }

  /**
   * Add a new review (updates the notes on an existing rating or creates one)
   *
   * @param review - Review data (without id, createdAt, helpfulCount)
   * @returns The created/updated review
   */
  static async addReview(review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): Promise<Review> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await (supabase.from('ratings') as any)
          .upsert(
            {
              user_id: review.userId,
              restaurant_id: review.restaurantId,
              status: 'been' as const,
              rating: review.rating,
              notes: review.content,
              photos: review.photos || [],
              tags: review.tags || [],
              visit_date: review.visitDate?.toISOString() || new Date().toISOString(),
              companions: review.companions || [],
            },
            { onConflict: 'user_id,restaurant_id' }
          )
          .select(
            `
            *,
            users!inner(username, display_name, avatar)
          `
          )
          .single();

        if (error) throw error;
        return mapDbToReview(data as RatingWithUser);
      },
      () => {
        // In mock mode, return a temporary review (not persisted)
        return {
          id: `mock-${Date.now()}`,
          userId: review.userId,
          restaurantId: review.restaurantId,
          rating: review.rating,
          content: review.content,
          photos: review.photos || [],
          tags: review.tags || [],
          visitDate: review.visitDate || new Date(),
          createdAt: new Date(),
          helpfulCount: 0,
          isVerifiedVisit: true,
          companions: review.companions,
        };
      },
      { operationName: 'addReview' }
    );

    return data;
  }
}

// Type for rating with joined user data (for reviews)
interface RatingWithUser extends DbRating {
  users: {
    username: string;
    display_name: string;
    avatar: string | null;
  } | null;
}

/**
 * Maps a rating row with notes to a Review.
 * Ratings with non-empty notes are considered reviews.
 */
function mapDbToReview(row: RatingWithUser): Review {
  return {
    id: row.id,
    userId: row.user_id,
    restaurantId: row.restaurant_id,
    rating: row.rating || 0,
    content: row.notes || '',
    photos: row.photos || [],
    tags: row.tags || [],
    visitDate: row.visit_date ? new Date(row.visit_date) : new Date(row.created_at),
    createdAt: new Date(row.created_at),
    helpfulCount: 0,
    isVerifiedVisit: row.status === 'been',
    companions: row.companions || [],
    user: row.users
      ? {
          username: row.users.username,
          displayName: row.users.display_name,
          avatar: row.users.avatar,
        }
      : undefined,
  };
}

// Re-export the Review interface for consumers
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  title?: string;
  content: string;
  photos: string[];
  tags: string[];
  visitDate: Date;
  createdAt: Date;
  helpfulCount: number;
  isVerifiedVisit: boolean;
  companions?: string[];
  orderItems?: string[];
  user?: {
    username: string;
    displayName: string;
    avatar: string | null;
  };
}

// Type for friend recommendation with recommender info
export interface FriendRecommendation {
  id: string;
  name: string;
  cuisine: string[];
  category: string;
  priceRange: string;
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  rating: number;
  ratingCount: number;
  images: string[];
  isOpen: boolean;
  acceptsReservations: boolean;
  friendRating: number;
  recommenderName: string;
  recommenderUsername: string;
  recommenderCount: number;
}
