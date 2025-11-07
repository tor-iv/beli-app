'use client';

import { Calendar, MapPin, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantService } from '@/lib/services';

import type { Restaurant } from '@/types';

type ViewType = 'reserve' | 'nearby' | 'trending' | 'friends';

interface RestaurantToggleWidgetProps {
  userId?: string;
  defaultView?: ViewType;
}

export const RestaurantToggleWidget = ({
  userId = 'current-user',
  defaultView = 'trending',
}: RestaurantToggleWidgetProps) => {
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
            data = await RestaurantService.getReservableRestaurants(6);
            break;
          case 'nearby':
            data = await RestaurantService.getNearbyRecommendations(userId, 2.0, 6);
            break;
          case 'trending':
            data = await RestaurantService.getTrendingRestaurants();
            break;
          case 'friends':
            data = await RestaurantService.getFriendRecommendations(userId, 6);
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
      case 'reserve':
        return 'Reserve Now';
      case 'nearby':
        return 'Nearby & Friends';
      case 'trending':
        return 'Trending';
      case 'friends':
        return 'Friend Picks';
      default:
        return 'Restaurants';
    }
  };

  return (
    <Card className="beli-card">
      <CardContent className="p-5 sm:p-6">
        {/* Header with dynamic title */}
        <div className="mb-6">
          <h3 className="text-base font-semibold sm:text-lg">{getViewTitle()}</h3>
        </div>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)}>
          <TabsList className="mb-6 grid h-12 w-full grid-cols-4 gap-2">
            <TabsTrigger
              value="reserve"
              className="flex h-full items-center justify-center px-2"
              title="Reserve Now"
              aria-label="Reserve Now"
            >
              <Calendar className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger
              value="nearby"
              className="flex h-full items-center justify-center px-2"
              title="Nearby & Friends"
              aria-label="Nearby & Friends"
            >
              <MapPin className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="flex h-full items-center justify-center px-2"
              title="Trending"
              aria-label="Trending"
            >
              <TrendingUp className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="flex h-full items-center justify-center px-2"
              title="Friend Picks"
              aria-label="Friend Picks"
            >
              <Users className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          {/* Visual separator */}
          <div className="mb-6 border-t border-gray-100" />

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
              <div className="py-12 text-center text-muted">
                <p className="text-sm">No restaurants found for this category</p>
              </div>
            )}

            {restaurants.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                <Link
                  href={`/lists?view=${activeView}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
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
