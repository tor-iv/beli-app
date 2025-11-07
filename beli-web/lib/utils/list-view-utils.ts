/**
 * Utility functions for list view operations
 * Helper functions for view titles, list type checking, etc.
 */

/**
 * View type for special restaurant lists
 */
export type ViewType = 'reserve' | 'nearby' | 'trending' | 'friends' | null;

/**
 * Get display title for a view
 *
 * @param view - View type
 * @returns Human-readable title
 */
export function getViewTitle(view: ViewType): string {
  const titles: Record<NonNullable<ViewType>, string> = {
    reserve: 'Reserve Now',
    nearby: 'Recommendations Nearby',
    trending: 'Trending Restaurants',
    friends: 'Recommendations from Friends',
  };
  return view ? titles[view] : 'Your Lists';
}

/**
 * Check if a tab ID represents a special list (not user's personal lists)
 *
 * @param tabId - List type/tab identifier
 * @returns True if this is a special list
 */
export function isSpecialList(tabId: string): boolean {
  return ['trending', 'recs_for_you', 'recs_from_friends'].includes(tabId);
}

/**
 * Get appropriate empty state message for a list
 *
 * @param listType - Type of list being displayed
 * @returns Empty state message
 */
export function getEmptyStateMessage(listType: string): string {
  const messages: Record<string, string> = {
    been: "You haven't added any restaurants to your 'Been' list yet.",
    want_to_try: "You haven't added any restaurants to your 'Want to Try' list yet.",
    recommended: "You haven't recommended any restaurants yet.",
    trending: 'No trending restaurants found.',
    recs_for_you: 'No recommendations nearby at the moment.',
    recs_from_friends: "Your friends haven't made any recommendations yet.",
  };
  return messages[listType] || 'No restaurants found.';
}

/**
 * Get pluralized label for restaurant count
 *
 * @param count - Number of restaurants
 * @returns Formatted count label
 */
export function getRestaurantCountLabel(count: number): string {
  if (count === 0) return 'No restaurants';
  if (count === 1) return '1 restaurant';
  return `${count} restaurants`;
}
