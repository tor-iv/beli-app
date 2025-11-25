/**
 * Menu Hooks
 *
 * React Query hooks for restaurant menus and "What to Order" feature.
 */

import { useQuery } from '@tanstack/react-query';
import { MenuService, WhatToOrderParams, WhatToOrderResult } from '../services/menu/MenuService';
import type { MenuItem } from '../../types';

/**
 * Get menu items for a restaurant
 */
export function useMenuItems(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => MenuService.getMenuItems(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 30 * 60 * 1000, // Menus don't change often
  });
}

/**
 * Get a specific menu item
 */
export function useMenuItem(itemId: string | undefined) {
  return useQuery({
    queryKey: ['menu-item', itemId],
    queryFn: () => MenuService.getMenuItem(itemId!),
    enabled: !!itemId,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get menu items by category
 */
export function useMenuItemsByCategory(restaurantId: string | undefined, category: string | undefined) {
  return useQuery({
    queryKey: ['menu', restaurantId, 'category', category],
    queryFn: () => MenuService.getMenuItemsByCategory(restaurantId!, category!),
    enabled: !!restaurantId && !!category,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get popular items for a restaurant
 */
export function usePopularMenuItems(restaurantId: string | undefined, limit: number = 5) {
  return useQuery({
    queryKey: ['menu', restaurantId, 'popular', limit],
    queryFn: () => MenuService.getPopularItems(restaurantId!, limit),
    enabled: !!restaurantId,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Get signature dishes for a restaurant
 */
export function useSignatureDishes(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu', restaurantId, 'signature'],
    queryFn: () => MenuService.getSignatureDishes(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * "What to Order" recommendation hook
 */
export function useWhatToOrder(params: WhatToOrderParams | null) {
  return useQuery({
    queryKey: ['what-to-order', params?.restaurantId, params?.partySize, params?.hungerLevel],
    queryFn: () => MenuService.getWhatToOrder(params!),
    enabled: !!params && !!params.restaurantId,
    staleTime: 0, // Always fresh recommendations
  });
}

/**
 * Search menu items
 */
export function useSearchMenuItems(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['menu', 'search', query],
    queryFn: () => MenuService.searchMenuItems(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Check if restaurant has a menu
 */
export function useHasMenu(restaurantId: string | undefined): boolean {
  if (!restaurantId) return false;
  return MenuService.hasMenu(restaurantId);
}

/**
 * Get restaurants that have menus
 */
export function useRestaurantsWithMenus(): string[] {
  return MenuService.getRestaurantsWithMenus();
}

// Re-export types
export type { WhatToOrderParams, WhatToOrderResult };
