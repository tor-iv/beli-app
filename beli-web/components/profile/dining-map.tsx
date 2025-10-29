'use client';

import { Share2 } from 'lucide-react';
import { DiningLocation } from '@/types';
import { positionDotsOnMap } from '@/lib/utils/mapProjection';

interface DiningMapProps {
  locations: DiningLocation[];
  totalCities: number;
  totalRestaurants: number;
  onShare?: () => void;
}

export function DiningMap({
  locations,
  totalCities,
  totalRestaurants,
  onShare,
}: DiningMapProps) {
  // Format plural text
  const cityText = totalCities === 1 ? 'city' : 'cities';
  const restaurantText = totalRestaurants === 1 ? 'restaurant' : 'restaurants';

  // Position dots on map using projection
  const positionedLocations = positionDotsOnMap(locations);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Dining Map</h3>
          <p className="text-sm text-gray-800 mt-0.5">
            {totalCities} {cityText} • {totalRestaurants} {restaurantText}
          </p>
        </div>
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Share dining map"
          >
            <Share2 className="w-5 h-5 text-gray-800" />
          </button>
        )}
      </div>

      {/* Map with Dots */}
      <div className="relative bg-white p-8">
        <div className="relative w-full h-48">
          {/* World Map Background */}
          <img
            src="/images/World_Map_Grayscale.png"
            alt="World map showing dining locations"
            className="w-full h-full object-contain"
          />

          {/* City Dots Overlay */}
          {positionedLocations.map((location, index) => (
            <div
              key={`${location.city}-${index}`}
              className="absolute w-2.5 h-2.5 -ml-1.5 -mt-1.5 rounded-full bg-teal-600 border-2 border-white shadow-md"
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
