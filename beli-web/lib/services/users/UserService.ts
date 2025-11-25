/**
 * UserService
 *
 * Core user management including:
 * - User CRUD operations
 * - User search
 * - User statistics
 * - User match percentages (taste compatibility)
 * - Social relationships (follow/unfollow, followers/following)
 * - Friend relationships for group features
 * - Leaderboard rankings
 * - Taste profile analytics
 *
 * Now connected to Supabase PostgreSQL database.
 * Supports automatic fallback to mock data via withFallback().
 *
 * NOTE: Social functionality (follows, friends) was merged from SocialService.
 * NOTE: Leaderboard functionality was merged from LeaderboardService.
 * NOTE: Taste profile functionality was merged from TasteProfileService.
 */

import { withFallback } from '@/lib/data-provider';
import { mockUsers } from '@/data/mock/users';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockRestaurants } from '@/data/mock/restaurants';

import { matchPercentageCache } from '../base/BaseService';

import type { Database } from '@/lib/supabase/types';
import type {
  User,
  TasteProfileStats,
  CuisineBreakdown,
  CityBreakdown,
  CountryBreakdown,
  DiningLocation,
} from '@/types';

// In-memory mock following relationships (for demo mode)
const mockFollowing = new Map<string, Set<string>>();

// Initialize some default mock relationships
function initMockRelationships() {
  if (mockFollowing.size === 0) {
    // User 1 follows users 2, 3, 4
    mockFollowing.set('1', new Set(['2', '3', '4', '5', '6']));
    mockFollowing.set('2', new Set(['1', '3']));
    mockFollowing.set('3', new Set(['1', '2', '4']));
  }
}
initMockRelationships();

// Lazy import supabase to avoid throwing when env vars missing in mock mode
const getSupabase = async () => {
  const { supabase } = await import('@/lib/supabase/client');
  return supabase;
};

// Get current user from mock data (first user is the demo user)
const getMockCurrentUser = () => mockUsers[0];

// Database types from Supabase
type DbUser = Database['public']['Tables']['users']['Row'];
type DbUserStats = Database['public']['Views']['user_stats']['Row'];
type DbRating = Database['public']['Tables']['ratings']['Row'];
type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];
type DbUserFollow = Database['public']['Tables']['user_follows']['Row'];

// Demo user ID (hardcoded for demo purposes)
const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';

/**
 * Maps a Supabase database user row to the frontend User type.
 * Adds default values for fields not in the database.
 */
function mapDbToUser(row: DbUser, stats?: DbUserStats): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar || 'https://i.pravatar.cc/150?u=default',
    bio: row.bio || '',
    stats: {
      followers: stats?.followers_count ?? 0,
      following: stats?.following_count ?? 0,
      rank: 0, // Not in database
      beenCount: stats?.been_count ?? 0,
      wantToTryCount: stats?.want_to_try_count ?? 0,
      currentStreak: 0, // Not in database
    },
    location: {
      city: row.city || 'New York',
      state: row.state || 'NY',
    },
    dietaryRestrictions: [],
    dislikedCuisines: [],
    memberSince: new Date(row.created_at),
    isTastemaker: row.is_tastemaker,
  };
}

export class UserService {
  /**
   * Get the current logged-in user
   * For demo purposes, returns the hardcoded demo user
   * @returns Current user
   */
  static async getCurrentUser(): Promise<User> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', DEMO_USER_ID)
          .single();

        if (userError || !user) throw userError || new Error('User not found');

        // Get user stats from view
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', DEMO_USER_ID)
          .single();

