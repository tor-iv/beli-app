'use client';

import { IoLocationOutline } from 'react-icons/io5';

import { RatingBubble } from '@/components/rating/rating-bubble';
import { cn } from '@/lib/utils';

import type { Restaurant } from '@/types';


interface RestaurantListItemCompactProps {
  restaurant: Restaurant;
  isSelected?: boolean;
  onClick?: () => void;
  rank?: number;
  'data-restaurant-id'?: string;
}

export const RestaurantListItemCompact = ({
  restaurant,
  isSelected = false,
  onClick,
  rank,
  'data-restaurant-id': dataRestaurantId,
}: RestaurantListItemCompactProps) => {
  return (
    <button
      onClick={onClick}
      data-restaurant-id={dataRestaurantId}
      className={cn(
        'w-full rounded-lg p-4 text-left transition-all',
        'cursor-pointer hover:bg-gray-50',
        'border border-transparent',
        isSelected && 'border-primary bg-primary/5 shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Rank if provided */}
        {rank && <div className="min-w-[2rem] text-lg font-bold text-muted">#{rank}</div>}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-base font-semibold">{restaurant.name}</h3>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted">
            <IoLocationOutline className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{restaurant.location.neighborhood}</span>
            <span>•</span>
            <span>{restaurant.cuisine[0]}</span>
          </div>

          {/* Tags or distance */}
          <div className="flex items-center gap-2 text-xs">
            {restaurant.distance && <span className="text-muted">{restaurant.distance} mi</span>}
            {restaurant.priceRange && (
              <>
                <span className="text-muted">•</span>
                <span className="text-muted">{restaurant.priceRange}</span>
              </>
            )}
            {restaurant.isOpen !== undefined && (
              <>
                <span className="text-muted">•</span>
                <span className={restaurant.isOpen ? 'text-green-600' : 'text-red-600'}>
                  {restaurant.isOpen ? 'Open' : 'Closed'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex-shrink-0">
          <RatingBubble rating={restaurant.rating} size="sm" />
        </div>
      </div>
    </button>
  );
}
