'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLists } from '@/lib/hooks/use-lists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { RestaurantDetailPreview } from '@/components/restaurant/restaurant-detail-preview';
import { Skeleton } from '@/components/ui/skeleton';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { Restaurant } from '@/types';
import { MockDataService } from '@/lib/mockDataService';
import { ViewToggle } from '@/components/ui/view-toggle';
import dynamic from 'next/dynamic';

// Dynamically import map component (client-side only)
const RestaurantMap = dynamic(
  () => import('@/components/map/restaurant-map').then(mod => mod.RestaurantMap),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading map...</div> }
);

type ListType = 'been' | 'want_to_try' | 'recs';
type ViewType = 'reserve' | 'nearby' | 'trending' | 'friends' | null;
type RightPanelView = 'detail' | 'map';

function ListsContent() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view') as ViewType;
  const tabParam = searchParams.get('tab') as ListType | null;

  const [activeTab, setActiveTab] = useState<ListType>(tabParam || 'been');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [viewRestaurants, setViewRestaurants] = useState<Restaurant[] | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('detail');
  const [visibleRestaurants, setVisibleRestaurants] = useState<Restaurant[]>([]);
  const { data: lists, isLoading: listsLoading } = useLists();
  const { data: allRestaurants } = useRestaurants();

  // Sync activeTab with URL parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Load restaurants based on view parameter
  useEffect(() => {
    const loadViewRestaurants = async () => {
      if (!viewParam) {
        setViewRestaurants(null);
        return;
      }

      setLoadingView(true);
      try {
        let data: Restaurant[] = [];

        switch (viewParam) {
          case 'reserve':
            data = await MockDataService.getReservableRestaurants(20);
            break;
          case 'nearby':
            data = await MockDataService.getNearbyRecommendations('current-user', 2.0, 20);
            break;
          case 'trending':
            data = await MockDataService.getTrendingRestaurants();
            break;
          case 'friends':
            data = await MockDataService.getFriendRecommendations('current-user', 20);
            break;
        }

        setViewRestaurants(data);
      } catch (error) {
        console.error('Error loading view restaurants:', error);
      } finally {
        setLoadingView(false);
      }
    };

    loadViewRestaurants();
  }, [viewParam]);

  // Filter lists by type
  const filteredLists = lists?.filter(list => list.listType === activeTab) || [];

  // Get ALL restaurants for the current lists or from view, then sort by rating descending
  const restaurantIds = new Set(filteredLists.flatMap(list => list.restaurants));
  const restaurantsData = (viewRestaurants || allRestaurants?.filter(r => restaurantIds.has(r.id)) || [])
    .sort((a, b) => b.rating - a.rating); // Sort by rating descending (10.0, 9.9, ...)

  // Auto-select first restaurant on desktop when data changes
  useEffect(() => {
    if (!selectedRestaurant && restaurantsData.length > 0) {
      setSelectedRestaurant(restaurantsData[0]);
    }
  }, [restaurantsData, selectedRestaurant]);

  // Track visible restaurants in viewport for map
  useEffect(() => {
    if (rightPanelView !== 'map' || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible: string[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const restaurantId = entry.target.getAttribute('data-restaurant-id');
            if (restaurantId) {
              visible.push(restaurantId);
            }
          }
        });

        if (visible.length === 0) return;

        const visibleRestaurantData = restaurantsData.filter((r) =>
          visible.includes(r.id)
        );

        // Add buffer: include 5 items above and below
        const firstIndex = Math.max(
          0,
          restaurantsData.indexOf(visibleRestaurantData[0]) - 5
        );
        const lastIndex = Math.min(
          restaurantsData.length,
          restaurantsData.indexOf(
            visibleRestaurantData[visibleRestaurantData.length - 1]
          ) + 5
        );

        setVisibleRestaurants(restaurantsData.slice(firstIndex, lastIndex));
      },
      { threshold: 0.3, rootMargin: '100px' }
    );

    // Observe all restaurant list items
    const elements = document.querySelectorAll('[data-restaurant-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [rightPanelView, restaurantsData]);

  const getViewTitle = (view: ViewType): string => {
    switch (view) {
      case 'reserve':
        return 'Reserve Now';
      case 'nearby':
        return 'Recommendations Nearby';
      case 'trending':
        return 'Trending Restaurants';
      case 'friends':
        return 'Recommendations from Friends';
      default:
        return 'Your Lists';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{getViewTitle(viewParam)}</h1>
        {/* Show view toggle on desktop only */}
        <div className="hidden md:block">
          <ViewToggle view={rightPanelView} onViewChange={setRightPanelView} />
        </div>
      </div>

      {!viewParam && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ListType)}>
          <TabsList className="w-full mb-6 grid grid-cols-3">
            <TabsTrigger value="been">Been</TabsTrigger>
            <TabsTrigger value="want_to_try">Want to Try</TabsTrigger>
            <TabsTrigger value="recs">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {listsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : restaurantsData.length > 0 ? (
            <>
              {/* Mobile: Single unified list */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {restaurantsData.map((restaurant, index) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>

              {/* Desktop: Master/Detail layout */}
              <div className="hidden md:grid md:grid-cols-[2fr_3fr] gap-6">
                {/* Master: Single unified list of all restaurants */}
                <div className="space-y-1 overflow-auto max-h-[calc(100vh-200px)]">
                  {restaurantsData.map((restaurant, index) => (
                    <RestaurantListItemCompact
                      key={restaurant.id}
                      restaurant={restaurant}
                      rank={index + 1}
                      isSelected={selectedRestaurant?.id === restaurant.id}
                      onClick={() => setSelectedRestaurant(restaurant)}
                      data-restaurant-id={restaurant.id}
                    />
                  ))}
                </div>

                {/* Right Panel: Detail OR Map */}
                <div className="sticky top-6 h-fit">
                  {rightPanelView === 'detail' ? (
                    // Detail view (existing)
                    selectedRestaurant ? (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <RestaurantDetailPreview restaurant={selectedRestaurant} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p>Select a restaurant to view details</p>
                      </div>
                    )
                  ) : (
                    // Map view (new)
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100vh-250px)]">
                      <RestaurantMap
                        restaurants={restaurantsData}
                        selectedRestaurant={selectedRestaurant}
                        onRestaurantSelect={setSelectedRestaurant}
                        visibleRestaurants={visibleRestaurants}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted">
              <p>No {activeTab.replace('_', ' ')} lists yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      )}

      {/* View mode rendering */}
      {viewParam && (
        <div>
          {loadingView || !viewRestaurants ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : viewRestaurants.length > 0 ? (
            <>
              {/* Mobile: Grid layout */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {viewRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>

              {/* Desktop: Master/Detail layout */}
              <div className="hidden md:grid md:grid-cols-[2fr_3fr] gap-6">
                {/* Master: List of restaurants */}
                <div className="space-y-1 overflow-auto max-h-[calc(100vh-200px)]">
                  {viewRestaurants.map((restaurant, index) => (
                    <RestaurantListItemCompact
                      key={restaurant.id}
                      restaurant={restaurant}
                      rank={index + 1}
                      isSelected={selectedRestaurant?.id === restaurant.id}
                      onClick={() => setSelectedRestaurant(restaurant)}
                      data-restaurant-id={restaurant.id}
                    />
                  ))}
                </div>

                {/* Right Panel: Detail OR Map */}
                <div className="sticky top-6 h-fit">
                  {rightPanelView === 'detail' ? (
                    // Detail view (existing)
                    selectedRestaurant ? (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <RestaurantDetailPreview restaurant={selectedRestaurant} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p>Select a restaurant to view details</p>
                      </div>
                    )
                  ) : (
                    // Map view (new)
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100vh-250px)]">
                      <RestaurantMap
                        restaurants={viewRestaurants}
                        selectedRestaurant={selectedRestaurant}
                        onRestaurantSelect={setSelectedRestaurant}
                        visibleRestaurants={visibleRestaurants}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted">
              <p>No restaurants found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ListsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Lists</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    }>
      <ListsContent />
    </Suspense>
  );
}
