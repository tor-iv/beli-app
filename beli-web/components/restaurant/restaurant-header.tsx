'use client';

import { Restaurant } from '@/types';
import { IoLocationSharp, IoCashOutline } from 'react-icons/io5';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarkStore } from '@/lib/stores/bookmark-store';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  onBookmark?: () => void;
  onAddToList?: () => void;
}

export function RestaurantHeader({ restaurant, onBookmark, onAddToList }: RestaurantHeaderProps) {
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
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span>{restaurant.cuisine.join(', ')}</span>
            <span className="flex items-center gap-1">
              <IoCashOutline className="w-4 h-4" />
              {restaurant.priceRange}
            </span>
            <span className="flex items-center gap-1">
              <IoLocationSharp className="w-4 h-4" />
              {restaurant.location.neighborhood}
            </span>
            {restaurant.distance && (
              <span>{restaurant.distance.toFixed(1)} mi away</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBookmark}
            className={bookmarked ? 'text-red-500 border-red-500' : ''}
          >
            <Heart className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={onAddToList}
            className="bg-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
