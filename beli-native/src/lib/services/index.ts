/**
 * Services Barrel Export
 *
 * Central export point for all domain services.
 * Import services from here for cleaner imports:
 *
 * import { RestaurantService, UserService, FeedService } from '@/lib/services';
 */

// Core Services
export { RestaurantService } from './restaurants/RestaurantService';
export { UserService } from './users/UserService';
export { FeedService } from './feed/FeedService';
export { ListService } from './lists/ListService';
export { UserRestaurantService } from './user-restaurant/UserRestaurantService';
export { TastemakerService } from './tastemakers/TastemakerService';
export { GroupDinnerService } from './group-dinner/GroupDinnerService';
export { MenuService } from './menu/MenuService';
export { NotificationService } from './notifications/NotificationService';

// Re-export base utilities
export { delay, SimpleCache, matchPercentageCache, DEMO_USER_ID } from './base/BaseService';

// Re-export mappers
export * from './mappers';

// Re-export service types
export type { WhatToOrderParams, WhatToOrderResult } from './menu/MenuService';
export type {
  GroupDinnerSession,
  GroupParticipant,
  GroupSuggestion,
  GroupMatch,
} from './group-dinner/GroupDinnerService';
export type { Notification } from './notifications/NotificationService';
