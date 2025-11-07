/**
 * Services Barrel Export
 *
 * Central export point for all domain services.
 * Import services from this file for easier access and better tree-shaking.
 *
 * Phase 1 Services (Independent, no cross-dependencies):
 * - NotificationService
 * - SearchHistoryService
 * - LeaderboardService
 * - ReviewService
 * - ListService
 */

// Phase 1: Independent Services
export { NotificationService } from './notifications/NotificationService';
export { SearchHistoryService } from './search/SearchHistoryService';
export { LeaderboardService } from './leaderboard/LeaderboardService';
export { ReviewService } from './reviews/ReviewService';
export { ListService } from './lists/ListService';

// Base utilities (exported for advanced use cases)
export { delay, SimpleCache, matchPercentageCache, followingRelationships } from './base/BaseService';

// Future phases will add:
// Phase 2: UserService, RestaurantService, RestaurantStatusService
// Phase 3: SocialService, UserRestaurantService, FeedService
// Phase 4: RestaurantDiscoveryService, TastemakerService, ReservationService, MenuService
// Phase 5: TasteProfileService, RankingService, GroupDinnerService
