/**
 * TasteProfileService
 *
 * Manages user taste profile analytics including:
 * - Comprehensive taste profile with cuisine/city/country breakdowns
 * - Dining statistics and activity tracking
 * - Performance-optimized with single-loop aggregation
 */

import { mockRestaurants } from '@/data/mock/restaurants';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockUsers } from '@/data/mock/users';

import { delay } from '../base/BaseService';

import type {
  TasteProfileStats,
  CuisineBreakdown,
  CityBreakdown,
  CountryBreakdown,
  DiningLocation,
} from '@/types';


export class TasteProfileService {
  /**
   * Get comprehensive taste profile for a user
   * Analyzes dining history to provide cuisine preferences, city breakdown,
   * and activity statistics. Performance-optimized with single-loop aggregation.
   *
   * @param userId - ID of the user
   * @param days - Number of days to analyze for recent activity (default: 30)
   * @returns Comprehensive taste profile with breakdowns and statistics
   */
  static async getUserTasteProfile(userId: string, days: number = 30): Promise<TasteProfileStats> {
    await delay();

    // Get all user's "been" restaurants - use Set for O(1) lookup
    const userRelations = mockUserRestaurantRelations.filter(
      (rel) => rel.userId === userId && rel.status === 'been'
    );

    // Early return if no data
    if (userRelations.length === 0) {
      return {
        last30Days: {
          restaurantsCount: 0,
          cuisinesCount: 0,
          activityPercentile: 0,
          primaryLocation: 'Unknown',
        },
        cuisineBreakdown: [],
        cityBreakdown: [],
        countryBreakdown: [],
        diningLocations: [],
        totalRestaurants: 0,
        totalCities: 0,
        totalCountries: 0,
        totalCuisines: 0,
      };
    }

    const restaurantIdsSet = new Set(userRelations.map((rel) => rel.restaurantId));
    const restaurants = mockRestaurants.filter((r) => restaurantIdsSet.has(r.id));

    // Calculate last N days stats
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const recentRelations = userRelations.filter(
      (rel) => rel.visitDate && new Date(rel.visitDate) >= daysAgo
    );

    const recentRestaurantIdsSet = new Set(recentRelations.map((rel) => rel.restaurantId));
    const recentRestaurants = mockRestaurants.filter((r) => recentRestaurantIdsSet.has(r.id));

    const recentCuisines = new Set(recentRestaurants.flatMap((r) => r.cuisine));

    const user = mockUsers.find((u) => u.id === userId);
    const primaryLocation = user?.location.city || 'Unknown';

    // OPTIMIZED: Calculate all breakdowns in a single loop
    const cuisineMap = new Map<
      string,
      { count: number; totalScore: number; restaurantIds: string[] }
    >();
    const cityMap = new Map<
      string,
      { count: number; totalScore: number; restaurantIds: string[]; state?: string }
    >();
    const countryMap = new Map<
      string,
      { count: number; totalScore: number; restaurantIds: string[] }
    >();
    const cityLocationMap = new Map<string, DiningLocation>();

    // Single loop through restaurants - major performance improvement
    restaurants.forEach((restaurant) => {
      const restaurantId = restaurant.id;
      const rating = restaurant.rating;

      // Process cuisines - push instead of spread
      restaurant.cuisine.forEach((cuisine) => {
        let cuisineData = cuisineMap.get(cuisine);
        if (!cuisineData) {
          cuisineData = { count: 0, totalScore: 0, restaurantIds: [] };
          cuisineMap.set(cuisine, cuisineData);
        }
        cuisineData.count++;
        cuisineData.totalScore += rating;
        cuisineData.restaurantIds.push(restaurantId); // Push instead of spread
      });

      // Process cities - push instead of spread
      const cityKey = `${restaurant.location.city}, ${restaurant.location.state}`;
      let cityData = cityMap.get(cityKey);
      if (!cityData) {
        cityData = { count: 0, totalScore: 0, restaurantIds: [], state: restaurant.location.state };
        cityMap.set(cityKey, cityData);
      }
      cityData.count++;
      cityData.totalScore += rating;
      cityData.restaurantIds.push(restaurantId); // Push instead of spread

      // Process countries - push instead of spread
      const country = 'United States'; // Mock: assume all restaurants are in US
      let countryData = countryMap.get(country);
      if (!countryData) {
        countryData = { count: 0, totalScore: 0, restaurantIds: [] };
        countryMap.set(country, countryData);
      }
      countryData.count++;
      countryData.totalScore += rating;
      countryData.restaurantIds.push(restaurantId); // Push instead of spread

      // Process city locations - push instead of spread
      const cityKey2 = restaurant.location.city;
      let cityLocation = cityLocationMap.get(cityKey2);
      if (!cityLocation) {
        cityLocation = {
          city: restaurant.location.city,
          country: 'United States',
          state: restaurant.location.state,
          lat: restaurant.location.coordinates.lat,
          lng: restaurant.location.coordinates.lng,
          restaurantIds: [],
        };
        cityLocationMap.set(cityKey2, cityLocation);
      }
      cityLocation.restaurantIds.push(restaurantId); // Push instead of spread
    });

    // Convert maps to arrays (only once at the end)
    const cuisineBreakdown: CuisineBreakdown[] = Array.from(cuisineMap.entries()).map(
      ([cuisine, data]) => ({
        cuisine,
        count: data.count,
        avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
        restaurantIds: data.restaurantIds,
      })
    );

    const cityBreakdown: CityBreakdown[] = Array.from(cityMap.entries()).map(([city, data]) => ({
      city: city.split(',')[0].trim(),
      state: data.state,
      count: data.count,
      avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
      restaurantIds: data.restaurantIds,
    }));

    const countryBreakdown: CountryBreakdown[] = Array.from(countryMap.entries()).map(
      ([country, data]) => ({
        country,
        count: data.count,
        avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
        restaurantIds: data.restaurantIds,
      })
    );

    const diningLocations: DiningLocation[] = Array.from(cityLocationMap.values());

    return {
      last30Days: {
        restaurantsCount: recentRestaurants.length,
        cuisinesCount: recentCuisines.size,
        activityPercentile: 96, // Mock: "Top 4%"
        primaryLocation,
      },
      cuisineBreakdown,
      cityBreakdown,
      countryBreakdown,
      diningLocations,
      totalRestaurants: restaurants.length,
      totalCities: cityMap.size,
      totalCountries: countryMap.size,
      totalCuisines: cuisineMap.size,
    };
  }
}
