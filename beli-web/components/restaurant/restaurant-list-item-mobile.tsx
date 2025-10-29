'use client';

import Link from 'next/link';
import { Restaurant } from '@/types';
import { RatingBubble } from '@/components/rating/rating-bubble';

interface RestaurantListItemMobileProps {
  restaurant: Restaurant;
  rank?: number;
}

export function RestaurantListItemMobile({
  restaurant,
  rank,
}: RestaurantListItemMobileProps) {
  // Get first cuisine or fallback
  const cuisine = Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : restaurant.cuisine;
  const neighborhood = restaurant.location?.neighborhood || restaurant.location?.city || '';

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="flex items-center gap-3 p-3 border-b border-gray-100 active:bg-gray-50 transition-colors">
        {/* Rank number */}
        {rank !== undefined && (
          <span className="text-sm font-semibold text-gray-800 w-6 shrink-0 text-right">
            {rank}
          </span>
        )}

        {/* Restaurant info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-gray-900 truncate">
            {restaurant.name}
          </h3>

          {/* Cuisine and neighborhood */}
          <p className="text-sm text-gray-800 truncate">
            {cuisine}
            {neighborhood && (
              <>
                {' '}
                <span className="text-gray-800">•</span> {neighborhood}
              </>
            )}
          </p>

          {/* Distance */}
          {restaurant.distance !== undefined && restaurant.distance > 0 && (
            <p className="text-xs text-gray-700 mt-0.5">
              {restaurant.distance.toFixed(1)} mi
            </p>
          )}
        </div>

        {/* Rating bubble */}
        <div className="shrink-0">
          <RatingBubble rating={restaurant.rating} size="sm" />
        </div>
      </div>
    </Link>
  );
}
