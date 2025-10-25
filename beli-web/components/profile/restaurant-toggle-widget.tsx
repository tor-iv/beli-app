'use client';

import { useState, useEffect } from 'react';
import { MockDataService } from '@/lib/mockDataService';
import { Restaurant } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ViewType = 'reserve' | 'nearby' | 'trending' | 'friends';

interface RestaurantToggleWidgetProps {
  userId?: string;
  defaultView?: ViewType;
}

export function RestaurantToggleWidget({ userId = 'current-user', defaultView = 'trending' }: RestaurantToggleWidgetProps) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>(defaultView);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      setLoading(true);
      try {
        let data: Restaurant[] = [];

        switch (activeView) {
          case 'reserve':
            data = await MockDataService.getReservableRestaurants(6);
            break;
          case 'nearby':
            data = await MockDataService.getNearbyRecommendations(userId, 2.0, 6);
            break;
          case 'trending':
            data = await MockDataService.getTrendingRestaurants();
            break;
          case 'friends':
            data = await MockDataService.getFriendRecommendations(userId, 6);
            break;
        }

        setRestaurants(data);
      } catch (error) {
        console.error('Error loading restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [activeView, userId]);

  return (
    <Card className="beli-card">
      <CardContent className="p-6">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)}>
          <TabsList className="w-full mb-6 grid grid-cols-4">
            <TabsTrigger value="reserve" className="text-xs sm:text-sm px-2 sm:px-3 gap-1">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reserve</span>
            </TabsTrigger>
            <TabsTrigger value="nearby" className="text-xs sm:text-sm px-2 sm:px-3 gap-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nearby</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs sm:text-sm px-2 sm:px-3 gap-1">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-xs sm:text-sm px-2 sm:px-3 gap-1">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Friends</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeView}>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : restaurants.length > 0 ? (
              <div className="space-y-2">
                {restaurants.map((restaurant) => (
                  <RestaurantListItemCompact
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => router.push(`/restaurant/${restaurant.id}`)}
                    data-restaurant-id={restaurant.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted">
                <p>No restaurants found for this category</p>
              </div>
            )}

            {restaurants.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  href={`/lists?view=${activeView}`}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View all →
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
