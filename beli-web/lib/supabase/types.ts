/**
 * Supabase Database Types
 *
 * These types mirror the PostgreSQL schema for type-safe queries.
 * Updated for migrations 00011-00012 (unified watchlist, removed score columns).
 *
 * IMPORTANT STORAGE PATTERNS:
 * - Want-to-try list: Use users.watchlist array (NOT ratings table)
 * - Been list: Use ratings table with status='been'
 * - Recommendations: Computed via get_friend_recommendations() RPC
 * - Restaurant score: Single 'rating' column (triple-score removed for simplicity)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          cuisine: string[];
          category: 'restaurants' | 'coffee' | 'bars' | 'bakeries';
          price_range: '$' | '$$' | '$$$' | '$$$$';
          address: string;
          city: string;
          state: string;
          neighborhood: string;
          coordinates: unknown; // PostGIS geography point
          hours: Json;
          phone: string | null;
          website: string | null;
          images: string[];
          popular_dish_images: string[];
          tags: string[];
          popular_dishes: string[];
          good_for: string[];
          is_open: boolean;
          accepts_reservations: boolean;
          rating: number;
          rating_count: number;
          // NOTE: rec_score, friend_score, average_score columns removed in migration 00012
          // Single 'rating' column is now the source of truth for restaurant score
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['restaurants']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar: string | null;
          bio: string | null;
          city: string | null;
          state: string | null;
          is_tastemaker: boolean;
          watchlist: string[]; // Restaurant IDs user wants to try - SINGLE SOURCE OF TRUTH for want-to-try list
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'id' | 'created_at' | 'updated_at' | 'watchlist'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          watchlist?: string[];
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          // NOTE: 'want_to_try' status is DEPRECATED - use users.watchlist array instead
          // Only 'been' and 'recommended' should be stored in ratings table
          status: 'been' | 'want_to_try' | 'recommended';
          rating: number | null;
          rank_index: number | null;
          notes: string | null;
          photos: string[];
          tags: string[];
          visit_date: string | null;
          companions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['ratings']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
      };
      user_follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_follows']['Insert']>;
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          price: number | null;
          category: string | null;
          is_popular: boolean;
          dietary_info: string[];
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['menu_items']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
    };
    Views: {
      user_stats: {
        Row: {
          user_id: string;
          username: string;
          display_name: string;
          followers_count: number;
          following_count: number;
          been_count: number;
          want_to_try_count: number;
          recommended_count: number;
        };
      };
    };
    Functions: {
      get_user_feed: {
        Args: {
          p_user_id: string;
          p_limit?: number;
        };
        Returns: {
          id: string;
          user_id: string;
          username: string;
          display_name: string;
          avatar: string | null;
          restaurant_id: string;
          restaurant_name: string;
          restaurant_cuisine: string[];
          restaurant_neighborhood: string;
          status: 'been' | 'want_to_try' | 'recommended';
          score: number | null;
          notes: string | null;
          visit_date: string | null;
          created_at: string;
        }[];
      };
      add_to_watchlist: {
        Args: {
          p_user_id: string;
          p_restaurant_id: string;
        };
        Returns: boolean;
      };
      remove_from_watchlist: {
        Args: {
          p_user_id: string;
          p_restaurant_id: string;
        };
        Returns: boolean;
      };
      is_in_watchlist: {
        Args: {
          p_user_id: string;
          p_restaurant_id: string;
        };
        Returns: boolean;
      };
      get_friend_recommendations: {
        Args: {
          p_user_id: string;
          p_min_rating?: number;
          p_limit?: number;
        };
        Returns: {
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
        }[];
      };
      get_user_cuisine_preferences: {
        Args: {
          p_user_id: string;
          p_min_visits?: number;
        };
        Returns: {
          cuisine: string;
          visit_count: number;
          avg_rating: number;
          max_rating: number;
          min_rating: number;
        }[];
      };
    };
  };
};

// Convenience types for common usage
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Rating = Database['public']['Tables']['ratings']['Row'];
export type UserFollow = Database['public']['Tables']['user_follows']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type UserStats = Database['public']['Views']['user_stats']['Row'];
export type FeedItem = Database['public']['Functions']['get_user_feed']['Returns'][0];
export type FriendRecommendation = Database['public']['Functions']['get_friend_recommendations']['Returns'][0];
export type CuisinePreference = Database['public']['Functions']['get_user_cuisine_preferences']['Returns'][0];
