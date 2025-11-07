'use client';

import dynamic from 'next/dynamic';

import { RestaurantDetailPreview } from '@/components/restaurant/restaurant-detail-preview';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

import type { Restaurant } from '@/types';

// Dynamically import map component (client-side only)
const RestaurantMap = dynamic(
  () => import('@/components/map/restaurant-map').then((mod) => mod.RestaurantMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p>Loading map...</p>
      </div>
    ),
  }
);

/**
 * Detail panel component for desktop master/detail view
 * Shows either restaurant detail or map view in right panel
 * Handles view toggling and empty states
 */
interface DetailPanelProps {
  /** Current view mode (detail or map) */
  view: 'detail' | 'map';
  /** Selected restaurant to show details for */
  selectedRestaurant: Restaurant | null;
  /** All restaurants for map view */
  allRestaurants: Restaurant[];
  /** Visible restaurants for map markers (with buffer) */
  visibleRestaurants: Restaurant[];
  /** Callback when view mode changes */
  onViewChange?: (view: 'detail' | 'map') => void;
  /** Callback when a restaurant is selected from map */
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}

export const DetailPanel = ({
  view,
  selectedRestaurant,
  allRestaurants,
  visibleRestaurants,
  onViewChange,
  onRestaurantSelect,
}: DetailPanelProps) => {
  // Detail view
  if (view === 'detail') {
    if (!selectedRestaurant) {
      return (
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <EmptyState
            title="No restaurant selected"
            description="Select a restaurant from the list to see details"
          />
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        {onViewChange && (
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={() => onViewChange('map')}>
              Show Map View
            </Button>
          </div>
        )}
        <RestaurantDetailPreview restaurant={selectedRestaurant} />
      </div>
    );
  }

  // Map view
  return (
    <div className="relative h-[calc(100vh-200px)]">
      {onViewChange && (
        <div className="absolute right-4 top-4 z-10">
          <Button variant="outline" size="sm" onClick={() => onViewChange('detail')}>
            Show Detail View
          </Button>
        </div>
      )}
      <RestaurantMap
        restaurants={visibleRestaurants.length > 0 ? visibleRestaurants : allRestaurants}
        selectedRestaurant={selectedRestaurant}
        onRestaurantSelect={onRestaurantSelect || (() => {})}
      />
    </div>
  );
}
