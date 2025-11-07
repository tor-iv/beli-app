import { useMemo } from 'react';
import { Restaurant } from '@/types';
import {
  useRestaurants,
  useTrendingRestaurants,
  useNearbyRecommendations,
  useFriendRecommendations,
} from './use-restaurants';
import { useReservableRestaurants } from './use-special-lists';
import { useLists } from './use-lists';
import { ViewType } from '@/lib/utils/list-view-utils';
import { ListType } from './use-lists-reducer';

/**
 * Data source type for restaurant lists
 */
type DataSource = 'reservable' | 'nearby' | 'trending' | 'friends' | 'lists';

/**
 * Result from useRestaurantListData hook
 */
export interface RestaurantListDataResult {
  /** Array of restaurants for current view/tab */
  restaurants: Restaurant[];
  /** Whether data is currently loading */
  isLoading: boolean;
}

/**
 * Unified hook for fetching restaurant data based on view and tab selection
 * Consolidates 8 separate conditional React Query hooks into intelligent data fetching
 * Dramatically simplifies the lists page component
 *
 * Priority order:
 * 1. URL view parameter (reserve, nearby, trending, friends)
 * 2. Special list tabs (trending, recs_for_you, recs_from_friends)
 * 3. Default: user's personal lists (been, want_to_try, recommended)
 *
 * @param viewParam - URL parameter for special views
 * @param activeTab - Current active tab
 * @returns Restaurant list and loading state
 *
 * @example
 * const searchParams = useSearchParams();
 * const viewParam = searchParams.get('view') as ViewType;
 * const [activeTab] = useState('been');
 *
 * const { restaurants, isLoading } = useRestaurantListData(viewParam, activeTab);
 */
export function useRestaurantListData(
  viewParam: ViewType,
  activeTab: ListType
): RestaurantListDataResult {
  // Determine which data source to use based on current state
  const dataSource: DataSource = useMemo(() => {
    // Priority 1: URL view parameter overrides tab selection
    if (viewParam === 'reserve') return 'reservable';
    if (viewParam === 'nearby') return 'nearby';
    if (viewParam === 'trending') return 'trending';
    if (viewParam === 'friends') return 'friends';

    // Priority 2: Special list tabs (when not in a URL view)
    if (activeTab === 'trending') return 'trending';
    if (activeTab === 'recs_for_you') return 'nearby';
    if (activeTab === 'recs_from_friends') return 'friends';

    // Priority 3: Default to user's lists
    return 'lists';
  }, [viewParam, activeTab]);

  // Fetch data from appropriate source (conditionally enabled)
  const { data: reservableRestaurants, isLoading: loadingReservable } = useReservableRestaurants(20, {
    enabled: dataSource === 'reservable',
  });
  const { data: nearbyRestaurants, isLoading: loadingNearby } = useNearbyRecommendations(
    'current-user',
    2.0,
    20,
    { enabled: dataSource === 'nearby' }
  );
  const { data: trendingRestaurants, isLoading: loadingTrending } = useTrendingRestaurants({
    enabled: dataSource === 'trending',
  });
  const { data: friendRestaurants, isLoading: loadingFriends } = useFriendRecommendations(
    'current-user',
    20,
    { enabled: dataSource === 'friends' }
  );

  // For user's lists, fetch all restaurants and lists
  const { data: allRestaurants } = useRestaurants();
  const { data: lists } = useLists();

  // Return the appropriate data based on data source
  return useMemo(() => {
    switch (dataSource) {
      case 'reservable':
        return {
          restaurants: reservableRestaurants || [],
          isLoading: loadingReservable,
        };

      case 'nearby':
        return {
          restaurants: nearbyRestaurants || [],
          isLoading: loadingNearby,
        };

      case 'trending':
        return {
          restaurants: trendingRestaurants || [],
          isLoading: loadingTrending,
        };

      case 'friends':
        return {
          restaurants: friendRestaurants || [],
          isLoading: loadingFriends,
        };

      case 'lists':
      default:
        // Filter lists by active tab type
        const filteredLists = lists?.filter((list) => list.listType === activeTab) || [];

        // Get all restaurant IDs from filtered lists
        const restaurantIds = new Set(filteredLists.flatMap((list) => list.restaurants));

        // Get full restaurant objects
        const restaurants = allRestaurants?.filter((r) => restaurantIds.has(r.id)) || [];

        return {
          restaurants,
          isLoading: false,
        };
    }
  }, [
    dataSource,
    reservableRestaurants,
    loadingReservable,
    nearbyRestaurants,
    loadingNearby,
    trendingRestaurants,
    loadingTrending,
    friendRestaurants,
    loadingFriends,
    allRestaurants,
    lists,
    activeTab,
  ]);
}
