/**
 * UserService
 *
 * Core user management including:
 * - User CRUD operations
 * - User search
 * - User statistics
 * - User match percentages (taste compatibility)
 * - Social relationships (follow/unfollow, followers/following)
 * - Leaderboard rankings
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import { mockUsers } from '../../../data/mock/users';
import { mapDbToUser, DbUser, DbUserStats } from '../mappers';
import { delay, matchPercentageCache, DEMO_USER_ID } from '../base/BaseService';
import type { User } from '../../../types';

// In-memory mock following relationships
const mockFollowing = new Map<string, Set<string>>();

// Initialize some default mock relationships
function initMockRelationships() {
  if (mockFollowing.size === 0) {
    mockFollowing.set('1', new Set(['2', '3', '4', '5', '6']));
    mockFollowing.set('2', new Set(['1', '3']));
    mockFollowing.set('3', new Set(['1', '2', '4']));
  }
}
initMockRelationships();

// Lazy import supabase
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
};

// Get current user from mock data
const getMockCurrentUser = () => mockUsers[0];

export class UserService {
  /**
   * Get the current logged-in user
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

        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', DEMO_USER_ID)
          .single();

        return mapDbToUser(user as DbUser, (stats ?? undefined) as DbUserStats | undefined);
      },
      async () => {
        await delay();
        return getMockCurrentUser();
      },
      { operationName: 'getCurrentUser' }
    );

    return data;
  }

  /**
   * Get a user by ID
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

        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        return mapDbToUser(user as DbUser, (stats ?? undefined) as DbUserStats | undefined);
      },
      async () => {
        await delay();
        return mockUsers.find((u) => u.id === userId) || null;
      },
      { operationName: 'getUserById' }
    );

    return data;
  }

  /**
   * Get a user by username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (error || !user) throw error || new Error('User not found');
        return mapDbToUser(user as DbUser);
      },
      async () => {
        await delay();
        return mockUsers.find((u) => u.username === username) || null;
      },
      { operationName: 'getUserByUsername' }
    );

    return data;
  }

  /**
   * Search users by query
   */
  static async searchUsers(query: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(20);

        if (error) throw error;
        return (data || []).map((row: DbUser) => mapDbToUser(row));
      },
      async () => {
        await delay();
        const q = query.toLowerCase();
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
   */
  static async getUserStats(userId: string): Promise<User['stats']> {
    const user = await this.getUserById(userId);
    return user?.stats || {
      followers: 0,
      following: 0,
      rank: 0,
      beenCount: 0,
      wantToTryCount: 0,
      currentStreak: 0,
    };
  }

  /**
   * Calculate match percentage between two users
   */
  static async getUserMatchPercentage(
    userId: string,
    targetUserId: string
  ): Promise<number> {
    const cacheKey = `${userId}:${targetUserId}`;
    const cached = matchPercentageCache.get(cacheKey);
    if (cached !== null) return cached;

    await delay(50);
    // Simple mock calculation
    const matchPercentage = Math.floor(Math.random() * 30) + 60; // 60-90%
    matchPercentageCache.set(cacheKey, matchPercentage);
    return matchPercentage;
  }

  /**
   * Check if current user is following another user
   */
  static async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', targetUserId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
      },
      async () => {
        await delay();
        const following = mockFollowing.get(userId);
        return following?.has(targetUserId) || false;
      },
      { operationName: 'isFollowing' }
    );

    return data;
  }

  /**
   * Follow a user
   */
  static async followUser(userId: string, targetUserId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { error } = await supabase
          .from('user_follows')
          .insert({ follower_id: userId, following_id: targetUserId });

        if (error) throw error;
      },
      async () => {
        await delay();
        const following = mockFollowing.get(userId) || new Set();
        following.add(targetUserId);
        mockFollowing.set(userId, following);
      },
      { operationName: 'followUser' }
    );
  }

  /**
   * Unfollow a user
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
      async () => {
        await delay();
        const following = mockFollowing.get(userId);
        if (following) {
          following.delete(targetUserId);
        }
      },
      { operationName: 'unfollowUser' }
    );
  }

  /**
   * Get user's followers
   */
  static async getFollowers(userId: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: follows, error } = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', userId);

        if (error) throw error;

        const followerIds = (follows || []).map((f: { follower_id: string }) => f.follower_id);
        if (followerIds.length === 0) return [];

        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', followerIds);

        if (usersError) throw usersError;
        return (users || []).map((row: DbUser) => mapDbToUser(row));
      },
      async () => {
        await delay();
        const followers: User[] = [];
        mockFollowing.forEach((following, followerId) => {
          if (following.has(userId)) {
            const user = mockUsers.find((u) => u.id === followerId);
            if (user) followers.push(user);
          }
        });
        return followers;
      },
      { operationName: 'getFollowers' }
    );

    return data;
  }

  /**
   * Get users that a user is following
   */
  static async getFollowing(userId: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data: follows, error } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId);

        if (error) throw error;

        const followingIds = (follows || []).map((f: { following_id: string }) => f.following_id);
        if (followingIds.length === 0) return [];

        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', followingIds);

        if (usersError) throw usersError;
        return (users || []).map((row: DbUser) => mapDbToUser(row));
      },
      async () => {
        await delay();
        const following = mockFollowing.get(userId);
        if (!following) return [];
        return mockUsers.filter((u) => following.has(u.id));
      },
      { operationName: 'getFollowing' }
    );

    return data;
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(city?: string, limit: number = 20): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        let query = supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: true }) // Placeholder ordering
          .limit(limit);

        if (city) {
          query = query.eq('city', city);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((row: DbUser, index: number) => {
          const user = mapDbToUser(row);
          user.stats.rank = index + 1;
          return user;
        });
      },
      async () => {
        await delay();
        let users = [...mockUsers];
        if (city) {
          users = users.filter((u) => u.location.city === city);
        }
        // Sort by been count for leaderboard
        return users
          .sort((a, b) => b.stats.beenCount - a.stats.beenCount)
          .slice(0, limit)
          .map((u, index) => ({ ...u, stats: { ...u.stats, rank: index + 1 } }));
      },
      { operationName: 'getLeaderboard' }
    );

    return data;
  }

  /**
   * Get user's friends (for group dinner feature)
   */
  static async getUserFriends(userId: string): Promise<User[]> {
    return this.getFollowing(userId);
  }
}
