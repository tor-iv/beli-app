import { useMemo } from 'react';
import { Activity } from '@/types';

/**
 * Feed filter options
 */
export interface FeedFilters {
  /** Show only review/ranking activities */
  rankingsOnly: boolean;
  /** Show only top-rated reviews (9.0+) */
  topRatedOnly: boolean;
  /** Show only restaurant activities (exclude bars, bakeries, etc.) */
  restaurantsOnly: boolean;
}

/**
 * Hook for applying filters to feed data
 * Extracted for testability and reusability across feed-related components
 *
 * @param feed - Array of activity items to filter
 * @param filters - Filter criteria to apply
 * @returns Filtered activity array
 *
 * @example
 * const { data: feed } = useFeed();
 * const [filters, setFilters] = useState({ rankingsOnly: false, topRatedOnly: false, restaurantsOnly: false });
 * const filteredFeed = useFeedFilters(feed, filters);
 */
export function useFeedFilters(feed: Activity[], filters: FeedFilters): Activity[] {
  return useMemo(() => {
    return feed.filter((item) => {
      // Filter 1: Rankings only (exclude non-review activities)
      if (filters.rankingsOnly && item.type !== 'review') {
        return false;
      }

      // Filter 2: Top rated only (9.0+ ratings)
      if (filters.topRatedOnly && item.type === 'review') {
        const rating = item.rating;
        if (!rating || rating < 9.0) {
          return false;
        }
      }

      // Filter 3: Restaurants only (exclude bars, bakeries, coffee shops)
      if (filters.restaurantsOnly && item.type === 'review') {
        // TODO: Check if restaurant is actually a restaurant (not bar/bakery)
        // This requires restaurant.category field implementation
        // For now, we'll keep all reviews
      }

      return true;
    });
  }, [feed, filters]);
}
