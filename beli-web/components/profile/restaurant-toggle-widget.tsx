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

  const getViewTitle = () => {
    switch (activeView) {
      case 'reserve': return 'Reserve Now';
      case 'nearby': return 'Nearby & Friends';
      case 'trending': return 'Trending';
      case 'friends': return 'Friend Picks';
      default: return 'Restaurants';
    }
  };

  return (
    <Card className="beli-card">
      <CardContent className="p-5 sm:p-6">
        {/* Header with dynamic title */}
        <div className="mb-6">
          <h3 className="font-semibold text-base sm:text-lg">{getViewTitle()}</h3>
        </div>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)}>
          <TabsList className="w-full mb-6 grid grid-cols-4 h-14 sm:h-11 gap-1">
            <TabsTrigger
              value="reserve"
              className="text-xs px-2 gap-2 flex-col sm:flex-row h-full py-2"
              title="Reserve Now"
            >
              <Calendar className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs leading-tight">Reserve</span>
            </TabsTrigger>
            <TabsTrigger
              value="nearby"
              className="text-xs px-2 gap-2 flex-col sm:flex-row h-full py-2"
              title="Nearby & Friends"
            >
              <MapPin className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs leading-tight">Nearby</span>
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="text-xs px-2 gap-2 flex-col sm:flex-row h-full py-2"
              title="Trending"
            >
              <TrendingUp className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs leading-tight">Trending</span>
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="text-xs px-2 gap-2 flex-col sm:flex-row h-full py-2"
              title="Friend Picks"
            >
              <Users className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs leading-tight">Friends</span>
            </TabsTrigger>
          </TabsList>

          {/* Visual separator */}
          <div className="border-t border-gray-100 mb-6" />

          <TabsContent value={activeView} className="mt-0">
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
                <p className="text-sm">No restaurants found for this category</p>
              </div>
            )}

            {restaurants.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link
                  href={`/lists?view=${activeView}`}
                  className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                >
                  View all
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
