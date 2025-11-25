/**
 * FeedService
 *
 * Manages social activity feed including:
 * - Fetching activity feed from followed users
 * - Creating new activity items
 * - Feed interactions (likes, bookmarks, comments)
 *
 * Now connected to Supabase PostgreSQL database.
 * Uses the get_user_feed PostgreSQL function for optimized feed queries.
 * Supports automatic fallback to mock data via withFallback().
 *
 * NOTE: Feed interaction functionality (likes, bookmarks, comments) was merged from FeedInteractionService.
 */

import { withFallback } from '@/lib/data-provider';
import { mockActivities, Activity } from '@/data/mock/activities';
import { mapDbToRestaurant, mapDbToUser, DbRestaurant, DbUser, DbRating } from '../mappers';
import { delay } from '../base/BaseService';

import type { FeedItem, Restaurant, User, ListCategory, ActivityComment } from '@/types';

// Lazy import supabase to avoid throwing when env vars missing in mock mode
const getSupabase = async () => {
  const { supabase } = await import('@/lib/supabase/client');
  return supabase;
};

// Demo user ID
const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';

// Feed row from get_user_feed function
interface FeedRow {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_cuisine: string[];
  restaurant_neighborhood: string | null;
  status: 'been' | 'want_to_try' | 'recommended';
  score: number | null;
  notes: string | null;
  visit_date: string | null;
  created_at: string;
}

/**
 * Maps feed status to FeedItem type
 */
function mapStatusToType(status: 'been' | 'want_to_try' | 'recommended'): FeedItem['type'] {
  switch (status) {
    case 'been':
      return 'visit';
    case 'want_to_try':
      return 'want_to_try';
    case 'recommended':
      return 'recommendation';
    default:
      return 'visit';
  }
}

/**
 * Maps a feed row to Activity type
 */
function mapFeedRowToActivity(row: FeedRow): Activity {
  // Create minimal restaurant object from feed data
  const restaurant: Restaurant = {
    id: row.restaurant_id,
    name: row.restaurant_name,
    cuisine: row.restaurant_cuisine || [],
    rating: 0, // Not in feed data
    priceRange: '$$', // Default value
    location: {
      address: '',
      city: 'New York',
      state: 'NY',
      neighborhood: row.restaurant_neighborhood || '',
      coordinates: { lat: 0, lng: 0 },
    },
    images: [],
    popularDishes: [],
    popularDishImages: [],
    tags: [],
    goodFor: [],
    category: 'all' as ListCategory,
    scores: {
      recScore: 0,
      friendScore: 0,
    },
    isOpen: false,
    acceptsReservations: false,
    ratingCount: 0,
  };

  // Create minimal user object from feed data
  const user: User = {
    id: row.user_id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar || 'https://i.pravatar.cc/150?u=default',
    bio: '',
    stats: {
      followers: 0,
      following: 0,
      rank: 0,
      beenCount: 0,
      wantToTryCount: 0,
      currentStreak: 0,
    },
    location: { city: 'New York', state: 'NY' },
    dietaryRestrictions: [],
    dislikedCuisines: [],
    memberSince: new Date(),
  };

  return {
    id: row.id,
    restaurant,
    user,
    rating: row.score ?? 0,
    comment: row.notes || '',
    photos: [],
    tags: [],
    timestamp: new Date(row.created_at),
    type: mapStatusToType(row.status),
    interactions: {
      likes: [],
      comments: [],
      bookmarks: [],
    },
  };
}

export class FeedService {
  /**
   * Get activity feed for the current user
   * Returns activities from users the current user follows, sorted by timestamp
   *
   * @param userId - Optional user ID to get feed for specific user's own activities
   * @param limit - Maximum number of activities to return (default: 50)
   * @returns Sorted activities from followed users
   */
  static async getActivityFeed(userId?: string, limit: number = 50): Promise<Activity[]> {
    // If userId is provided, get that user's activities
    // Otherwise, get the demo user's personalized feed from people they follow
    if (userId) {
      return this.getUserActivities(userId, limit);
    }

    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // Get personalized feed using the PostgreSQL function
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('get_user_feed', {
          p_user_id: DEMO_USER_ID,
          p_limit: limit,
        });

        if (error) throw error;
        return (data as FeedRow[] || []).map(mapFeedRowToActivity);
      },
      () => {
        // Return mock activities sorted by timestamp
        return [...mockActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      },
      { operationName: 'getActivityFeed' }
    );

