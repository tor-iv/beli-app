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
 *
 * Phase 2 Services (Foundation services):
 * - UserService
 * - SocialService
 * - RestaurantService
 * - RestaurantStatusService
 *
 * Phase 3 Services (Relationship & Feed):
 * - UserRestaurantService
 * - FeedService
 * - FeedInteractionService
 *
 * Phase 4 Services (Tastemaker, Reservation & Menu):
 * - TastemakerService
 * - TastemakerPostService
 * - ReservationService
 * - MenuService
 *
 * Phase 5 Services (Taste Profile, Ranking & Group Dinner):
 * - TasteProfileService
 * - RankingService
 * - GroupDinnerService
 */

// Phase 1: Independent Services
export { NotificationService } from './notifications/NotificationService';
export { SearchHistoryService } from './search/SearchHistoryService';
export { LeaderboardService } from './leaderboard/LeaderboardService';
export { ReviewService } from './reviews/ReviewService';
export { ListService } from './lists/ListService';

// Phase 2: Foundation Services
export { UserService } from './users/UserService';
export { SocialService } from './users/SocialService';
export { RestaurantService } from './restaurants/RestaurantService';
export { RestaurantStatusService } from './restaurants/RestaurantStatusService';

// Phase 3: Relationship & Feed Services
export { UserRestaurantService } from './user-restaurant/UserRestaurantService';
export { FeedService } from './feed/FeedService';
export { FeedInteractionService } from './feed/FeedInteractionService';

// Phase 4: Tastemaker, Reservation & Menu Services
export { TastemakerService } from './tastemakers/TastemakerService';
export { TastemakerPostService } from './tastemakers/TastemakerPostService';
export { ReservationService } from './reservations/ReservationService';
export { MenuService } from './menu/MenuService';

// Phase 5: Taste Profile, Ranking & Group Dinner Services
export { TasteProfileService } from './taste-profile/TasteProfileService';
export { RankingService } from './ranking/RankingService';
export { GroupDinnerService } from './group-dinner/GroupDinnerService';

// Base utilities (exported for advanced use cases)
export { delay, SimpleCache, matchPercentageCache, followingRelationships } from './base/BaseService';