        return mapDbToUser(user, stats ?? undefined);
      },
      () => getMockCurrentUser(),
      { operationName: 'getCurrentUser' }
    );

    return data;
  }

  /**
   * Get a user by ID
   * @param userId - ID of the user
   * @returns User or null if not found
   */
  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !user) throw error || new Error('User not found');

        // Get user stats from view
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        return mapDbToUser(user, stats ?? undefined);
      },
      () => mockUsers.find((u) => u.id === userId) || null,
      { operationName: 'getUserById' }
    );

    return data;
  }

  /**
   * Get a user by username
   * @param username - Username to search for
   * @returns User or null if not found
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .returns<DbUser[]>()
          .single();

        if (error || !user) throw error || new Error('User not found');

        // Get user stats from view
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .returns<DbUserStats[]>()
          .single();

        return mapDbToUser(user, stats ?? undefined);
      },
      () => mockUsers.find((u) => u.username === username) || null,
      { operationName: 'getUserByUsername' }
    );

    return data;
  }

  /**
   * Search for users by username or display name
   * @param query - Search query
   * @returns Matching users
   */
  static async searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) return [];

    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const searchTerm = `%${query.trim()}%`;

        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
          .limit(20)
          .returns<DbUser[]>();

        if (error) throw error;

        // Get stats for all matching users
        const userIds = (users || []).map((u) => u.id);
        const { data: allStats } = await supabase
          .from('user_stats')
          .select('*')
          .in('user_id', userIds)
          .returns<DbUserStats[]>();

        const statsMap = new Map((allStats || []).map((s) => [s.user_id, s]));

        return (users || []).map((user) => mapDbToUser(user, statsMap.get(user.id)));
      },
      () => {
        const q = query.trim().toLowerCase();
        return mockUsers.filter(
          (u) =>
            u.username.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q)
        );
      },
      { operationName: 'searchUsers' }
    );

    return data;
  }

  /**
   * Get user statistics
   * @param userId - ID of the user
   * @returns User stats or null if user not found
   */
  static async getUserStats(userId: string): Promise<User['stats'] | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: stats, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .returns<DbUserStats[]>()
          .single();

        if (error || !stats) throw error || new Error('Stats not found');

        return {
          followers: stats.followers_count,
          following: stats.following_count,
          rank: 0,
          beenCount: stats.been_count,
          wantToTryCount: stats.want_to_try_count,
          currentStreak: 0,
        };
      },
      () => {
        const user = mockUsers.find((u) => u.id === userId);
        return user?.stats || null;
      },
      { operationName: 'getUserStats' }
    );

    return data;
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
    // Check cache first - use sorted IDs for symmetric key (A-B match == B-A match)
    const cacheKey = [userId, targetUserId].sort().join('-');
    const cached = matchPercentageCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Helper to generate deterministic but varied mock match percentage
    const getMockMatchPercentage = () => {
      // Generate a deterministic score based on user IDs (so it's consistent)
      const hash = (cacheKey.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
      return Math.abs(hash % 50) + 40; // Range: 40-89
    };

    const { data: score } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get both users' ratings with restaurant cuisine info
        const [userRatingsResult, targetRatingsResult] = await Promise.all([
          supabase
            .from('ratings')
            .select('restaurant_id')
            .eq('user_id', userId)
            .in('status', ['been', 'want_to_try'])
            .returns<Pick<DbRating, 'restaurant_id'>[]>(),
          supabase
            .from('ratings')
            .select('restaurant_id')
            .eq('user_id', targetUserId)
            .in('status', ['been', 'want_to_try'])
            .returns<Pick<DbRating, 'restaurant_id'>[]>(),
        ]);

        const userRelations = userRatingsResult.data || [];
        const targetRelations = targetRatingsResult.data || [];

        if (userRelations.length === 0 || targetRelations.length === 0) {
          return Math.floor(Math.random() * 21) + 30;
        }

        // Calculate restaurant overlap using Jaccard similarity
        const userRestaurantIds = new Set(userRelations.map((rel) => rel.restaurant_id));
        const targetRestaurantIds = new Set(targetRelations.map((rel) => rel.restaurant_id));

        const intersection = [...userRestaurantIds].filter((id) => targetRestaurantIds.has(id));
        const union = new Set([...userRestaurantIds, ...targetRestaurantIds]);

        const jaccardSimilarity = intersection.length / union.size;

        // Get cuisine data for both users' restaurants
        const allRestaurantIds = [...union];
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('id, cuisine')
          .in('id', allRestaurantIds)
          .returns<Pick<DbRestaurant, 'id' | 'cuisine'>[]>();

        const restaurantCuisineMap = new Map(
          (restaurants || []).map((r) => [r.id, r.cuisine || []])
        );

        // Calculate cuisine similarity
        const userCuisines = new Set<string>();
        const targetCuisines = new Set<string>();

        userRelations.forEach((rel) => {
          const cuisines = restaurantCuisineMap.get(rel.restaurant_id) || [];
          cuisines.forEach((c: string) => userCuisines.add(c));
        });

        targetRelations.forEach((rel) => {
          const cuisines = restaurantCuisineMap.get(rel.restaurant_id) || [];
          cuisines.forEach((c: string) => targetCuisines.add(c));
        });

        const cuisineIntersection = [...userCuisines].filter((c) => targetCuisines.has(c));
        const cuisineUnion = new Set([...userCuisines, ...targetCuisines]);
        const cuisineSimilarity = cuisineUnion.size > 0 ? cuisineIntersection.length / cuisineUnion.size : 0;

        // Combined score: 70% restaurant overlap + 30% cuisine similarity
        const matchScore = (jaccardSimilarity * 0.7 + cuisineSimilarity * 0.3) * 100;

        // Add some variance and ensure it's between 30-99
        const variance = Math.floor(Math.random() * 11) - 5;
        return Math.max(30, Math.min(99, Math.floor(matchScore + variance)));
      },
      () => getMockMatchPercentage(),
      { operationName: 'getUserMatchPercentage' }
    );

    // Cache the result
    matchPercentageCache.set(cacheKey, score);

    return score;
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
    if (targetUserIds.length === 0) return {};

    // Helper to generate deterministic mock match percentages
    const getMockBatchPercentages = () => {
      const results: Record<string, number> = {};
      targetUserIds.forEach((targetUserId) => {
        const cacheKey = [userId, targetUserId].sort().join('-');
        const hash = (cacheKey.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
        results[targetUserId] = Math.abs(hash % 50) + 40; // Range: 40-89
      });
      return results;
    };

    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const results: Record<string, number> = {};

        // Get user's ratings
        const { data: userRatings } = await supabase
          .from('ratings')
          .select('restaurant_id')
          .eq('user_id', userId)
          .in('status', ['been', 'want_to_try'])
          .returns<Pick<DbRating, 'restaurant_id'>[]>();

        const userRestaurantIds = new Set((userRatings || []).map((rel) => rel.restaurant_id));

        if (userRestaurantIds.size === 0) {
          // Return baseline match percentages
          targetUserIds.forEach((targetUserId) => {
            results[targetUserId] = Math.floor(Math.random() * 21) + 30;
          });
          return results;
        }

        // Get all target users' ratings in one query
        const { data: targetRatings } = await supabase
          .from('ratings')
          .select('user_id, restaurant_id')
          .in('user_id', targetUserIds)
          .in('status', ['been', 'want_to_try'])
          .returns<Pick<DbRating, 'user_id' | 'restaurant_id'>[]>();

        // Group ratings by user
        const targetRatingsByUser = new Map<string, Set<string>>();
        (targetRatings || []).forEach((rating) => {
          if (!targetRatingsByUser.has(rating.user_id)) {
            targetRatingsByUser.set(rating.user_id, new Set());
          }
          targetRatingsByUser.get(rating.user_id)!.add(rating.restaurant_id);
        });

        // Calculate match percentage for each target user
        targetUserIds.forEach((targetUserId) => {
          const targetRestaurantIds = targetRatingsByUser.get(targetUserId);

          if (!targetRestaurantIds || targetRestaurantIds.size === 0) {
            results[targetUserId] = Math.floor(Math.random() * 21) + 30;
            return;
          }

          const intersection = [...userRestaurantIds].filter((id) => targetRestaurantIds.has(id));
          const union = new Set([...userRestaurantIds, ...targetRestaurantIds]);
          const jaccardSimilarity = intersection.length / union.size;

          // Simplified score (just restaurant overlap for batch)
          const matchScore = jaccardSimilarity * 100;
          const variance = Math.floor(Math.random() * 11) - 5;
          results[targetUserId] = Math.max(30, Math.min(99, Math.floor(matchScore + variance)));
        });

        return results;
      },
      () => getMockBatchPercentages(),
      { operationName: 'getBatchMatchPercentages' }
    );

    return data;
  }

  // ============================================
  // Social Methods (merged from SocialService)
  // ============================================

  /**
   * Check if a user is following another user
   * @param userId - ID of the user
   * @param targetUserId - ID of the target user
   * @returns True if user is following target
   */
  static async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('follower_id', userId)
          .eq('following_id', targetUserId)
          .returns<Pick<DbUserFollow, 'follower_id'>[]>()
          .maybeSingle();

        if (error) throw error;
        return data !== null;
      },
      () => mockFollowing.get(userId)?.has(targetUserId) || false,
      { operationName: 'isFollowing' }
    );

    return data;
  }

  /**
   * Follow a user
   * Creates a follow relationship in the database
   * @param userId - ID of the user doing the following
   * @param targetUserId - ID of the user to follow
   */
  static async followUser(userId: string, targetUserId: string): Promise<void> {
    // Prevent self-following
    if (userId === targetUserId) {
      console.warn('Cannot follow yourself');
      return;
    }

    await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { error } = await (supabase.from('user_follows') as any).insert({
          follower_id: userId,
          following_id: targetUserId,
        });

        if (error && error.code !== '23505') throw error;
      },
      () => {
        // In mock mode, update in-memory relationships
        if (!mockFollowing.has(userId)) {
          mockFollowing.set(userId, new Set());
        }
        mockFollowing.get(userId)!.add(targetUserId);
      },
      { operationName: 'followUser' }
    );
  }

  /**
   * Unfollow a user
   * Removes the follow relationship from the database
   * @param userId - ID of the user doing the unfollowing
   * @param targetUserId - ID of the user to unfollow
   */
  static async unfollowUser(userId: string, targetUserId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', targetUserId);

        if (error) throw error;
      },
      () => {
        // In mock mode, update in-memory relationships
        mockFollowing.get(userId)?.delete(targetUserId);
      },
      { operationName: 'unfollowUser' }
    );
  }

  /**
   * Get all users who follow a specific user
   * @param userId - ID of the user
   * @returns Array of follower users
   */
  static async getFollowers(userId: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get follower IDs
        const { data: follows, error: followsError } = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', userId)
          .returns<Pick<DbUserFollow, 'follower_id'>[]>();

        if (followsError) throw followsError;

        if (!follows || follows.length === 0) {
          return [];
        }

        const followerIds = follows.map((f) => f.follower_id);

        // Get user details for followers
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', followerIds)
          .returns<DbUser[]>();

        if (usersError) throw usersError;

        // Get stats for all followers
        const { data: allStats } = await supabase
          .from('user_stats')
          .select('*')
          .in('user_id', followerIds)
          .returns<DbUserStats[]>();

        const statsMap = new Map((allStats || []).map((s) => [s.user_id, s]));

        return (users || []).map((user) => mapDbToUser(user, statsMap.get(user.id)));
      },
      () => {
        // Find all users who follow this user in mock data
        const followerIds: string[] = [];
        mockFollowing.forEach((following, followerId) => {
          if (following.has(userId)) {
            followerIds.push(followerId);
          }
        });
        return mockUsers.filter((u) => followerIds.includes(u.id));
      },
      { operationName: 'getFollowers' }
    );

    return data;
  }

  /**
   * Get all users that a specific user follows
   * @param userId - ID of the user
   * @returns Array of users being followed
   */
  static async getFollowing(userId: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get following IDs
        const { data: follows, error: followsError } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId)
          .returns<Pick<DbUserFollow, 'following_id'>[]>();

        if (followsError) throw followsError;

        if (!follows || follows.length === 0) {
          return [];
        }

        const followingIds = follows.map((f) => f.following_id);

        // Get user details for following
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', followingIds)
          .returns<DbUser[]>();

        if (usersError) throw usersError;

        // Get stats for all following
        const { data: allStats } = await supabase
          .from('user_stats')
          .select('*')
          .in('user_id', followingIds)
          .returns<DbUserStats[]>();

        const statsMap = new Map((allStats || []).map((s) => [s.user_id, s]));

        return (users || []).map((user) => mapDbToUser(user, statsMap.get(user.id)));
      },
      () => {
        // Get users this user follows in mock data
        const followingIds = mockFollowing.get(userId);
        if (!followingIds || followingIds.size === 0) {
          return [];
        }
        return mockUsers.filter((u) => followingIds.has(u.id));
      },
      { operationName: 'getFollowing' }
    );

    return data;
  }

  /**
   * Get user's friends (mutual follows or following list)
   * Used for group dinner features
   * @param userId - ID of the user
   * @returns Array of friend users
   */
  static async getUserFriends(userId: string): Promise<User[]> {
    // For group dinner, return users that this user follows
    return this.getFollowing(userId);
  }

  /**
   * Get users that a user has recently dined with
   * Based on shared restaurant visits (companions field in ratings)
   * @param userId - ID of the user
   * @returns Array of recent dining companions
   */
  static async getRecentDiningCompanions(userId: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Get recent ratings with companions
        const { data: ratings, error: ratingsError } = await supabase
          .from('ratings')
          .select('companions')
          .eq('user_id', userId)
          .eq('status', 'been')
          .not('companions', 'eq', '{}')
          .order('visit_date', { ascending: false })
          .limit(20);

        if (ratingsError) throw ratingsError;

        if (!ratings || ratings.length === 0) {
          return null; // Signal to use fallback
        }

        // Extract unique companion IDs
        const companionIds = new Set<string>();
        (ratings as { companions: string[] }[]).forEach((r) => {
          (r.companions || []).forEach((id: string) => companionIds.add(id));
        });

        if (companionIds.size === 0) {
          return null;
        }

        // Get user details for companions
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', [...companionIds])
          .returns<DbUser[]>();

        if (usersError) throw usersError;

        // Get stats for companions
        const { data: allStats } = await supabase
          .from('user_stats')
          .select('*')
          .in('user_id', [...companionIds])
          .returns<DbUserStats[]>();

        const statsMap = new Map((allStats || []).map((s) => [s.user_id, s]));

        return (users || []).map((user) => mapDbToUser(user, statsMap.get(user.id)));
      },
      () => {
        // Fallback to following list in mock mode
        const followingIds = mockFollowing.get(userId);
        if (!followingIds || followingIds.size === 0) {
          return [];
        }
        return mockUsers.filter((u) => followingIds.has(u.id));
      },
      { operationName: 'getRecentDiningCompanions' }
    );

    // If null result, return following list
    if (!data || data.length === 0) {
      return this.getFollowing(userId);
    }

    return data;
  }

  /**
   * Get the count of followers for a user
   * @param userId - ID of the user
   * @returns Number of followers
   */
  static async getFollowerCount(userId: string): Promise<number> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { count, error } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);

        if (error) throw error;
        return count || 0;
      },
      () => {
        // Count users who follow this user in mock data
        let count = 0;
        mockFollowing.forEach((following) => {
          if (following.has(userId)) {
            count++;
          }
        });
        return count;
      },
      { operationName: 'getFollowerCount' }
    );

    return data;
  }

  /**
   * Get the count of users being followed
   * @param userId - ID of the user
   * @returns Number of users being followed
   */
  static async getFollowingCount(userId: string): Promise<number> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { count, error } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);

        if (error) throw error;
        return count || 0;
      },
      () => mockFollowing.get(userId)?.size || 0,
      { operationName: 'getFollowingCount' }
    );

    return data;
  }

  // ============================================
  // Leaderboard Methods (merged from LeaderboardService)
  // ============================================

  /**
   * Get leaderboard of users sorted by been_count (most visits = highest rank)
   *
   * @param city - Optional city filter
   * @param limit - Maximum number of users to return (default: 50)
   * @returns Users sorted by activity (been_count descending)
   */
  static async getLeaderboard(city?: string, limit: number = 50): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Build query - join users with user_stats view
        let query = supabase
          .from('users')
          .select(`
            *,
            user_stats!inner(
              followers_count,
              following_count,
              been_count,
              want_to_try_count,
              recommended_count
            )
          `)
          .order('user_stats(been_count)', { ascending: false })
          .limit(limit);

        // Filter by city if provided
        if (city) {
          query = query.eq('city', city);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Flatten the nested user_stats and map to User type
        type UserWithStatsRow = DbUser & { user_stats: DbUserStats | DbUserStats[] };
        const typedData = (data || []) as UserWithStatsRow[];

        return typedData.map((row, index) => {
          const stats = Array.isArray(row.user_stats) ? row.user_stats[0] : row.user_stats;
          return mapDbToLeaderboardUser(row, stats, index + 1);
        });
      },
      () => {
        // Return mock users sorted by beenCount with rank
        let users = [...mockUsers];

        if (city) {
          users = users.filter((u) => u.location?.city === city);
        }

        return users
          .sort((a, b) => (b.stats.beenCount || 0) - (a.stats.beenCount || 0))
          .slice(0, limit)
          .map((user, index) => ({
            ...user,
            stats: { ...user.stats, rank: index + 1 },
          }));
      },
      { operationName: 'getLeaderboard' }
    );

    return data;
  }

  // ============================================
  // Taste Profile Methods (merged from TasteProfileService)
  // ============================================

  /**
   * Get comprehensive taste profile for a user
   * Analyzes dining history to provide cuisine preferences, city breakdown,
   * and activity statistics.
   *
   * @param userId - ID of the user
   * @param days - Number of days to analyze for recent activity (default: 30)
   * @returns Comprehensive taste profile with breakdowns and statistics
   */
  static async getUserTasteProfile(userId: string, days: number = 30): Promise<TasteProfileStats> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        // Fetch cuisine preferences using PostgreSQL function
        const { data: cuisinePrefs, error: cuisineError } = (await (supabase.rpc as any)(
          'get_user_cuisine_preferences',
          { p_user_id: userId, p_min_visits: 1 }
        )) as { data: CuisinePreferenceRow[] | null; error: any };

        if (cuisineError) {
          console.error('Error fetching cuisine preferences:', cuisineError);
        }

        // Fetch user's visited restaurants with details
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select(
            `
            id, user_id, restaurant_id, rating, visit_date, created_at,
            restaurants!inner(id, name, cuisine, city, state, neighborhood, rating)
          `
          )
          .eq('user_id', userId)
          .eq('status', 'been');

        if (ratingsError) {
          console.error('Error fetching user ratings:', ratingsError);
        }

        // Fetch user info for primary location
        const { data: userData } = (await supabase
          .from('users')
          .select('city, state')
          .eq('id', userId)
          .single()) as { data: { city: string | null; state: string | null } | null; error: any };

        const ratings = (ratingsData || []) as unknown as RatingWithRestaurant[];

        return buildTasteProfile(ratings, cuisinePrefs || [], userData, days);
      },
      () => {
        // Mock data fallback
        const userRelations = mockUserRestaurantRelations.filter(
          (r) => r.userId === userId && r.status === 'been'
        );

        // Build mock ratings with restaurant data
        const mockRatings: RatingWithRestaurant[] = userRelations
          .map((relation) => {
            const restaurant = mockRestaurants.find((r) => r.id === relation.restaurantId);
            if (!restaurant) return null;

            return {
              id: `${relation.userId}-${relation.restaurantId}`,
              user_id: relation.userId,
              restaurant_id: relation.restaurantId,
              rating: relation.rating ?? null,
              visit_date: relation.visitDate?.toISOString() ?? null,
              created_at: relation.createdAt.toISOString(),
              restaurants: {
                id: restaurant.id,
                name: restaurant.name,
                cuisine: restaurant.cuisine,
                city: restaurant.location.city,
                state: restaurant.location.state,
                neighborhood: restaurant.location.neighborhood,
                rating: restaurant.rating,
              },
            };
          })
          .filter((r): r is RatingWithRestaurant => r !== null);

        // Build cuisine preferences from mock data
        const cuisineCountMap = new Map<string, { count: number; totalRating: number }>();
        mockRatings.forEach((r) => {
          const cuisines = r.restaurants.cuisine || [];
          cuisines.forEach((cuisine) => {
            const existing = cuisineCountMap.get(cuisine) || { count: 0, totalRating: 0 };
            existing.count++;
            existing.totalRating += r.rating || r.restaurants.rating;
            cuisineCountMap.set(cuisine, existing);
          });
        });

        const mockCuisinePrefs: CuisinePreferenceRow[] = Array.from(cuisineCountMap.entries()).map(
          ([cuisine, data]) => ({
            cuisine,
            visit_count: data.count,
            avg_rating: data.totalRating / data.count,
            max_rating: data.totalRating / data.count,
            min_rating: data.totalRating / data.count,
          })
        );

        // Get user location from mock users
        const mockUser = mockUsers.find((u) => u.id === userId);
        const userData = mockUser
          ? { city: mockUser.location?.city || 'New York', state: mockUser.location?.state || 'NY' }
          : { city: 'New York', state: 'NY' };

        return buildTasteProfile(mockRatings, mockCuisinePrefs, userData, days);
      },
      { operationName: 'getUserTasteProfile' }
    );

    return data;
  }
}

