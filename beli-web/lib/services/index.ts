/**
 * Services Barrel Export
 *
 * Central export point for all domain services.
 * Import services from this file for easier access and better tree-shaking.
 *
 * Consolidated Services (9 total, reduced from 21):
 *
 * Core Services:
 * - UserService - User CRUD, stats, match %, social (follows/friends), leaderboard, taste profile
 * - RestaurantService - Restaurant CRUD, search, trending, recommendations, status/hours
 * - UserRestaurantService - User-restaurant relations, watchlist, friend recs, ranking, reviews
 *
 * Feed & Content:
 * - FeedService - Activity feed, feed interactions (likes/bookmarks/comments)
 * - TastemakerService - Tastemaker profiles, posts, post interactions
 *
 * Features:
 * - GroupDinnerService - Group dining matching, reservations
 * - ListService - User lists management
 * - MenuService - Restaurant menus
 * - NotificationService - User notifications
 *
 * @see /docs/search-provider-plan.md for architecture documentation
 */

// Core Services
export { UserService } from './users/UserService';
export { RestaurantService } from './restaurants/RestaurantService';
export { UserRestaurantService, type FriendRecommendation, type Review } from './user-restaurant/UserRestaurantService';

// Feed & Content Services
export { FeedService } from './feed/FeedService';
export { TastemakerService } from './tastemakers/TastemakerService';

// Feature Services
export { GroupDinnerService } from './group-dinner/GroupDinnerService';
export { ListService } from './lists/ListService';
export { MenuService } from './menu/MenuService';
export { NotificationService } from './notifications/NotificationService';

// Utility Services (kept separate for simplicity)
export { SearchHistoryService } from './search/SearchHistoryService';

// Centralized mappers
export {
  mapDbToRestaurant,
  mapDbToUser,
  mapDbToRelation,
  mapDbToReview,
  mapDbToFeedItem,
  mapDbToLeaderboardUser,
  type DbRestaurant,
  type DbUser,
  type DbRating,
  type DbUserStats,
  type DbUserFollow,
} from './mappers';

// Base utilities (exported for advanced use cases)
export {
  delay,
  SimpleCache,
  matchPercentageCache,
  followingRelationships,
} from './base/BaseService';

// ============================================
// DEPRECATED: These exports maintain backward compatibility
// but redirect to consolidated services. Remove after migration.
// ============================================

// SocialService functionality is now in UserService
// import { UserService } from '@/lib/services'; then use UserService.isFollowing(), etc.
export { UserService as SocialService } from './users/UserService';

// LeaderboardService functionality is now in UserService
// import { UserService } from '@/lib/services'; then use UserService.getLeaderboard()
export { UserService as LeaderboardService } from './users/UserService';

// TasteProfileService functionality is now in UserService
// import { UserService } from '@/lib/services'; then use UserService.getUserTasteProfile()
export { UserService as TasteProfileService } from './users/UserService';

// RestaurantStatusService functionality is now in RestaurantService
// import { RestaurantService } from '@/lib/services'; then use RestaurantService.isRestaurantOpen(), etc.
export { RestaurantService as RestaurantStatusService } from './restaurants/RestaurantService';

// FeedInteractionService functionality is now in FeedService
// import { FeedService } from '@/lib/services'; then use FeedService.likeActivity(), etc.
export { FeedService as FeedInteractionService } from './feed/FeedService';

// TastemakerPostService functionality is now in TastemakerService
// import { TastemakerService } from '@/lib/services'; then use TastemakerService.getTastemakerPosts(), etc.
export { TastemakerService as TastemakerPostService } from './tastemakers/TastemakerService';

// ReservationService functionality is now in GroupDinnerService
// import { GroupDinnerService } from '@/lib/services'; then use GroupDinnerService.getUserReservations(), etc.
export { GroupDinnerService as ReservationService } from './group-dinner/GroupDinnerService';

// RankingService functionality is now in UserRestaurantService
// import { UserRestaurantService } from '@/lib/services'; then use UserRestaurantService.getRankedRestaurants(), etc.
export { UserRestaurantService as RankingService } from './user-restaurant/UserRestaurantService';

// ReviewService functionality is now in UserRestaurantService
// import { UserRestaurantService } from '@/lib/services'; then use UserRestaurantService.getRestaurantReviews(), etc.
export { UserRestaurantService as ReviewService } from './user-restaurant/UserRestaurantService';
