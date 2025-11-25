/**
 * Centralized Database-to-Frontend Mappers
 *
 * Single source of truth for transforming Supabase database rows
 * to frontend TypeScript types. Eliminates mapper duplication across services.
 *
 * Ported from beli-web/lib/services/mappers/index.ts
 */

import type {
  User,
  Restaurant,
  UserRestaurantRelation,
  Hours,
  ListCategory,
  Review,
  FeedItem,
} from '../../../types';

// ============================================
// Database Row Types (generic until we generate Supabase types)
// ============================================

export interface DbRestaurant {
  id: string;
  name: string;
  cuisine: string[] | null;
  rating: number | null;
  price_range: string;
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  hours: unknown;
  phone: string | null;
  website: string | null;
  images: string[] | null;
  popular_dishes: string[] | null;
  popular_dish_images: string[] | null;
  tags: string[] | null;
  good_for: string[] | null;
  category: string;
  is_open: boolean | null;
  accepts_reservations: boolean | null;
  rating_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  is_tastemaker: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbUserStats {
  user_id: string;
  followers_count: number;
  following_count: number;
  been_count: number;
  want_to_try_count: number;
}

export interface DbRating {
  id: string;
  user_id: string;
  restaurant_id: string;
  status: 'been' | 'want_to_try' | 'recommended';
  rating: number | null;
  rank_index: number | null;
  notes: string | null;
  photos: string[] | null;
  tags: string[] | null;
  visit_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRatingWithUser extends DbRating {
  users: DbUser;
}

export interface DbFeedItem {
  id: string;
  user_id: string;
  restaurant_id: string;
  status: 'been' | 'want_to_try' | 'recommended';
  score: number | null;
  notes: string | null;
  created_at: string;
}

// ============================================
// Restaurant Mapper
// ============================================

/**
 * Maps a Supabase restaurant row to the frontend Restaurant type.
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
        lat: 0,
        lng: 0,
      },
    },
    hours: row.hours as unknown as Hours,
    phone: row.phone ?? '',
    website: row.website ?? undefined,
    images: row.images || [],
    popularDishes: row.popular_dishes || [],
    popularDishImages: row.popular_dish_images || [],
    tags: row.tags || [],
    category: row.category as ListCategory,
    scores: undefined,
    isOpen: row.is_open ?? undefined,
    acceptsReservations: row.accepts_reservations ?? undefined,
    ratingCount: row.rating_count ?? undefined,
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
      rank: 0,
      beenCount: stats?.been_count ?? 0,
      wantToTryCount: stats?.want_to_try_count ?? 0,
      currentStreak: 0,
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
    helpfulCount: 0,
    createdAt: new Date(row.created_at),
  };
}

// ============================================
// Feed Item Mapper
// ============================================

/**
 * Maps a feed RPC result to the frontend FeedItem type.
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
    photos: [],
    tags: [],
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
