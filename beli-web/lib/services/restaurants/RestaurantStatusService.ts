/**
 * RestaurantStatusService
 *
 * Utilities for restaurant status and hours including:
 * - Parsing restaurant hours
 * - Checking if restaurant is open
 * - Getting closing times
 * - Filtering restaurants with status information
 */

import { delay } from '../base/BaseService';
import { mockRestaurants } from '@/data/mock/restaurants';
import { Restaurant } from '@/types';

export class RestaurantStatusService {
  /**
   * Parse hours string into numeric open/close times
   * @param hoursString - Hours string like "7:30 AM - 12:00 AM"
   * @returns Object with open and close times in decimal hours, or null if closed
   */
  static parseHours(hoursString: string): { open: number; close: number } | null {
    if (hoursString.toLowerCase() === 'closed') {
      return null;
    }

    // Parse hours like "7:30 AM - 12:00 AM" or "11:00 AM - 11:00 PM"
    const match = hoursString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    const [, openHour, openMin, openAmPm, closeHour, closeMin, closeAmPm] = match;

    let openTime = parseInt(openHour) + (parseInt(openMin) / 60);
    let closeTime = parseInt(closeHour) + (parseInt(closeMin) / 60);

    if (openAmPm.toUpperCase() === 'PM' && parseInt(openHour) !== 12) {
      openTime += 12;
    }
    if (openAmPm.toUpperCase() === 'AM' && parseInt(openHour) === 12) {
      openTime = parseInt(openMin) / 60;
    }

    if (closeAmPm.toUpperCase() === 'PM' && parseInt(closeHour) !== 12) {
      closeTime += 12;
    }
    if (closeAmPm.toUpperCase() === 'AM' && parseInt(closeHour) === 12) {
      closeTime = parseInt(closeMin) / 60;
    }

    // Handle overnight hours (e.g., 11 PM - 3 AM)
    if (closeTime < openTime) {
      closeTime += 24;
    }

    return { open: openTime, close: closeTime };
  }

  /**
   * Check if a restaurant is currently open
   * @param restaurant - Restaurant to check
   * @param currentTime - Optional time to check (defaults to now)
   * @returns True if restaurant is open
   */
  static isRestaurantOpen(restaurant: Restaurant, currentTime?: Date): boolean {
    if (!restaurant.hours) return false;
    const now = currentTime || new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const currentDay = dayNames[now.getDay()];
    const currentHour = now.getHours() + (now.getMinutes() / 60);

    const todayHours = restaurant.hours[currentDay];
    const parsedHours = this.parseHours(todayHours);

    if (!parsedHours) return false;

    // Handle overnight restaurants
    if (parsedHours.close > 24) {
      return currentHour >= parsedHours.open || currentHour <= (parsedHours.close - 24);
    }

    return currentHour >= parsedHours.open && currentHour <= parsedHours.close;
  }

  /**
   * Get the closing time for a restaurant
   * @param restaurant - Restaurant to check
   * @param currentTime - Optional time to check (defaults to now)
   * @returns Formatted closing time string or null if no hours
   */
  static getClosingTime(restaurant: Restaurant, currentTime?: Date): string | null {
    if (!restaurant.hours) return null;
    const now = currentTime || new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const currentDay = dayNames[now.getDay()];

    const todayHours = restaurant.hours[currentDay];
    const parsedHours = this.parseHours(todayHours);

    if (!parsedHours) return null;

    let closeHour = parsedHours.close;
    if (closeHour > 24) closeHour -= 24;

    const hour = Math.floor(closeHour);
    const minute = Math.round((closeHour - hour) * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  /**
   * Get restaurants with status information and filtering
   * Enriches restaurant data with isOpen, closingTime, and acceptsReservations
   * Supports filtering and sorting
   *
   * @param restaurantIds - Array of restaurant IDs to include
   * @param filters - Optional filters (openNow, acceptsReservations, sortBy)
   * @returns Restaurants with status information
   */
  static async getRestaurantsWithStatus(
    restaurantIds: string[],
    filters?: {
      openNow?: boolean;
      acceptsReservations?: boolean;
      sortBy?: 'rating' | 'distance' | 'name';
    }
  ): Promise<Restaurant[]> {
    await delay();

    let restaurants = mockRestaurants.filter(r => restaurantIds.includes(r.id));

    // Add status information
    restaurants = restaurants.map(restaurant => ({
      ...restaurant,
      isOpen: this.isRestaurantOpen(restaurant),
      closingTime: this.getClosingTime(restaurant),
      acceptsReservations: Math.random() > 0.3, // Mock: 70% accept reservations
    }));

    // Apply filters
    if (filters?.openNow) {
      restaurants = restaurants.filter(r => r.isOpen);
    }

    if (filters?.acceptsReservations) {
      restaurants = restaurants.filter(r => r.acceptsReservations);
    }

    // Apply sorting
    if (filters?.sortBy === 'rating') {
      restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters?.sortBy === 'distance') {
      restaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (filters?.sortBy === 'name') {
      restaurants.sort((a, b) => a.name.localeCompare(b.name));
    }

    return restaurants;
  }
}
