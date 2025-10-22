'use client';

import { useState } from 'react';
import { useLists } from '@/lib/hooks/use-lists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRestaurants } from '@/lib/hooks/use-restaurants';

type ListType = 'been' | 'want_to_try' | 'recs';

export default function ListsPage() {
  const [activeTab, setActiveTab] = useState<ListType>('been');
  const { data: lists, isLoading: listsLoading } = useLists();
  const { data: allRestaurants } = useRestaurants();

  // Filter lists by type
  const filteredLists = lists?.filter(list => list.listType === activeTab) || [];

  // Get restaurants for the current lists
  const restaurantIds = new Set(filteredLists.flatMap(list => list.restaurants));
  const restaurantsData = allRestaurants?.filter(r => restaurantIds.has(r.id)) || [];

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
            <div className="space-y-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {listRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
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
