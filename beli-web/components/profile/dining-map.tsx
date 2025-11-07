'use client';

import { Share2 } from 'lucide-react';
import { useMemo } from 'react';

import { positionDotsOnMap } from '@/lib/utils/mapProjection';

import type { DiningLocation } from '@/types';

interface DiningMapProps {
  locations: DiningLocation[];
  totalCities: number;
  totalRestaurants: number;
  onShare?: () => void;
}

export const DiningMap = ({ locations, totalCities, totalRestaurants, onShare }: DiningMapProps) => {
  // Format plural text
  const cityText = totalCities === 1 ? 'city' : 'cities';
  const restaurantText = totalRestaurants === 1 ? 'restaurant' : 'restaurants';

  // OPTIMIZED: Memoize expensive map projection calculations
  const positionedLocations = useMemo(() => {
    return positionDotsOnMap(locations);
  }, [locations]);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Dining Map</h3>
          <p className="mt-0.5 text-sm text-gray-800">
            {totalCities} {cityText} • {totalRestaurants} {restaurantText}
          </p>
        </div>
        {onShare && (
          <button
            onClick={onShare}
            className="rounded-lg p-2 transition-colors hover:bg-gray-50"
            type="button"
            aria-label="Share dining map"
          >
            <Share2 className="h-5 w-5 text-gray-800" />
          </button>
        )}
      </div>

      {/* Map with Dots */}
      <div className="relative bg-white p-8">
        <div className="relative h-48 w-full">
          {/* World Map Background */}
          <img
            src="/images/World_Map_Grayscale.png"
            alt="World map showing dining locations"
            className="h-full w-full object-contain"
          />

          {/* City Dots Overlay */}
          {positionedLocations.map((location, index) => (
            <div
              key={`${location.city}-${index}`}
              className="absolute -ml-1.5 -mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-600 shadow-md"
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
              }}
              title={`${location.city} (${location.restaurantIds.length} ${location.restaurantIds.length === 1 ? 'restaurant' : 'restaurants'})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
