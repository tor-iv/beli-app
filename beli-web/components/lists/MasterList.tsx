import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Restaurant } from '@/types';

/**
 * Master list component for desktop master/detail view
 * Displays compact list of restaurants in left panel
 * Handles selection and visual feedback
 */
interface MasterListProps {
  /** Array of restaurants to display */
  restaurants: Restaurant[];
  /** Currently selected restaurant (highlighted) */
  selectedRestaurant: Restaurant | null;
  /** Callback when a restaurant is selected */
  onSelect: (restaurant: Restaurant) => void;
}

export const MasterList = ({ restaurants, selectedRestaurant, onSelect }: MasterListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-2 pr-4">
        {restaurants.map((restaurant, index) => (
          <div
            key={restaurant.id}
            data-restaurant-id={restaurant.id}
            onClick={() => onSelect(restaurant)}
            className={`cursor-pointer transition-all ${
              selectedRestaurant?.id === restaurant.id
                ? 'rounded-lg ring-2 ring-primary'
                : 'rounded-lg hover:bg-gray-50'
            }`}
          >
            <RestaurantListItemCompact
              restaurant={restaurant}
              rank={index + 1}
              onClick={() => onSelect(restaurant)}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