// ============================================
// Helper Types and Functions
// ============================================

// Type for the PostgreSQL function return
type CuisinePreferenceRow = Database['public']['Functions']['get_user_cuisine_preferences']['Returns'][0];

// Type for rating with restaurant data (for taste profile)
interface RatingWithRestaurant {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating: number | null;
  visit_date: string | null;
  created_at: string;
  restaurants: {
    id: string;
    name: string;
    cuisine: string[];
    city: string;
    state: string;
    neighborhood: string;
    rating: number;
  };
}

/**
 * Maps database user + stats to frontend User type for leaderboard.
 */
function mapDbToLeaderboardUser(row: DbUser, stats: DbUserStats | undefined, rank: number): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar || '',
    bio: row.bio || '',
    stats: {
      followers: stats?.followers_count ?? 0,
      following: stats?.following_count ?? 0,
      rank,
      beenCount: stats?.been_count ?? 0,
      wantToTryCount: stats?.want_to_try_count ?? 0,
      currentStreak: 0,
    },
    location: {
      city: row.city || '',
      state: row.state || '',
    },
    dietaryRestrictions: [],
    dislikedCuisines: [],
    memberSince: new Date(row.created_at),
    isTastemaker: row.is_tastemaker,
  };
}

/**
 * Build taste profile from ratings data
 * Shared between Supabase and mock data paths
 */
