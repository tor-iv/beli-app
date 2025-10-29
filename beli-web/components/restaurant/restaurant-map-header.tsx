'use client';

import { Restaurant } from '@/types';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import map to avoid SSR issues with Leaflet
const DynamicMap = dynamic(
  () => import('./restaurant-map-header-client'),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[280px] md:h-[360px]" />
  }
);

interface RestaurantMapHeaderProps {
  restaurant: Restaurant;
}

export function RestaurantMapHeader({ restaurant }: RestaurantMapHeaderProps) {
  return (
    <div className="relative w-full h-[280px] md:h-[360px] overflow-hidden">
      <DynamicMap restaurant={restaurant} />
    </div>
  );
}
