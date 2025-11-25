/**
 * MenuService
 *
 * Manages restaurant menus and AI-powered order suggestions including:
 * - Fetching restaurant menus
 * - Generating personalized order suggestions based on party size, hunger level, dietary restrictions
 *
 * Now connected to Supabase PostgreSQL database via menu_items table.
 * Supports automatic fallback to mock data via withFallback().
 */

import { withFallback } from '@/lib/data-provider';
import { allMenuItems } from '@/data/mock/menuItems';

import { delay } from '../base/BaseService';

import type { Database } from '@/lib/supabase/types';
import type { MenuItem, MenuItemCategory, PortionSize, OrderSuggestion, HungerLevel, MealTime } from '@/types';

// Lazy import supabase to avoid throwing when env vars missing in mock mode
const getSupabase = async () => {
  const { supabase } = await import('@/lib/supabase/client');
  return supabase;
};

// Database row type
type DbMenuItem = Database['public']['Tables']['menu_items']['Row'];

/**
 * Maps a Supabase menu_items row to the frontend MenuItem type.
 * The database has simpler fields, so we compute/default some frontend-specific fields.
 */
function mapDbToMenuItem(row: DbMenuItem): MenuItem {
  // Parse dietary info to set vegetarian/gluten-free flags
  const dietaryInfo = row.dietary_info || [];
  const isVegetarian = dietaryInfo.some((d) =>
    ['vegetarian', 'vegan', 'plant-based'].includes(d.toLowerCase())
  );
  const isGlutenFree = dietaryInfo.some((d) =>
    ['gluten-free', 'gf', 'gluten free'].includes(d.toLowerCase())
  );

  // Map database category to frontend category type
  const categoryMap: Record<string, MenuItemCategory> = {
    appetizer: 'appetizer',
    appetizers: 'appetizer',
    starter: 'appetizer',
    entree: 'entree',
    entrees: 'entree',
    main: 'entree',
    mains: 'entree',
    side: 'side',
    sides: 'side',
    dessert: 'dessert',
    desserts: 'dessert',
    drink: 'drink',
    drinks: 'drink',
    beverage: 'drink',
    beverages: 'drink',
  };

  const category: MenuItemCategory =
    categoryMap[(row.category || 'entree').toLowerCase()] || 'entree';

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: row.price || 0,
    category,
    imageUrl: row.image_url || '',
    portionSize: 'medium' as PortionSize, // Default - DB doesn't store this
    tags: dietaryInfo, // Use dietary info as tags
    popularity: row.is_popular ? 90 : 50, // Convert boolean to score
    isVegetarian,
    isGlutenFree,
    mealTime: ['any-time' as MealTime], // Default - DB doesn't store this
  };
}

export class MenuService {
  /**
   * Get restaurant menu from Supabase
   * Returns menu items sorted by popularity (popular items first), then by category
   *
   * @param restaurantId - ID of the restaurant
   * @returns Menu items sorted by popularity and category
   */
  static async getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('is_popular', { ascending: false })
          .order('category')
          .order('name');

        if (error) throw error;

        const menuItems = (data || []).map(mapDbToMenuItem);

