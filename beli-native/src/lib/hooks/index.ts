/**
 * Hooks Barrel Export
 *
 * Central export point for all React Query hooks.
 * Import hooks from here for cleaner imports:
 *
 * import { useRestaurants, useCurrentUser, useFeed } from '@/lib/hooks';
 */

// Restaurant hooks
export {
  useRestaurants,
  useRestaurant,
  useSearchRestaurants,
  useTrendingRestaurants,
  useRandomRestaurants,
  useRestaurantRecommendations,
  useRestaurantsByIds,
  useRestaurantsWithStatus,
} from './use-restaurants';

// User hooks
export {
  useCurrentUser,
  useUser,
  useUserByUsername,
  useSearchUsers,
  useUserStats,
  useMatchPercentage,
  useIsFollowing,
  useFollowUser,
  useUnfollowUser,
  useFollowers,
  useFollowing,
  useLeaderboard,
  useUserFriends,
} from './use-user';

// Network status hooks
export {
  useNetworkStatus,
  useIsOnline,
  usePendingMutations,
} from './use-network-status';

// Feed hooks
export {
  useFeed,
  useUserActivities,
  useLikeActivity,
  useUnlikeActivity,
  useBookmarkActivity,
  useUnbookmarkActivity,
  useAddComment,
  useIsActivityLiked,
  useIsActivityBookmarked,
} from './use-feed';

// List hooks
export {
  useUserLists,
  useUserListsByType,
  useList,
  useFeaturedLists,
  useListProgress,
  usePublicLists,
  useListCounts,
  useCreateList,
  useAddToList,
  useRemoveFromList,
  useDeleteList,
  useUpdateList,
} from './use-lists';

// User-Restaurant hooks
export {
  useUserRelations,
  useRestaurantRelation,
  useBeenRestaurants,
  useWantToTryRestaurants,
  useMarkAsBeen,
  useMarkAsWantToTry,
  useUpdateRating,
  useRemoveRelation,
  useUserAverageRating,
  useRestaurantsByTag,
} from './use-user-restaurant';

// Tastemaker hooks
export {
  useTastemakers,
  useTastemaker,
  useTastemakersBySpecialty,
  useSearchTastemakers,
  useFeaturedTastemakers,
  useTastemakerPosts,
  useTastemakerPostsByAuthor,
  useTastemakerPost,
  useTrendingPosts,
  useLikeTastemakerPost,
  useUnlikeTastemakerPost,
} from './use-tastemakers';

// Menu hooks
export {
  useMenuItems,
  useMenuItem,
  useMenuItemsByCategory,
  usePopularMenuItems,
  useSignatureDishes,
  useWhatToOrder,
  useSearchMenuItems,
  useHasMenu,
  useRestaurantsWithMenus,
} from './use-menu';

// Group Dinner hooks
export {
  useGroupDinnerSession,
  useGroupSuggestions,
  useGroupTopMatches,
  useSuggestedFriends,
  createParticipant,
} from './use-group-dinner';

// Notification hooks
export {
  useNotifications,
  useUnreadCount,
  useUnreadNotifications,
  useNotificationsByType,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from './use-notifications';

// Re-export hook types
export type { WhatToOrderParams, WhatToOrderResult } from './use-menu';
export type {
  GroupDinnerSession,
  GroupParticipant,
  GroupSuggestion,
  GroupMatch,
} from './use-group-dinner';
export type { Notification } from './use-notifications';
