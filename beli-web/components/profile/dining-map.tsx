'use client';

import { Share2, MapPin } from 'lucide-react';
import { DiningLocation } from '@/types';

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

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Dining Map</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            {totalCities} {cityText} • {totalRestaurants} {restaurantText}
          </p>
        </div>
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Share dining map"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Map visualization with real city data */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        {locations.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-gray-400 mb-3">
              <MapPin className="w-8 h-8" />
            </div>
            <p className="text-gray-600 font-medium">No dining locations yet</p>
            <p className="text-gray-500 text-sm mt-1">Start exploring restaurants to build your map</p>
          </div>
        ) : (
          // Show real cities as location cards
          <div className="grid gap-4">
            {locations.map((location, index) => (
              <div
                key={`${location.city}-${location.state}-${index}`}
                className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {location.city}
                    {location.state && `, ${location.state}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {location.restaurantIds.length} {location.restaurantIds.length === 1 ? 'restaurant' : 'restaurants'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-700">
                    {location.restaurantIds.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
