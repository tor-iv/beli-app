'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { IoShareSocial, IoChevronDown, IoCheckmark } from 'react-icons/io5';

import { ListPickerModal } from '@/components/lists/ListPickerModal';
import { MobileTabs, DEFAULT_MOBILE_TABS, type MobileTabId } from '@/components/lists/MobileTabs';
import { RestaurantMasterDetail } from '@/components/lists/RestaurantMasterDetail';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilteredRestaurants } from '@/lib/hooks/use-filtered-restaurants';
import { useListCounts } from '@/lib/hooks/use-list-counts';
import { useListsReducer, type ListType } from '@/lib/hooks/use-lists-reducer';
import { useRestaurantListData } from '@/lib/hooks/use-restaurant-list-data';
import { useVisibleRestaurants } from '@/lib/hooks/use-visible-restaurants';
import { useListFilters } from '@/lib/stores/list-filters';
import { getViewTitle, getRestaurantCountLabel } from '@/lib/utils/list-view-utils';

import type { ViewType} from '@/lib/utils/list-view-utils';


/**
 * Lists page - Restaurant list management with filtering, sorting, and views
 * Refactored for reduced cognitive complexity and better separation of concerns
 *
 * Features:
 * - User's personal lists (Been, Want to Try, Recommended)
 * - Special lists (Trending, Recommendations nearby/from friends)
 * - Advanced filtering (city, cuisine, price, tags, etc.)
 * - Multiple view modes (list, map)
 * - Master/detail layout on desktop
 */

const ListsContent = () => {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view') as ViewType;
  const tabParam = searchParams.get('tab') as ListType | null;

  // UI state management (reducer for coordinated state)
  const [state, dispatch] = useListsReducer(tabParam || 'been');
  const { activeTab, selectedRestaurant, rightPanelView, isListPickerOpen, isInMoreView } = state;

  // Filter state from Zustand store
  const filters = useListFilters();
  const { data: listCounts } = useListCounts();

  // Fetch restaurant data based on current view/tab (consolidates 8 hooks!)
  const { restaurants: baseRestaurants, isLoading } = useRestaurantListData(viewParam, activeTab);

  // Apply all filters and sorting (extracts complex filtering logic)
  const filteredRestaurants = useFilteredRestaurants(baseRestaurants, filters);

  // Track visible restaurants for map view (extracts IntersectionObserver logic)
  const visibleRestaurants = useVisibleRestaurants(
    filteredRestaurants,
    rightPanelView === 'map',
    5 // buffer size
  );

  // Sync URL tab parameter with state
  if (tabParam && tabParam !== activeTab) {
    dispatch({ type: 'SET_TAB', tab: tabParam });
  }

  // Determine mobile tab to display
  const displayedTab: MobileTabId = isInMoreView ? 'more' : (activeTab as MobileTabId);

  // View title for header
  const viewTitle = getViewTitle(viewParam);

  // Restaurant count label
  const countLabel = getRestaurantCountLabel(filteredRestaurants.length);

  // Handler: Select restaurant for detail view
  const handleSelectRestaurant = (restaurant: (typeof filteredRestaurants)[0]) => {
    dispatch({ type: 'SELECT_RESTAURANT', restaurant });
  };

  // Handler: Toggle right panel view (detail/map)
  const handleViewChange = (view: 'detail' | 'map') => {
    dispatch({ type: 'TOGGLE_VIEW', view });
  };

  // Handler: Open list picker modal
  const handleListPickerOpen = () => {
    dispatch({ type: 'TOGGLE_LIST_PICKER', open: true });
  };

  // Handler: Close list picker modal
  const handleListPickerClose = () => {
    dispatch({ type: 'TOGGLE_LIST_PICKER', open: false });
  };

  // Handler: Select a list from picker
  const handleListSelect = (listId: string) => {
    dispatch({ type: 'SET_TAB', tab: listId as ListType });
    dispatch({ type: 'TOGGLE_LIST_PICKER', open: false });
  };

  // Handler: Mobile tab change
  const handleMobileTabChange = (tabId: MobileTabId) => {
    if (tabId === 'more') {
      // Toggle more view
      dispatch({ type: 'OPEN_MORE_LIST', tab: 'trending' }); // Default to trending
    } else {
      dispatch({ type: 'SET_TAB', tab: tabId as ListType });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="mb-6 h-10 w-48" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{viewTitle}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <IoShareSocial className="mr-2" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IoChevronDown className="mr-2" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleListPickerOpen}>
                  <IoCheckmark className="mr-2" />
                  Switch List
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewChange(rightPanelView === 'detail' ? 'map' : 'detail')}
                >
                  Toggle View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Count and Filter Summary */}
        <p className="mb-4 text-sm text-muted-foreground">
          {countLabel}
          {filters.getActiveFilterCount() > 0 && (
            <span>
              {' '}
              • {filters.getActiveFilterCount()} active filter
              {filters.getActiveFilterCount() > 1 ? 's' : ''}
            </span>
          )}
        </p>

        {/* Mobile Tabs */}
        <div className="mb-4 md:hidden">
          <MobileTabs
            tabs={DEFAULT_MOBILE_TABS}
            activeTab={displayedTab}
            onChange={handleMobileTabChange}
          />
        </div>

        {/* Filter/Search/Sort Controls */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => filters.setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.category}
              onChange={(e) => filters.setCategory(e.target.value as any)}
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="all">All Categories</option>
              <option value="restaurants">Restaurants</option>
              <option value="bars">Bars</option>
              <option value="bakeries">Bakeries</option>
              <option value="coffee_tea">Coffee & Tea</option>
              <option value="dessert">Dessert</option>
            </select>
            <Button variant="outline" size="sm">
              Sort: {filters.sortBy}
            </Button>
            <Button variant="outline" size="sm">
              Filters ({filters.getActiveFilterCount()})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content: Master/Detail Layout */}
      <RestaurantMasterDetail
        restaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        rightPanelView={rightPanelView}
        visibleRestaurants={visibleRestaurants}
        onViewChange={handleViewChange}
      />

      {/* List Picker Modal */}
      <ListPickerModal
        open={isListPickerOpen}
        onOpenChange={(open) => {
          if (!open) handleListPickerClose();
        }}
        onSelectList={handleListSelect}
        selectedList={activeTab as any}
        listCounts={listCounts}
      />
    </div>
  );
}

/**
 * Lists page with Suspense boundary
 * Handles loading state for search params
 */
export default function ListsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <p>Loading...</p>
        </div>
      }
    >
      <ListsContent />
    </Suspense>
  );
}
