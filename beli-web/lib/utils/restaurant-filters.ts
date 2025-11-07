import { Restaurant } from '@/types';
import { ListFilters } from '@/lib/stores/list-filters';

/**
 * Individual filter functions for restaurants
 * Each function returns a predicate for Array.filter()
 * Extracted for testability and reusability
 */

/**
 * Filter by category (restaurants, bars, bakeries, etc.)
 */
export const applyCategoryFilter = (category: ListFilters['category']) => (r: Restaurant): boolean => {
  if (category === 'all') return true;
  const restaurantCategory = (r.category?.toLowerCase() || 'restaurants');
  return restaurantCategory === category;
};

/**
 * Filter by city
 */
export const applyCityFilter = (cities: string[]) => (r: Restaurant): boolean => {
  if (cities.length === 0) return true;
  const city = r.location?.city || '';
  return cities.includes(city);
};

/**
 * Filter by cuisine type
 */
export const applyCuisineFilter = (cuisines: string[]) => (r: Restaurant): boolean => {
  if (cuisines.length === 0) return true;
  // Restaurant has array of cuisines, match if any overlap
  return r.cuisine.some((c) => cuisines.includes(c));
};

/**
 * Filter by price range
 */
export const applyPriceFilter = (prices: ('$' | '$$' | '$$$' | '$$$$')[]) => (r: Restaurant): boolean => {
  if (prices.length === 0) return true;
  return prices.includes(r.priceRange as '$' | '$$' | '$$$' | '$$$$');
};

/**
 * Filter by tags (chef-driven, date night, etc.)
 */
export const applyTagFilter = (tags: string[]) => (r: Restaurant): boolean => {
  if (tags.length === 0) return true;
  const restaurantTags = r.tags || [];
  return tags.some((tag) => restaurantTags.includes(tag));
};

/**
 * Filter by "good for" options (birthdays, business dinners, etc.)
 */
export const applyGoodForFilter = (goodFor: string[]) => (r: Restaurant): boolean => {
  if (goodFor.length === 0) return true;
  const restaurantGoodFor = r.goodFor || [];
  return goodFor.some((option) => restaurantGoodFor.includes(option));
};

/**
 * Filter by minimum score threshold
 */
export const applyMinScoreFilter = (minScore: number | null) => (r: Restaurant): boolean => {
  if (minScore === null) return true;
  return r.rating >= minScore;
};

/**
 * Filter by minimum number of friends who've been
 */
export const applyMinFriendsFilter = (minFriends: number | null) => (r: Restaurant): boolean => {
  if (minFriends === null) return true;
  const friendsCount = r.scores?.friendScore || 0;
  return friendsCount >= minFriends;
};

/**
 * Filter by open now status
 */
export const applyOpenNowFilter = (openNow: boolean) => (r: Restaurant): boolean => {
  if (!openNow) return true;
  return r.isOpen === true;
};

/**
 * Filter by accepts reservations
 */
export const applyReservationsFilter = (acceptsReservations: boolean) => (r: Restaurant): boolean => {
  if (!acceptsReservations) return true;
  return r.acceptsReservations === true;
};

/**
 * Filter by search query (matches name, cuisine, or neighborhood)
 */
export const applySearchFilter = (searchQuery: string) => (r: Restaurant): boolean => {
  if (!searchQuery || searchQuery.trim() === '') return true;
  const query = searchQuery.toLowerCase();

  // Search in name
  if (r.name.toLowerCase().includes(query)) return true;

  // Search in cuisines
  if (r.cuisine.some((c) => c.toLowerCase().includes(query))) return true;

  // Search in neighborhood
  if (r.location?.neighborhood?.toLowerCase().includes(query)) return true;

  return false;
};

/**
 * Apply all filters to a restaurant list
 * Chains all filter predicates together
 *
 * @param restaurants - Array of restaurants to filter
 * @param filters - Filter criteria from ListFilters store
 * @returns Filtered restaurant array
 *
 * @example
 * const filtered = applyAllFilters(restaurants, {
 *   category: 'restaurants',
 *   cities: ['New York'],
 *   minScore: 8.0,
 *   openNow: true
 * });
 */
export function applyAllFilters(
  restaurants: Restaurant[],
  filters: ListFilters
): Restaurant[] {
  return restaurants
    .filter(applyCategoryFilter(filters.category))
    .filter(applyCityFilter(filters.cities))
    .filter(applyCuisineFilter(filters.cuisines))
    .filter(applyPriceFilter(filters.prices))
    .filter(applyTagFilter(filters.tags))
    .filter(applyGoodForFilter(filters.goodFor))
    .filter(applyMinScoreFilter(filters.minScore))
    .filter(applyMinFriendsFilter(filters.minFriends))
    .filter(applyOpenNowFilter(filters.openNow))
    .filter(applyReservationsFilter(filters.acceptsReservations))
    .filter(applySearchFilter(filters.searchQuery));
}

/**
 * Sort restaurants by specified criteria
 *
 * @param restaurants - Array of restaurants to sort
 * @param sortBy - Sort criteria (rating, distance, friends)
 * @param direction - Sort direction (asc or desc)
 * @returns Sorted restaurant array
 */
export function sortRestaurants(
  restaurants: Restaurant[],
  sortBy: 'rating' | 'distance' | 'friends',
  direction: 'asc' | 'desc'
): Restaurant[] {
  const sorted = [...restaurants].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'distance':
        aValue = a.distance ?? Infinity;
        bValue = b.distance ?? Infinity;
        break;
      case 'friends':
        aValue = a.scores?.friendScore ?? 0;
        bValue = b.scores?.friendScore ?? 0;
        break;
      default:
        return 0;
    }

    const comparison = aValue - bValue;
    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
