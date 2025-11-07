'use client';

import Link from 'next/link';

import { RatingBubble } from '@/components/rating/rating-bubble';

import type { Restaurant } from '@/types';

interface RestaurantListItemMobileProps {
  restaurant: Restaurant;
  rank?: number;
}

export const RestaurantListItemMobile = ({ restaurant, rank }: RestaurantListItemMobileProps) => {
  // Get first cuisine or fallback
  const cuisine = Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : restaurant.cuisine;
  const neighborhood = restaurant.location?.neighborhood || restaurant.location?.city || '';

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="flex items-center gap-3 border-b border-gray-100 p-3 transition-colors active:bg-gray-50">
        {/* Rank number */}
        {rank !== undefined && (
          <span className="w-6 shrink-0 text-right text-sm font-semibold text-gray-800">
            {rank}
          </span>
        )}

        {/* Restaurant info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">{restaurant.name}</h3>

          {/* Cuisine and neighborhood */}
          <p className="truncate text-sm text-gray-800">
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
            <p className="mt-0.5 text-xs text-gray-700">{restaurant.distance.toFixed(1)} mi</p>
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
