import { useState, useEffect } from 'react';
import { Restaurant } from '@/types';

/**
 * Creates an IntersectionObserver to track visible restaurants
 * Used for map view to show only relevant markers
 *
 * @param restaurants - All restaurants in the list
 * @param callback - Function to call with visible restaurant IDs
 * @param bufferSize - Number of restaurants to include before/after visible ones
 * @returns IntersectionObserver instance
 */
function createRestaurantObserver(
  restaurants: Restaurant[],
  callback: (visibleRestaurants: Restaurant[]) => void,
  bufferSize: number
): IntersectionObserver {
  const visibleIds = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const restaurantId = entry.target.getAttribute('data-restaurant-id');
        if (!restaurantId) return;

        if (entry.isIntersecting) {
          visibleIds.add(restaurantId);
        } else {
          visibleIds.delete(restaurantId);
        }
      });

      // Find visible restaurants with buffer
      const visibleRestaurants: Restaurant[] = [];
      const visibleIndexes = new Set<number>();

      restaurants.forEach((restaurant, index) => {
        if (visibleIds.has(restaurant.id)) {
          visibleIndexes.add(index);
        }
      });

      // Add buffer before and after visible items
      const allIndexes = new Set<number>();
      visibleIndexes.forEach((index) => {
        for (let i = Math.max(0, index - bufferSize); i <= Math.min(restaurants.length - 1, index + bufferSize); i++) {
          allIndexes.add(i);
        }
      });

      // Convert indexes to restaurants
      Array.from(allIndexes)
        .sort((a, b) => a - b)
        .forEach((index) => {
          visibleRestaurants.push(restaurants[index]);
        });

      callback(visibleRestaurants);
    },
    {
      root: null, // viewport
      rootMargin: '100px', // Start observing 100px before element enters viewport
      threshold: 0.1, // Trigger when 10% visible
    }
  );

  return observer;
}

/**
 * Hook that tracks which restaurants are currently visible in viewport
 * Used for map view to show only relevant markers for performance
 * Includes intelligent buffering for smooth scrolling
 *
 * @param restaurants - Array of all restaurants
 * @param enabled - Whether viewport tracking is enabled (default: true)
 * @param bufferSize - Number of restaurants to include before/after visible ones (default: 5)
 * @returns Array of currently visible restaurants (with buffer)
 *
 * @example
 * const { data: restaurants } = useRestaurants();
 * const visibleRestaurants = useVisibleRestaurants(restaurants, true, 5);
 *
 * // Only render map markers for visible restaurants
 * <RestaurantMap restaurants={visibleRestaurants} />
 */
export function useVisibleRestaurants(
  restaurants: Restaurant[],
  enabled: boolean = true,
  bufferSize: number = 5
): Restaurant[] {
  const [visibleRestaurants, setVisibleRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    // Skip if disabled or not in browser
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    // Create observer
    const observer = createRestaurantObserver(restaurants, setVisibleRestaurants, bufferSize);

    // Delay observation to allow DOM to render
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll('[data-restaurant-id]');
      elements.forEach((el) => observer.observe(el));
    }, 300);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [restaurants, enabled, bufferSize]);

  return visibleRestaurants;
}
