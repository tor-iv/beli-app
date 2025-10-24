import { Restaurant } from '@/types';
import { IoLocationSharp, IoCashOutline } from 'react-icons/io5';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
      <div className="flex flex-wrap items-center gap-4 text-muted">
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
  );
}