function buildTasteProfile(
  ratings: RatingWithRestaurant[],
  cuisinePrefs: CuisinePreferenceRow[],
  userData: { city: string | null; state: string | null } | null,
  days: number
): TasteProfileStats {
  // Early return if no data
  if (ratings.length === 0) {
    return {
      last30Days: {
        restaurantsCount: 0,
        cuisinesCount: 0,
        activityPercentile: 0,
        primaryLocation: userData?.city || 'Unknown',
      },
      cuisineBreakdown: [],
      cityBreakdown: [],
      countryBreakdown: [],
      diningLocations: [],
      totalRestaurants: 0,
      totalCities: 0,
      totalCountries: 0,
      totalCuisines: 0,
    };
  }

  // Calculate last N days stats
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const recentRatings = ratings.filter((r) => {
    const visitDate = r.visit_date ? new Date(r.visit_date) : new Date(r.created_at);
    return visitDate >= daysAgo;
  });

  const recentCuisines = new Set(recentRatings.flatMap((r) => r.restaurants.cuisine || []));

  // Build cuisine breakdown from PostgreSQL function results
  const cuisineBreakdown: CuisineBreakdown[] = (cuisinePrefs || []).map(
    (row: CuisinePreferenceRow) => ({
      cuisine: row.cuisine,
      count: Number(row.visit_count),
      avgScore: Number(row.avg_rating),
      restaurantIds: [],
    })
  );

  // Build city breakdown from ratings (client-side aggregation)
  const cityMap = new Map<
    string,
    { count: number; totalScore: number; restaurantIds: string[]; state?: string }
  >();

  ratings.forEach((r) => {
    const restaurant = r.restaurants;
    const cityKey = `${restaurant.city}, ${restaurant.state}`;
    const existingCity = cityMap.get(cityKey);

    if (existingCity) {
      existingCity.count++;
      existingCity.totalScore += r.rating || restaurant.rating;
      existingCity.restaurantIds.push(restaurant.id);
    } else {
      cityMap.set(cityKey, {
        count: 1,
        totalScore: r.rating || restaurant.rating,
        restaurantIds: [restaurant.id],
        state: restaurant.state,
      });
    }
  });

  const cityBreakdown: CityBreakdown[] = Array.from(cityMap.entries()).map(([city, data]) => ({
    city: city.split(',')[0].trim(),
    state: data.state,
    count: data.count,
    avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
    restaurantIds: data.restaurantIds,
  }));

  // Country breakdown (assume US for now)
  const countryBreakdown: CountryBreakdown[] = [
    {
      country: 'United States',
      count: ratings.length,
      avgScore: parseFloat(
        (
          ratings.reduce((sum, r) => sum + (r.rating || r.restaurants.rating), 0) / ratings.length
        ).toFixed(1)
      ),
      restaurantIds: ratings.map((r) => r.restaurant_id),
    },
  ];

  // Dining locations
  const diningLocations: DiningLocation[] = Array.from(cityMap.entries()).map(
    ([cityKey, data]) => ({
      city: cityKey.split(',')[0].trim(),
      country: 'United States',
      state: data.state,
      lat: 0,
      lng: 0,
      restaurantIds: data.restaurantIds,
    })
  );

  return {
    last30Days: {
      restaurantsCount: recentRatings.length,
      cuisinesCount: recentCuisines.size,
      activityPercentile: 96,
      primaryLocation: userData?.city || 'Unknown',
    },
    cuisineBreakdown,
    cityBreakdown,
    countryBreakdown,
    diningLocations,
    totalRestaurants: ratings.length,
    totalCities: cityMap.size,
    totalCountries: 1,
    totalCuisines: cuisineBreakdown.length,
  };
}
