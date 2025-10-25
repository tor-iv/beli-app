'use client';

import { useState, useEffect } from 'react';
import { useLists } from '@/lib/hooks/use-lists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { RestaurantDetailPreview } from '@/components/restaurant/restaurant-detail-preview';
import { Skeleton } from '@/components/ui/skeleton';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { Restaurant } from '@/types';

type ListType = 'been' | 'want_to_try' | 'recs';

export default function ListsPage() {
  const [activeTab, setActiveTab] = useState<ListType>('been');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const { data: lists, isLoading: listsLoading } = useLists();
  const { data: allRestaurants } = useRestaurants();

  // Filter lists by type
  const filteredLists = lists?.filter(list => list.listType === activeTab) || [];

  // Get restaurants for the current lists
  const restaurantIds = new Set(filteredLists.flatMap(list => list.restaurants));
  const restaurantsData = allRestaurants?.filter(r => restaurantIds.has(r.id)) || [];

  // Auto-select first restaurant on desktop when data changes
  useEffect(() => {
    if (!selectedRestaurant && restaurantsData.length > 0) {
      setSelectedRestaurant(restaurantsData[0]);
    }
  }, [restaurantsData, selectedRestaurant]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Lists</h1>

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
          ) : filteredLists.length > 0 ? (
            <>
              {/* Mobile: Grid layout (existing) */}
              <div className="md:hidden space-y-6">
                {filteredLists.map((list) => {
                  const listRestaurants = restaurantsData.filter(r =>
                    list.restaurants.includes(r.id)
                  );

                  return (
                    <div key={list.id}>
                      <h2 className="font-semibold text-lg mb-3">
                        {list.name}
                        <span className="text-sm text-muted ml-2">
                          ({listRestaurants.length})
                        </span>
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {listRestaurants.map((restaurant) => (
                          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Master/Detail layout */}
              <div className="hidden md:grid md:grid-cols-[2fr_3fr] gap-6">
                {/* Master: List of restaurants */}
                <div className="space-y-6 overflow-auto max-h-[calc(100vh-200px)]">
                  {filteredLists.map((list) => {
                    const listRestaurants = restaurantsData.filter(r =>
                      list.restaurants.includes(r.id)
                    );

                    return (
                      <div key={list.id}>
                        <h2 className="font-semibold text-lg mb-3 sticky top-0 bg-white py-2 z-10">
                          {list.name}
                          <span className="text-sm text-muted ml-2">
                            ({listRestaurants.length})
                          </span>
                        </h2>
                        <div className="space-y-1">
                          {listRestaurants.map((restaurant, index) => (
                            <RestaurantListItemCompact
                              key={restaurant.id}
                              restaurant={restaurant}
                              rank={index + 1}
                              isSelected={selectedRestaurant?.id === restaurant.id}
                              onClick={() => setSelectedRestaurant(restaurant)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detail: Selected restaurant preview */}
                <div className="sticky top-6 h-fit">
                  {selectedRestaurant ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <RestaurantDetailPreview restaurant={selectedRestaurant} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p>Select a restaurant to view details</p>
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
    </div>
  );
}