    return data;
  }

  /**
   * Get activities for a specific user
   * Used for user profile pages
   *
   * @param userId - User ID to get activities for
   * @param limit - Maximum number of activities
   * @returns User's activities sorted by date
   */
  static async getUserActivities(userId: string, limit: number = 20): Promise<Activity[]> {
    const { data } = await withFallback<Activity[]>(
      async () => {
        const supabase = await getSupabase();

        // Get user's ratings with restaurant info
        const { data: ratings, error: ratingsError } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
          .returns<DbRating[]>();

        if (ratingsError) throw ratingsError;

        if (!ratings || ratings.length === 0) {
          return [];
        }

        // Get user info
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .returns<DbUser[]>()
          .single();

        if (userError || !user) throw userError || new Error('User not found');

        // Get restaurant info for all ratings
        const restaurantIds = ratings.map((r) => r.restaurant_id);
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds)
          .returns<DbRestaurant[]>();

        if (restaurantsError) throw restaurantsError;

        const restaurantMap = new Map((restaurants || []).map((r) => [r.id, r]));

        // Map to Activity type
        return ratings.map((rating) => {
          const restaurantData = restaurantMap.get(rating.restaurant_id);

          // Use centralized mapper or fallback to default unknown restaurant
          const restaurant: Restaurant = restaurantData
            ? mapDbToRestaurant(restaurantData)
            : {
                id: rating.restaurant_id,
                name: 'Unknown Restaurant',
                cuisine: [],
                rating: 0,
                priceRange: '$$',
                location: { address: '', city: '', state: '', neighborhood: '', coordinates: { lat: 0, lng: 0 } },
                images: [],
                popularDishes: [],
                popularDishImages: [],
                tags: [],
                goodFor: [],
                category: 'all' as ListCategory,
                isOpen: false,
                acceptsReservations: false,
                ratingCount: 0,
              };

          const userObj: User = {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            avatar: user.avatar || 'https://i.pravatar.cc/150?u=default',
            bio: user.bio || '',
            stats: { followers: 0, following: 0, rank: 0, beenCount: 0, wantToTryCount: 0, currentStreak: 0 },
            location: { city: user.city || 'New York', state: user.state || 'NY' },
            dietaryRestrictions: [],
            dislikedCuisines: [],
            memberSince: new Date(user.created_at),
            isTastemaker: user.is_tastemaker,
          };

          return {
            id: rating.id,
            restaurant,
            user: userObj,
            rating: rating.rating ?? 0,
            comment: rating.notes || '',
            photos: rating.photos || [],
            tags: rating.tags || [],
            timestamp: new Date(rating.created_at),
            type: mapStatusToType(rating.status),
            interactions: {
              likes: [],
              comments: [],
              bookmarks: [],
            },
          };
        });
      },
      () =>
        mockActivities
          .filter((a) => a.user.id === userId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit) as Activity[],
      { operationName: 'getUserActivities' }
    );

    return data;
  }

  /**
   * Add a new activity to the feed
   * This actually creates a rating in the database
   *
   * @param activity - Activity data without ID
   * @returns The created activity
   */
  static async addActivity(activity: Omit<FeedItem, 'id'>): Promise<Activity> {
    // Map FeedItem type to rating status
    const statusMap: Record<FeedItem['type'], 'been' | 'want_to_try' | 'recommended'> = {
      visit: 'been',
      review: 'been',
      want_to_try: 'want_to_try',
      bookmark: 'want_to_try',
      recommendation: 'recommended',
      follow: 'been', // Default for follow type
    };

    const status = statusMap[activity.type] || 'been';

    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('ratings') as any)
          .insert({
            user_id: activity.user.id,
            restaurant_id: activity.restaurant.id,
            status,
            rating: activity.rating || null,
            notes: activity.comment || null,
            photos: activity.photos || [],
            tags: activity.tags || [],
            visit_date: activity.type === 'visit' ? new Date().toISOString() : null,
            companions: [],
            rank_index: null,
          })
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          restaurant: activity.restaurant,
          user: activity.user,
          rating: data.rating ?? 0,
          comment: data.notes || '',
          photos: data.photos || [],
          tags: data.tags || [],
          timestamp: new Date(data.created_at),
          type: activity.type,
          interactions: {
            likes: [],
            comments: [],
            bookmarks: [],
          },
        };
      },
      () => {
        // In mock mode, return a temporary activity (not persisted)
        return {
          id: `mock-${Date.now()}`,
          restaurant: activity.restaurant,
          user: activity.user,
          rating: activity.rating ?? 0,
          comment: activity.comment || '',
          photos: activity.photos || [],
          tags: activity.tags || [],
          timestamp: new Date(),
          type: activity.type,
          interactions: {
            likes: [],
            comments: [],
            bookmarks: [],
          },
        };
      },
      { operationName: 'addActivity' }
    );

    return data;
  }

  // ============================================
  // Interaction Methods (merged from FeedInteractionService)
  // ============================================

  /**
   * Like an activity
   * Adds user to the activity's likes array
   *
   * @param activityId - ID of the activity to like
   * @param userId - ID of the user liking the activity
   */
  static async likeActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find((a) => a.id === activityId);
    if (activity && activity.interactions) {
      const likes = activity.interactions.likes;
      if (!likes.includes(userId)) {
        likes.push(userId);
      }
    }
  }

  /**
   * Unlike an activity
   * Removes user from the activity's likes array
   *
   * @param activityId - ID of the activity to unlike
   * @param userId - ID of the user unliking the activity
   */
  static async unlikeActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find((a) => a.id === activityId);
    if (activity && activity.interactions) {
      const likes = activity.interactions.likes;
      const index = likes.indexOf(userId);
      if (index > -1) {
        likes.splice(index, 1);
      }
    }
  }

  /**
   * Bookmark an activity
   * Adds user to the activity's bookmarks array
   *
   * @param activityId - ID of the activity to bookmark
   * @param userId - ID of the user bookmarking the activity
   */
  static async bookmarkActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find((a) => a.id === activityId);
    if (activity && activity.interactions) {
      const bookmarks = activity.interactions.bookmarks;
      if (!bookmarks.includes(userId)) {
        bookmarks.push(userId);
      }
    }
  }

  /**
   * Unbookmark an activity
   * Removes user from the activity's bookmarks array
   *
   * @param activityId - ID of the activity to unbookmark
   * @param userId - ID of the user unbookmarking the activity
   */
  static async unbookmarkActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find((a) => a.id === activityId);
    if (activity && activity.interactions) {
      const bookmarks = activity.interactions.bookmarks;
      const index = bookmarks.indexOf(userId);
      if (index > -1) {
        bookmarks.splice(index, 1);
      }
    }
  }

  /**
   * Add a comment to an activity
   * Creates a new comment and adds it to the activity's comments array
   *
   * @param activityId - ID of the activity to comment on
   * @param userId - ID of the user adding the comment
   * @param content - Text content of the comment
   * @returns The created comment
   * @throws Error if activity is not found
   */
  static async addCommentToActivity(
    activityId: string,
    userId: string,
    content: string
  ): Promise<ActivityComment> {
    await delay();

    const activity = mockActivities.find((a) => a.id === activityId);
    if (!activity || !activity.interactions) {
      throw new Error('Activity not found');
    }

    const newComment: ActivityComment = {
      id: `comment-${Date.now()}`,
      userId,
      content,
      timestamp: new Date(),
    };

    activity.interactions.comments.push(newComment);
    return newComment;
  }
}
