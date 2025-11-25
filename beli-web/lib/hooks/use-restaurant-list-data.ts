import { useMemo } from 'react';

import { useLists } from './use-lists';
import {
  useRestaurants,
  useTrendingRestaurants,
  useNearbyRecommendations,
  useFriendRecommendations,
} from './use-restaurants';
import { useReservableRestaurants } from './use-special-lists';
import { useUserRestaurantsByStatus } from './use-user-restaurants';

import type { ListType } from './use-lists-reducer';
import type { ViewType } from '@/lib/utils/list-view-utils';
import type { Restaurant, ListCategory } from '@/types';

/**
 * Data source type for restaurant lists
 * - 'user-lists': Personal lists (been, want_to_try, recommended) via UserRestaurantService
 * - 'playlists': Custom playlists via ListService
 * - Others: Special curated lists (reservable, nearby, trending, friends)
 */
type DataSource = 'reservable' | 'nearby' | 'trending' | 'friends' | 'user-lists' | 'playlists';

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
 * Maps ListType tab names to UserRestaurantService status values
 * Note: 'recs' in UI maps to 'recommended' in the service
 */
function mapTabToStatus(tab: ListType): 'been' | 'want_to_try' | 'recommended' | null {
  switch (tab) {
    case 'been':
      return 'been';
    case 'want_to_try':
      return 'want_to_try';
    case 'recs':
      return 'recommended';
    default:
      return null;
  }
}

/**
 * Unified hook for fetching restaurant data based on view and tab selection
 * Consolidates 8 separate conditional React Query hooks into intelligent data fetching
 * Dramatically simplifies the lists page component
 *
 * Data sources:
 * - Personal lists (been, want_to_try, recs) → UserRestaurantService
 * - Playlists → ListService
 * - Special views (reserve, nearby, trending, friends) → Specialized hooks
 *
 * @param viewParam - URL parameter for special views
 * @param activeTab - Current active tab
 * @param userId - Optional user ID (defaults to '1')
 * @param category - Optional category filter for service-level filtering
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
  activeTab: ListType,
  userId: string = '00000000-0000-0000-0000-000000000001',
  category?: ListCategory
): RestaurantListDataResult {
  // Map tab to service status (null if not a personal list tab)
  const userListStatus = mapTabToStatus(activeTab);

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

    // Priority 3: Personal lists (been, want_to_try, recs) via UserRestaurantService
    if (userListStatus) return 'user-lists';

    // Priority 4: Custom playlists via ListService
    return 'playlists';
  }, [viewParam, activeTab, userListStatus]);

  // Fetch data from appropriate source (conditionally enabled)
  const { data: reservableRestaurants, isLoading: loadingReservable } = useReservableRestaurants(
    20,
    {
      enabled: dataSource === 'reservable',
    }
  );
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

  // For personal lists (been, want_to_try, recs), fetch directly from UserRestaurantService
  const { data: userListRestaurants, isLoading: loadingUserList } = useUserRestaurantsByStatus(
    userId,
    userListStatus || 'been', // fallback to 'been' (won't be used when disabled)
    category,
    { enabled: dataSource === 'user-lists' && !!userListStatus }
  );

  // For playlists, fetch all restaurants and lists (legacy approach)
  const { data: allRestaurants } = useRestaurants({ enabled: dataSource === 'playlists' });
  const { data: lists } = useLists(userId, { enabled: dataSource === 'playlists' });

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

      case 'user-lists':
        // Personal lists (been, want_to_try, recs) from UserRestaurantService
        return {
          restaurants: userListRestaurants || [],
          isLoading: loadingUserList,
        };

      case 'playlists':
      default:
        // Custom playlists via ListService (legacy approach)
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
    userListRestaurants,
    loadingUserList,
    allRestaurants,
    lists,
    activeTab,
  ]);
}