        // Sort by category order, then by popularity
        return menuItems.sort((a, b) => {
          const categoryOrder: Record<string, number> = {
            appetizer: 1,
            entree: 2,
            side: 3,
            dessert: 4,
            drink: 5,
          };

          const categoryDiff = (categoryOrder[a.category] || 0) - (categoryOrder[b.category] || 0);
          if (categoryDiff !== 0) return categoryDiff;

          return b.popularity - a.popularity;
        });
      },
      () => {
        // Filter mock menu items by restaurantId if they have restaurant association
        // Otherwise return all menu items as a generic fallback
        const mockMenu = allMenuItems.filter((item) => {
          // Check if item has restaurantId association
          const itemRestaurantId = (item as any).restaurantId;
          if (itemRestaurantId) {
            return itemRestaurantId === restaurantId;
          }
          // Return items without restaurant association as fallback
          return true;
        });

        // Sort by category order, then by popularity
        return mockMenu.sort((a, b) => {
          const categoryOrder: Record<string, number> = {
            appetizer: 1,
            entree: 2,
            side: 3,
            dessert: 4,
            drink: 5,
          };

          const categoryDiff = (categoryOrder[a.category] || 0) - (categoryOrder[b.category] || 0);
          if (categoryDiff !== 0) return categoryDiff;

          return b.popularity - a.popularity;
        });
      },
      { operationName: 'getRestaurantMenu' }
    );

    return data;
  }

  /**
   * Generate AI-powered order suggestion
   * Creates a personalized menu suggestion based on party size, hunger level, and preferences
   *
   * @param restaurantId - ID of the restaurant
   * @param partySize - Number of people in the party
   * @param hungerLevel - How hungry the party is ('light', 'moderate', 'very-hungry')
   * @param mealTime - Time of meal ('breakfast', 'lunch', 'dinner', 'late-night', 'any-time')
   * @param dietaryRestrictions - Optional dietary restrictions array
   * @returns Order suggestion with selected items and reasoning
   */
  static async generateOrderSuggestion(
    restaurantId: string,
    partySize: number,
    hungerLevel: HungerLevel,
    mealTime: MealTime = 'any-time',
    dietaryRestrictions?: string[]
  ): Promise<OrderSuggestion> {
    await delay(300); // Slightly longer delay to simulate AI processing

    const menu = await this.getRestaurantMenu(restaurantId);

    if (menu.length === 0) {
      throw new Error('No menu available for this restaurant');
    }

    // Calculate "hunger points" based on party size and hunger level
    const hungerMultiplier = {
      light: 0.8,
      moderate: 1.2,
      'very-hungry': 1.8,
    }[hungerLevel];

    const basePointsPerPerson = 10;
    const totalHungerPoints = partySize * basePointsPerPerson * hungerMultiplier;

    // Define portion point values
    const portionPoints: Record<string, number> = {
      small: 5,
      medium: 10,
      large: 15,
      shareable: 12,
    };

    // Filter menu based on meal time and dietary restrictions
    let availableMenu = menu;

    // Filter by meal time
    if (mealTime !== 'any-time') {
      availableMenu = availableMenu.filter((item) => {
        if (!item.mealTime || item.mealTime.length === 0) {
          return true; // Include items without mealTime metadata
        }
        return item.mealTime.includes(mealTime) || item.mealTime.includes('any-time');
      });
    }

    // Filter by dietary restrictions
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      availableMenu = availableMenu.filter((item) => {
        if (dietaryRestrictions.includes('vegetarian') && !item.isVegetarian) {
          return false;
        }
        if (dietaryRestrictions.includes('gluten-free') && !item.isGlutenFree) {
          return false;
        }
        return true;
      });
    }

    // Separate items by category
    const appetizers = availableMenu.filter((i) => i.category === 'appetizer');
    const entrees = availableMenu.filter((i) => i.category === 'entree');
    const sides = availableMenu.filter((i) => i.category === 'side');
    const desserts = availableMenu.filter((i) => i.category === 'dessert');

    // Build the order
    const selectedItems: Array<MenuItem & { quantity: number }> = [];
    let currentPoints = 0;
    const reasoning: string[] = [];

    // Helper function to add items
    const addItem = (item: MenuItem, quantity: number = 1) => {
      selectedItems.push({ ...item, quantity });
      currentPoints += portionPoints[item.portionSize] * quantity;
    };

    // Strategy based on party size and hunger level
    if (partySize === 1) {
      // Solo dining
      if (hungerLevel === 'light') {
        // 1 appetizer or 1 entree
        if (Math.random() > 0.5 && appetizers.length > 0) {
          addItem(appetizers[0]);
          reasoning.push('Perfect light bite for one');
        } else if (entrees.length > 0) {
          addItem(entrees[0]);
          reasoning.push('A satisfying solo meal');
        }
      } else if (hungerLevel === 'moderate') {
        // 1 entree + maybe appetizer
        if (entrees.length > 0) addItem(entrees[0]);
        if (appetizers.length > 0 && currentPoints < totalHungerPoints * 0.8) {
          addItem(appetizers[0]);
        }
        reasoning.push('Great portions for one person');
      } else {
        // very-hungry: entree + appetizer + dessert
        if (appetizers.length > 0) addItem(appetizers[0]);
        if (entrees.length > 0) addItem(entrees[0]);
        if (desserts.length > 0) addItem(desserts[0]);
        reasoning.push('Satisfying meal for a big appetite');
      }
    } else if (partySize === 2) {
      // Couple or small group
      if (hungerLevel === 'light') {
        // Share 1 app + 2 entrees
        if (appetizers.length > 0) addItem(appetizers[0]);
        if (entrees.length >= 2) {
          addItem(entrees[0]);
          addItem(entrees[1]);
        }
        reasoning.push('Perfect for sharing');
      } else if (hungerLevel === 'moderate') {
        // 1-2 apps + 2 entrees
        if (appetizers.length > 0) addItem(appetizers[0]);
        if (appetizers.length > 1 && currentPoints < totalHungerPoints * 0.6) {
          addItem(appetizers[1]);
        }
        if (entrees.length >= 2) {
          addItem(entrees[0]);
          addItem(entrees[1]);
        }
        reasoning.push('Balanced sharing for two');
      } else {
        // very-hungry: 2 apps + 2 entrees + sides + dessert
        if (appetizers.length >= 2) {
          addItem(appetizers[0]);
          addItem(appetizers[1]);
        }
        if (entrees.length >= 2) {
          addItem(entrees[0]);
          addItem(entrees[1]);
        }
        if (sides.length > 0) addItem(sides[0]);
        if (desserts.length > 0) addItem(desserts[0]);
        reasoning.push('Feast for two hungry people');
      }
    } else {
      // Larger group (3+)
      const numApps = Math.min(appetizers.length, Math.ceil(partySize / 2));
      const numEntrees = Math.min(entrees.length, partySize);
      const numSides = Math.min(sides.length, Math.floor(partySize / 3));

      if (hungerLevel === 'light') {
        // Fewer apps and entrees
        for (let i = 0; i < Math.floor(numApps / 2); i++) {
          if (appetizers[i]) addItem(appetizers[i]);
        }
        for (let i = 0; i < Math.max(partySize - 1, 2); i++) {
          if (entrees[i]) addItem(entrees[i]);
        }
        reasoning.push('Light sharing for the group');
      } else if (hungerLevel === 'moderate') {
        // Standard group order
        for (let i = 0; i < numApps; i++) {
          if (appetizers[i]) addItem(appetizers[i]);
        }
        for (let i = 0; i < numEntrees; i++) {
          if (entrees[i]) addItem(entrees[i]);
        }
        for (let i = 0; i < Math.floor(numSides / 2); i++) {
          if (sides[i]) addItem(sides[i]);
        }
        reasoning.push('Family-style sharing');
      } else {
        // very-hungry: lots of everything
        for (let i = 0; i < numApps; i++) {
          if (appetizers[i]) addItem(appetizers[i]);
        }
        for (let i = 0; i < numEntrees; i++) {
          if (entrees[i]) addItem(entrees[i]);
        }
        for (let i = 0; i < numSides; i++) {
          if (sides[i]) addItem(sides[i]);
        }
        if (desserts.length > 0) {
          const numDesserts = Math.min(desserts.length, Math.ceil(partySize / 2));
          for (let i = 0; i < numDesserts; i++) {
            if (desserts[i]) addItem(desserts[i]);
          }
        }
        reasoning.push('Generous feast for a hungry group');
      }
    }

    // Calculate total price
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Add share-ability reasoning
    const estimatedSharability =
      partySize === 1
        ? 'Individual portions'
        : partySize === 2
          ? 'Easy to share between two'
          : partySize <= 4
            ? `Ideal for your group of ${partySize}`
            : `Feast for ${partySize} people`;

    // Add pricing reasoning
    const pricePerPerson = totalPrice / partySize;
    if (pricePerPerson < 30) {
      reasoning.push('Budget-friendly option');
    } else if (pricePerPerson > 60) {
      reasoning.push('Premium dining experience');
    }

    return {
      id: `suggestion-${Date.now()}`,
      restaurantId,
      partySize,
      hungerLevel,
      mealTime,
      items: selectedItems,
      totalPrice,
      reasoning,
      estimatedSharability,
    };
  }
}
