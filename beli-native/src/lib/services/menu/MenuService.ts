/**
 * MenuService
 *
 * Manages restaurant menus and "What to Order" functionality:
 * - Menu item retrieval
 * - Smart recommendations based on party size and hunger level
 * - Menu filtering and search
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import {
  allMenuItems,
  restaurantMenus,
  getMenuItemsForRestaurant,
  getMenuItemById,
} from '../../../data/mock/menuItems';
import { delay } from '../base/BaseService';
import type { MenuItem } from '../../../types';

// Lazy import supabase
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
};

export interface WhatToOrderParams {
  restaurantId: string;
  partySize: number;
  hungerLevel: 'light' | 'moderate' | 'hungry' | 'starving';
  dietaryRestrictions?: string[];
  mealTime?: 'breakfast' | 'lunch' | 'dinner' | 'any-time';
}

export interface WhatToOrderResult {
  items: MenuItem[];
  totalPrice: number;
  itemsPerPerson: number;
  recommendation: string;
}

export class MenuService {
  /**
   * Get menu items for a restaurant
   */
  static async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('popularity', { ascending: false });

        if (error) throw error;
        return data as unknown as MenuItem[];
      },
      async () => {
        await delay();
        return getMenuItemsForRestaurant(restaurantId);
      },
      { operationName: 'getMenuItems' }
    );

    return data;
  }

  /**
   * Get a specific menu item
   */
  static async getMenuItem(itemId: string): Promise<MenuItem | null> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', itemId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as unknown as MenuItem | null;
      },
      async () => {
        await delay();
        return getMenuItemById(itemId) || null;
      },
      { operationName: 'getMenuItem' }
    );

    return data;
  }

  /**
   * Get menu items by category
   */
  static async getMenuItemsByCategory(
    restaurantId: string,
    category: string
  ): Promise<MenuItem[]> {
    const items = await this.getMenuItems(restaurantId);
    return items.filter((item) => item.category === category);
  }

  /**
   * Get popular menu items for a restaurant
   */
  static async getPopularItems(restaurantId: string, limit: number = 5): Promise<MenuItem[]> {
    const items = await this.getMenuItems(restaurantId);
    return items
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit);
  }

  /**
   * "What to Order" recommendation engine
   * Recommends items based on party size and hunger level
   */
  static async getWhatToOrder(params: WhatToOrderParams): Promise<WhatToOrderResult> {
    const { restaurantId, partySize, hungerLevel, dietaryRestrictions, mealTime } = params;

    const allItems = await this.getMenuItems(restaurantId);

    // Filter by dietary restrictions
    let filteredItems = allItems;
    if (dietaryRestrictions?.length) {
      filteredItems = allItems.filter((item) => {
        if (dietaryRestrictions.includes('vegetarian') && !item.isVegetarian) {
          return false;
        }
        return true;
      });
    }

    // Filter by meal time if specified
    if (mealTime && mealTime !== 'any-time') {
      filteredItems = filteredItems.filter(
        (item) => !item.mealTime || item.mealTime.includes(mealTime) || item.mealTime.includes('any-time')
      );
    }

    // Calculate items per person based on hunger level
    const itemsPerPersonMap = {
      light: 1.5,
      moderate: 2,
      hungry: 2.5,
      starving: 3,
    };
    const itemsPerPerson = itemsPerPersonMap[hungerLevel];
    const totalItems = Math.ceil(partySize * itemsPerPerson);

    // Select items with good variety
    const selectedItems: MenuItem[] = [];
    const categories = ['appetizer', 'entree', 'side', 'dessert', 'drink'];

    // Ensure variety by category
    const categoryDistribution = {
      light: { appetizer: 0.3, entree: 0.4, side: 0.1, dessert: 0.1, drink: 0.1 },
      moderate: { appetizer: 0.25, entree: 0.45, side: 0.15, dessert: 0.1, drink: 0.05 },
      hungry: { appetizer: 0.2, entree: 0.5, side: 0.15, dessert: 0.1, drink: 0.05 },
      starving: { appetizer: 0.2, entree: 0.55, side: 0.15, dessert: 0.05, drink: 0.05 },
    };

    const distribution = categoryDistribution[hungerLevel];

    for (const category of categories) {
      const categoryItems = filteredItems.filter((item) => item.category === category);
      const categoryCount = Math.max(1, Math.round(totalItems * (distribution[category as keyof typeof distribution] || 0)));

      // Sort by popularity and take top items
      const topItems = categoryItems
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, categoryCount);

      selectedItems.push(...topItems);
    }

    // If we don't have enough items, add more popular ones
    while (selectedItems.length < totalItems && filteredItems.length > selectedItems.length) {
      const remainingItems = filteredItems.filter(
        (item) => !selectedItems.some((s) => s.id === item.id)
      );
      if (remainingItems.length === 0) break;
      selectedItems.push(remainingItems[0]);
    }

    // Calculate total price
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

    // Generate recommendation text
    const recommendations = [
      `Perfect for ${partySize} ${partySize === 1 ? 'person' : 'people'}!`,
      `We selected ${selectedItems.length} items for a ${hungerLevel} appetite.`,
      `Don't miss the ${selectedItems.find((i) => i.tags?.includes('signature'))?.name || selectedItems[0]?.name}!`,
    ];

    return {
      items: selectedItems,
      totalPrice,
      itemsPerPerson,
      recommendation: recommendations.join(' '),
    };
  }

  /**
   * Get signature dishes for a restaurant
   */
  static async getSignatureDishes(restaurantId: string): Promise<MenuItem[]> {
    const items = await this.getMenuItems(restaurantId);
    return items.filter((item) => item.tags?.includes('signature'));
  }

  /**
   * Search menu items across all restaurants
   */
  static async searchMenuItems(query: string): Promise<MenuItem[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(50);

        if (error) throw error;
        return data as unknown as MenuItem[];
      },
      async () => {
        await delay();
        const lowerQuery = query.toLowerCase();
        return allMenuItems.filter(
          (item) =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },
      { operationName: 'searchMenuItems' }
    );

    return data;
  }

  /**
   * Get restaurants that have a menu
   */
  static getRestaurantsWithMenus(): string[] {
    return Object.keys(restaurantMenus);
  }

  /**
   * Check if restaurant has a menu
   */
  static hasMenu(restaurantId: string): boolean {
    return restaurantId in restaurantMenus;
  }
}
