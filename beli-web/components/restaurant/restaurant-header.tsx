'use client';

import { Heart, Plus } from 'lucide-react';
import { IoLocationSharp, IoCashOutline } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import { useBookmarkStore } from '@/lib/stores/bookmark-store';

import type { Restaurant } from '@/types';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  onBookmark?: () => void;
  onAddToList?: () => void;
}

export const RestaurantHeader = ({ restaurant, onBookmark, onAddToList }: RestaurantHeaderProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const bookmarked = isBookmarked(restaurant.id);

  const handleBookmark = () => {
    toggleBookmark(restaurant.id);
    onBookmark?.();
  };

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span>{restaurant.cuisine.join(', ')}</span>
            <span className="flex items-center gap-1">
              <IoCashOutline className="h-4 w-4" />
              {restaurant.priceRange}
            </span>
            <span className="flex items-center gap-1">
              <IoLocationSharp className="h-4 w-4" />
              {restaurant.location.neighborhood}
            </span>
            {restaurant.distance && <span>{restaurant.distance.toFixed(1)} mi away</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBookmark}
            className={bookmarked ? 'border-red-500 text-red-500' : ''}
          >
            <Heart className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="default" size="icon" onClick={onAddToList} className="bg-primary">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
