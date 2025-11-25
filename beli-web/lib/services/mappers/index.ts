/**
 * Centralized Database-to-Frontend Mappers
 *
 * Single source of truth for transforming Supabase database rows
 * to frontend TypeScript types. Eliminates mapper duplication across services.
 *
 * Updated for migrations 00011-00012:
 * - Score columns removed from restaurants (rec_score, friend_score, average_score)
 * - Want-to-try uses users.watchlist array, not ratings table
 */

import type { Database } from '@/lib/supabase/types';
import type {
  User,
  Restaurant,
  UserRestaurantRelation,
  Hours,
  ListCategory,
  Review,
  FeedItem,
} from '@/types';

// ============================================
// Database Row Types (from Supabase)
// ============================================

export type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];
export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbRating = Database['public']['Tables']['ratings']['Row'];
export type DbUserStats = Database['public']['Views']['user_stats']['Row'];
export type DbMenuItem = Database['public']['Tables']['menu_items']['Row'];
export type DbUserFollow = Database['public']['Tables']['user_follows']['Row'];

// Feed item row from get_user_feed RPC
export type DbFeedItem = Database['public']['Functions']['get_user_feed']['Returns'][0];

// Rating with joined user data (for reviews)
export type DbRatingWithUser = DbRating & {
  users: DbUser;
};

// ============================================
// Restaurant Mapper
// ============================================

/**
 * Maps a Supabase restaurant row to the frontend Restaurant type.
 *
 * Note: Score columns (rec_score, friend_score, average_score) were removed
 * in migration 00012. The frontend scores object is now optional/undefined.
 * The single 'rating' column is the source of truth for restaurant score.
 */
export function mapDbToRestaurant(row: DbRestaurant): Restaurant {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine || [],
    rating: row.rating ?? 0,
    priceRange: row.price_range,
    location: {
      address: row.address,
      city: row.city,
      state: row.state,
      neighborhood: row.neighborhood,
      coordinates: {
        // PostGIS coordinates would need extraction - default to 0,0 for now
        lat: 0,
        lng: 0,
      },
    },
    hours: row.hours as unknown as Hours | undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    images: row.images || [],
    popularDishes: row.popular_dishes || [],
    popularDishImages: row.popular_dish_images || [],
    tags: row.tags || [],
    goodFor: row.good_for || [],
    category: row.category as ListCategory,
    // scores object removed - was never populated anyway
    // If needed in future, compute from ratings table
    scores: undefined,
    isOpen: row.is_open,
    acceptsReservations: row.accepts_reservations,
    ratingCount: row.rating_count,
  };
}

// ============================================
// User Mapper
// ============================================

/**
 * Maps a Supabase user row to the frontend User type.
 * Optionally includes stats from user_stats view.
 */
export function mapDbToUser(row: DbUser, stats?: DbUserStats): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar || 'https://i.pravatar.cc/150?u=default',
    bio: row.bio || '',
    stats: {
      followers: stats?.followers_count ?? 0,
      following: stats?.following_count ?? 0,
      rank: 0, // Not stored in database - computed elsewhere if needed
      beenCount: stats?.been_count ?? 0,
      wantToTryCount: stats?.want_to_try_count ?? 0,
      currentStreak: 0, // Not stored in database
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

// ============================================
// User-Restaurant Relation Mapper
// ============================================

/**
 * Maps a Supabase ratings row to the frontend UserRestaurantRelation type.
 *
 * Note: 'want_to_try' status is deprecated in ratings table.
 * Want-to-try is now stored in users.watchlist array.
 */
export function mapDbToRelation(row: DbRating): UserRestaurantRelation {
  return {
    userId: row.user_id,
    restaurantId: row.restaurant_id,
    status: row.status,
    rating: row.rating ?? undefined,
    rankIndex: row.rank_index ?? undefined,
    notes: row.notes ?? undefined,
    photos: row.photos || [],
    tags: row.tags || [],
    createdAt: new Date(row.created_at),
    visitDate: row.visit_date ? new Date(row.visit_date) : undefined,
  };
}

// ============================================
// Review Mapper
// ============================================

/**
 * Maps a rating with user data to the frontend Review type.
 */
export function mapDbToReview(row: DbRatingWithUser): Review {
  return {
    id: row.id,
    userId: row.user_id,
    restaurantId: row.restaurant_id,
    rating: row.rating ?? 0,
    content: row.notes || '',
    photos: row.photos || [],
    tags: row.tags || [],
    helpfulCount: 0, // Not stored in database
    createdAt: new Date(row.created_at),
  };
}

// ============================================
// Feed Item Mapper
// ============================================

/**
 * Maps a feed RPC result to the frontend FeedItem type.
 * Requires restaurant and user data to be joined/provided separately.
 */
export function mapDbToFeedItem(
  row: DbFeedItem,
  restaurant: Restaurant,
  user: User
): FeedItem {
  return {
    id: row.id,
    restaurant,
    user,
    rating: row.score ?? 0,
    comment: row.notes || '',
    photos: [], // Not in feed RPC result
    tags: [], // Not in feed RPC result
    timestamp: new Date(row.created_at),
    createdAt: new Date(row.created_at),
    type: mapStatusToFeedType(row.status),
  };
}

/**
 * Maps a rating status to a feed item type.
 */
function mapStatusToFeedType(
  status: 'been' | 'want_to_try' | 'recommended'
): FeedItem['type'] {
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

// ============================================
// Leaderboard User Mapper
// ============================================

/**
 * Maps a user with stats to a leaderboard entry.
 * Adds rank information to the user.
 */
export function mapDbToLeaderboardUser(
  row: DbUser,
  stats: DbUserStats,
  rank: number
): User {
  const user = mapDbToUser(row, stats);
  user.stats.rank = rank;
  return user;
}
