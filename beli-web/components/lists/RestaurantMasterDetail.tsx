import { RestaurantListItemMobile } from '@/components/restaurant/restaurant-list-item-mobile';


import { DetailPanel } from './DetailPanel';
import { MasterList } from './MasterList';

import type { Restaurant } from '@/types';

/**
 * Reusable master/detail layout for restaurant lists
 * Handles both mobile (compact list) and desktop (master/detail) views
 * Eliminates 158 lines of duplicate code from lists page
 *
 * On mobile: Shows single-column scrollable list
 * On desktop: Shows two-column layout with selectable master list and detail panel
 */
interface RestaurantMasterDetailProps {
  /** Array of restaurants to display */
  restaurants: Restaurant[];
  /** Currently selected restaurant (for detail view) */
  selectedRestaurant: Restaurant | null;
  /** Callback when a restaurant is selected */
  onSelectRestaurant: (restaurant: Restaurant) => void;
  /** Right panel view mode (detail or map) */
  rightPanelView: 'detail' | 'map';
  /** Visible restaurants for map (with buffer from IntersectionObserver) */
  visibleRestaurants?: Restaurant[];
  /** Callback when right panel view changes */
  onViewChange?: (view: 'detail' | 'map') => void;
}

export const RestaurantMasterDetail = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  rightPanelView,
  visibleRestaurants = [],
  onViewChange,
}: RestaurantMasterDetailProps) => {
  return (
    <>
      {/* Mobile View: Simple scrollable list */}
      <div className="space-y-3 md:hidden">
        {restaurants.map((restaurant, index) => (
          <div key={restaurant.id} data-restaurant-id={restaurant.id}>
            <RestaurantListItemMobile restaurant={restaurant} rank={index + 1} />
          </div>
        ))}
      </div>

      {/* Desktop View: Master/Detail layout */}
      <div className="hidden gap-6 md:grid md:grid-cols-[2fr_3fr]">
        {/* Left Panel: Master list */}
        <MasterList
          restaurants={restaurants}
          selectedRestaurant={selectedRestaurant}
          onSelect={onSelectRestaurant}
        />

        {/* Right Panel: Detail or map view */}
        <DetailPanel
          view={rightPanelView}
          selectedRestaurant={selectedRestaurant}
          allRestaurants={restaurants}
          visibleRestaurants={visibleRestaurants}
          onViewChange={onViewChange}
          onRestaurantSelect={onSelectRestaurant}
        />
      </div>
    </>
  );
}
