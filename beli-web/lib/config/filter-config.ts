import { ListFilters } from '@/lib/stores/list-filters';
import {
  CITIES,
  CUISINES,
  TAGS,
  GOOD_FOR,
  SCORE_THRESHOLDS,
  FRIEND_THRESHOLDS,
} from '@/lib/stores/list-filters';

/**
 * Filter section display types
 * - searchable-list: Searchable checkbox list (cities, cuisines)
 * - button-grid: Grid of toggle buttons (tags, good-for)
 * - button-row: Row of toggle buttons (price, score, friends)
 * - custom: Custom content (switches, special cases)
 */
export type FilterSectionType = 'searchable-list' | 'button-grid' | 'button-row' | 'custom';

/**
 * Configuration for a single filter section in the filter modal
 */
export interface FilterConfig {
  /** Unique identifier for the section */
  id: string;
  /** Display title for the accordion */
  title: string;
  /** Type of filter UI to display */
  type: FilterSectionType;
  /** List of items for selection (not used for custom type) */
  items?: readonly string[] | readonly { value: number | null; label: string }[];
  /** Whether the list should include a search input */
  searchable?: boolean;
  /** Number of columns for button-grid type (default: 2) */
  gridCols?: number;
  /** Key in the ListFilters store for this filter */
  storeKey?: keyof ListFilters;
  /** Whether this is a single-select filter (for threshold filters) */
  singleSelect?: boolean;
  /** Function to get the count of selected items */
  getSelectedCount?: (filters: ListFilters) => number;
  /** Function to get a label for selected items */
  getSelectedLabel?: (filters: ListFilters) => string;
}

/**
 * Configuration-driven filter section definitions
 * Makes adding/removing/modifying filters trivial - just update this config
 *
 * @example
 * // To add a new filter, simply add to this array:
 * {
 *   id: 'dietary',
 *   title: 'Dietary Restrictions',
 *   type: 'button-grid',
 *   items: DIETARY_OPTIONS,
 *   gridCols: 2,
 *   storeKey: 'dietary',
 *   getSelectedCount: (f) => f.dietary.length,
 * }
 */
export const FILTER_SECTIONS: FilterConfig[] = [
  {
    id: 'cities',
    title: 'Cities',
    type: 'searchable-list',
    items: CITIES,
    searchable: true,
    storeKey: 'cities',
    getSelectedCount: (f) => f.cities.length,
  },
  {
    id: 'cuisines',
    title: 'Cuisines',
    type: 'searchable-list',
    items: CUISINES,
    searchable: true,
    storeKey: 'cuisines',
    getSelectedCount: (f) => f.cuisines.length,
  },
  {
    id: 'price',
    title: 'Price',
    type: 'button-row',
    items: ['$', '$$', '$$$', '$$$$'] as const,
    storeKey: 'prices',
    getSelectedLabel: (f) => f.prices.length > 0 ? f.prices.join(', ') : '',
  },
  {
    id: 'tags',
    title: 'Tags',
    type: 'button-grid',
    items: TAGS,
    gridCols: 2,
    storeKey: 'tags',
    getSelectedCount: (f) => f.tags.length,
  },
  {
    id: 'goodFor',
    title: 'Good For',
    type: 'button-grid',
    items: GOOD_FOR,
    gridCols: 2,
    storeKey: 'goodFor',
    getSelectedCount: (f) => f.goodFor.length,
  },
  {
    id: 'score',
    title: 'Minimum Score',
    type: 'button-row',
    items: SCORE_THRESHOLDS,
    storeKey: 'minScore',
    singleSelect: true,
    getSelectedLabel: (f) => f.minScore !== null ? `${f.minScore}+` : '',
  },
  {
    id: 'friends',
    title: 'Minimum Friends',
    type: 'button-row',
    items: FRIEND_THRESHOLDS,
    storeKey: 'minFriends',
    singleSelect: true,
    getSelectedLabel: (f) => f.minFriends !== null ? `${f.minFriends}+` : '',
  },
  {
    id: 'other',
    title: 'Other',
    type: 'custom',
    // Custom content will be handled separately in FilterModal
  },
];
