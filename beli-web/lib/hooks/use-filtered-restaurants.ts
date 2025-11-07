import { useMemo } from 'react';

import { applyAllFilters, sortRestaurants } from '@/lib/utils/restaurant-filters';

import type { ListFilters } from '@/lib/stores/list-filters';
import type { Restaurant } from '@/types';

/**
 * Hook that applies all filters and sorting to a restaurant list
 * Separates filtering concern from component rendering logic
 * Memoized for performance - only recalculates when inputs change
 *
 * @param restaurants - Array of restaurants to filter
 * @param filters - Filter criteria from ListFilters store
 * @returns Filtered and sorted restaurant array
 *
 * @example
 * const filters = useListFilters();
 * const { data: restaurants } = useRestaurants();
 * const filteredRestaurants = useFilteredRestaurants(restaurants || [], filters);
 *
 * // Results are automatically updated when filters change
 * // Memoization ensures expensive filtering only runs when necessary
 */
export function useFilteredRestaurants(
  restaurants: Restaurant[],
  filters: ListFilters
): Restaurant[] {
  return useMemo(() => {
    // Step 1: Apply all filter predicates
    const filtered = applyAllFilters(restaurants, filters);

    // Step 2: Apply sorting
    const sorted = sortRestaurants(filtered, filters.sortBy, filters.sortDirection);

    return sorted;
  }, [restaurants, filters]);
}
