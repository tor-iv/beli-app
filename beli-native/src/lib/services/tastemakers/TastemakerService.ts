/**
 * TastemakerService
 *
 * Manages tastemaker profiles and content including:
 * - Tastemaker discovery
 * - Posts and articles
 * - Following/engagement
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import { mockTastemakers, tastemakerBadges } from '../../../data/mock/tastemakers';
import { mockTastemakerPosts } from '../../../data/mock/tastemakerPosts';
import { delay } from '../base/BaseService';
import type { User, TastemakerBadge, TastemakerPost } from '../../../types';

// Lazy import supabase
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
};

export class TastemakerService {
  /**
   * Get all tastemakers
   */
  static async getAllTastemakers(): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('is_tastemaker', true)
          .order('stats->followers', { ascending: false });

        if (error) throw error;
        return data as unknown as User[];
      },
      async () => {
        await delay();
        return [...mockTastemakers].sort(
          (a, b) => (b.stats.followers || 0) - (a.stats.followers || 0)
        );
      },
      { operationName: 'getAllTastemakers' }
    );

    return data;
  }

  /**
   * Get a tastemaker by ID
   */
  static async getTastemakerById(id: string): Promise<User | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .eq('is_tastemaker', true)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as unknown as User | null;
      },
      async () => {
        await delay();
        return mockTastemakers.find((tm) => tm.id === id) || null;
      },
      { operationName: 'getTastemakerById' }
    );

    return data;
  }

  /**
   * Get tastemakers by specialty
   */
  static async getTastemakersBySpecialty(specialty: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('is_tastemaker', true)
          .ilike('tastemaker_profile->specialty', `%${specialty}%`);

        if (error) throw error;
        return data as unknown as User[];
      },
      async () => {
        await delay();
        return mockTastemakers.filter((tm) =>
          tm.tastemakerProfile?.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
      },
      { operationName: 'getTastemakersBySpecialty' }
    );

    return data;
  }

  /**
   * Search tastemakers
   */
  static async searchTastemakers(query: string): Promise<User[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('is_tastemaker', true)
          .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
          .limit(20);

        if (error) throw error;
        return data as unknown as User[];
      },
      async () => {
        await delay();
        const lowerQuery = query.toLowerCase();
        return mockTastemakers.filter(
          (tm) =>
            tm.displayName.toLowerCase().includes(lowerQuery) ||
            tm.username.toLowerCase().includes(lowerQuery) ||
            tm.tastemakerProfile?.specialty.toLowerCase().includes(lowerQuery)
        );
      },
      { operationName: 'searchTastemakers' }
    );

    return data;
  }

  /**
   * Get all tastemaker posts
   */
  static async getAllPosts(): Promise<TastemakerPost[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('tastemaker_posts')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;
        return data as unknown as TastemakerPost[];
      },
      async () => {
        await delay();
        return [...mockTastemakerPosts].sort(
          (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
        );
      },
      { operationName: 'getAllPosts' }
    );

    return data;
  }

  /**
   * Get posts by a specific tastemaker
   */
  static async getPostsByTastemaker(tastmakerId: string): Promise<TastemakerPost[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('tastemaker_posts')
          .select('*')
          .eq('user_id', tastmakerId)
          .order('published_at', { ascending: false });

        if (error) throw error;
        return data as unknown as TastemakerPost[];
      },
      async () => {
        await delay();
        return mockTastemakerPosts
          .filter((post) => post.userId === tastmakerId)
          .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      },
      { operationName: 'getPostsByTastemaker' }
    );

    return data;
  }

  /**
   * Get a specific post by ID
   */
  static async getPostById(postId: string): Promise<TastemakerPost | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('tastemaker_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as unknown as TastemakerPost | null;
      },
      async () => {
        await delay();
        return mockTastemakerPosts.find((post) => post.id === postId) || null;
      },
      { operationName: 'getPostById' }
    );

    return data;
  }

  /**
   * Get featured tastemakers (top by followers)
   */
  static async getFeaturedTastemakers(limit: number = 5): Promise<User[]> {
    const allTastemakers = await this.getAllTastemakers();
    return allTastemakers.slice(0, limit);
  }

  /**
   * Get all available badges
   */
  static getBadges(): Record<string, TastemakerBadge> {
    return tastemakerBadges;
  }

  /**
   * Get trending posts
   */
  static async getTrendingPosts(limit: number = 10): Promise<TastemakerPost[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('tastemaker_posts')
          .select('*')
          .order('interactions->likes', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data as unknown as TastemakerPost[];
      },
      async () => {
        await delay();
        return [...mockTastemakerPosts]
          .sort((a, b) => b.interactions.likes.length - a.interactions.likes.length)
          .slice(0, limit);
      },
      { operationName: 'getTrendingPosts' }
    );

    return data;
  }

  /**
   * Like a post
   */
  static async likePost(postId: string, userId: string): Promise<void> {
    await withFallback(
      async () => {
        // Supabase implementation
        throw new Error('Not implemented');
      },
      async () => {
        await delay();
        const post = mockTastemakerPosts.find((p) => p.id === postId);
        if (post && !post.interactions.likes.includes(userId)) {
          post.interactions.likes.push(userId);
        }
      },
      { operationName: 'likePost' }
    );
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId: string, userId: string): Promise<void> {
    await withFallback(
      async () => {
        // Supabase implementation
        throw new Error('Not implemented');
      },
      async () => {
        await delay();
        const post = mockTastemakerPosts.find((p) => p.id === postId);
        if (post) {
          post.interactions.likes = post.interactions.likes.filter((id) => id !== userId);
        }
      },
      { operationName: 'unlikePost' }
    );
  }
}
