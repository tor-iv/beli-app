'use client';

import { Restaurant } from '@/types';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { cn } from '@/lib/utils';
import { IoLocationOutline } from 'react-icons/io5';

interface RestaurantListItemCompactProps {
  restaurant: Restaurant;
  isSelected?: boolean;
  onClick?: () => void;
  rank?: number;
  'data-restaurant-id'?: string;
}

export function RestaurantListItemCompact({
  restaurant,
  isSelected = false,
  onClick,
  rank,
  'data-restaurant-id': dataRestaurantId,
}: RestaurantListItemCompactProps) {
  return (
    <button
      onClick={onClick}
      data-restaurant-id={dataRestaurantId}
      className={cn(
        'w-full text-left p-4 rounded-lg transition-all',
        'hover:bg-gray-50 cursor-pointer',
        'border border-transparent',
        isSelected && 'bg-primary/5 border-primary shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Rank if provided */}
        {rank && (
          <div className="text-lg font-bold text-muted min-w-[2rem]">
            #{rank}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1 truncate">{restaurant.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted mb-2">
            <IoLocationOutline className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{restaurant.location.neighborhood}</span>
            <span>•</span>
            <span>{restaurant.cuisine[0]}</span>
          </div>

          {/* Tags or distance */}
          <div className="flex items-center gap-2 text-xs">
            {restaurant.distance && (
              <span className="text-muted">{restaurant.distance} mi</span>
            )}
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
