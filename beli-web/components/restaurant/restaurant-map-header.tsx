'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';

import type { Restaurant } from '@/types';

// Dynamically import map to avoid SSR issues with Leaflet
const DynamicMap = dynamic(() => import('./restaurant-map-header-client'), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full md:h-[360px]" />,
});

interface RestaurantMapHeaderProps {
  restaurant: Restaurant;
}

export const RestaurantMapHeader = ({ restaurant }: RestaurantMapHeaderProps) => {
  return (
    <div className="relative h-[280px] w-full overflow-hidden md:h-[360px]">
      <DynamicMap restaurant={restaurant} />
    </div>
  );
}
