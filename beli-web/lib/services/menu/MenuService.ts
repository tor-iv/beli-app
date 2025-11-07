/**
 * MenuService
 *
 * Manages restaurant menus and AI-powered order suggestions including:
 * - Fetching restaurant menus
 * - Generating personalized order suggestions based on party size, hunger level, dietary restrictions
 */

import { delay } from '../base/BaseService';
import { allMenuItems, restaurantMenus } from '@/data/mock/menuItems';
import { MenuItem, OrderSuggestion, HungerLevel, MealTime } from '@/types';

export class MenuService {
  /**
   * Get restaurant menu
   * Returns menu items sorted by category and popularity
   *
   * @param restaurantId - ID of the restaurant
   * @returns Menu items sorted by category, then by popularity
   */
  static async getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    await delay();

    const menuItemIds = restaurantMenus[restaurantId] || [];
    const menu = allMenuItems.filter(item => menuItemIds.includes(item.id));

    // Sort by category, then by popularity
    return menu.sort((a, b) => {
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
      'light': 0.8,
      'moderate': 1.2,
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
      availableMenu = availableMenu.filter(item => {
        if (!item.mealTime || item.mealTime.length === 0) {
          return true; // Include items without mealTime metadata
        }
        return item.mealTime.includes(mealTime) || item.mealTime.includes('any-time');
      });
    }

    // Filter by dietary restrictions
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      availableMenu = availableMenu.filter(item => {
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
    const appetizers = availableMenu.filter(i => i.category === 'appetizer');
    const entrees = availableMenu.filter(i => i.category === 'entree');
    const sides = availableMenu.filter(i => i.category === 'side');
    const desserts = availableMenu.filter(i => i.category === 'dessert');
    const drinks = availableMenu.filter(i => i.category === 'drink');

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
    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Add share-ability reasoning
    const estimatedSharability = partySize === 1
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
