/**
 * GroupDinnerService
 *
 * Manages group dining functionality:
 * - Restaurant suggestions based on group preferences
 * - Match scoring algorithm
 * - Swipe-based selection
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import { mockRestaurants } from '../../../data/mock/restaurants';
import { delay } from '../base/BaseService';
import type { Restaurant, User } from '../../../types';

export interface GroupDinnerSession {
  id: string;
  participants: GroupParticipant[];
  suggestions: GroupSuggestion[];
  matches: GroupMatch[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface GroupParticipant {
  userId: string;
  displayName: string;
  avatar?: string;
  preferences: {
    cuisineTypes: string[];
    priceRange: [number, number];
    distance?: number;
    dietaryRestrictions?: string[];
  };
  swipes: Record<string, 'like' | 'dislike'>;
}

export interface GroupSuggestion {
  restaurant: Restaurant;
  matchScore: number;
  matchBreakdown: {
    cuisineMatch: number;
    priceMatch: number;
    ratingMatch: number;
    locationMatch: number;
    dietaryMatch: number;
    popularityMatch: number;
  };
}

export interface GroupMatch {
  restaurant: Restaurant;
  matchScore: number;
  likedBy: string[];
}

// 6-factor match algorithm weights
const MATCH_WEIGHTS = {
  cuisineMatch: 0.25,
  priceMatch: 0.20,
  ratingMatch: 0.20,
  locationMatch: 0.15,
  dietaryMatch: 0.10,
  popularityMatch: 0.10,
};

export class GroupDinnerService {
  /**
   * Create a new group dinner session
   */
  static async createSession(participants: GroupParticipant[]): Promise<GroupDinnerSession> {
    const session: GroupDinnerSession = {
      id: Math.random().toString(36).substring(2),
      participants,
      suggestions: [],
      matches: [],
      status: 'active',
      createdAt: new Date(),
    };

    // Generate suggestions based on participants
    session.suggestions = await this.generateSuggestions(participants);

    return session;
  }

  /**
   * Generate restaurant suggestions for a group
   */
  static async generateSuggestions(
    participants: GroupParticipant[],
    limit: number = 20
  ): Promise<GroupSuggestion[]> {
    const { data } = await withFallback(
      async () => {
        // Supabase implementation would go here
        throw new Error('Not implemented');
      },
      async () => {
        await delay();

        // Get aggregate preferences
        const aggregatePrefs = this.aggregatePreferences(participants);

        // Score each restaurant
        const suggestions = mockRestaurants.map((restaurant) => {
          const breakdown = this.calculateMatchBreakdown(restaurant, aggregatePrefs, participants);
          const matchScore = this.calculateOverallScore(breakdown);

          return {
            restaurant,
            matchScore,
            matchBreakdown: breakdown,
          };
        });

        // Sort by match score and return top results
        return suggestions.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
      },
      { operationName: 'generateSuggestions' }
    );

    return data;
  }

  /**
   * Record a swipe for a participant
   */
  static async recordSwipe(
    sessionId: string,
    participantId: string,
    restaurantId: string,
    swipe: 'like' | 'dislike'
  ): Promise<GroupMatch | null> {
    await delay();

    // In a real implementation, this would update the session in the database
    // and check if all participants have swiped right on the same restaurant

    // For now, return null (no match)
    return null;
  }

  /**
   * Check if a restaurant is a match (all participants liked it)
   */
  static checkForMatch(session: GroupDinnerSession, restaurantId: string): GroupMatch | null {
    const likedBy = session.participants
      .filter((p) => p.swipes[restaurantId] === 'like')
      .map((p) => p.userId);

    // All participants must have swiped
    const allSwiped = session.participants.every((p) => restaurantId in p.swipes);

    if (allSwiped && likedBy.length === session.participants.length) {
      const suggestion = session.suggestions.find((s) => s.restaurant.id === restaurantId);
      if (suggestion) {
        return {
          restaurant: suggestion.restaurant,
          matchScore: suggestion.matchScore,
          likedBy,
        };
      }
    }

    return null;
  }

  /**
   * Get the top restaurant matches for a group
   */
  static async getTopMatches(
    participants: GroupParticipant[],
    limit: number = 5
  ): Promise<GroupSuggestion[]> {
    const suggestions = await this.generateSuggestions(participants, limit * 2);
    return suggestions.slice(0, limit);
  }

  /**
   * Calculate aggregate preferences from all participants
   */
  private static aggregatePreferences(participants: GroupParticipant[]): AggregatePreferences {
    const allCuisines = new Set<string>();
    const allDietary = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;
    let avgDistance = 0;

    participants.forEach((p) => {
      p.preferences.cuisineTypes.forEach((c) => allCuisines.add(c));
      p.preferences.dietaryRestrictions?.forEach((d) => allDietary.add(d));
      minPrice = Math.min(minPrice, p.preferences.priceRange[0]);
      maxPrice = Math.max(maxPrice, p.preferences.priceRange[1]);
      avgDistance += p.preferences.distance || 5;
    });

    return {
      cuisineTypes: Array.from(allCuisines),
      dietaryRestrictions: Array.from(allDietary),
      priceRange: [minPrice, maxPrice],
      maxDistance: avgDistance / participants.length,
    };
  }

  /**
   * Convert priceRange string ("$", "$$", etc.) to numeric level (1-4)
   */
  private static priceRangeToLevel(priceRange: string): number {
    const levels: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
    return levels[priceRange] || 2;
  }

  /**
   * Calculate match breakdown for a restaurant
   */
  private static calculateMatchBreakdown(
    restaurant: Restaurant,
    prefs: AggregatePreferences,
    participants: GroupParticipant[]
  ): GroupSuggestion['matchBreakdown'] {
    // Cuisine match - check if any of the restaurant's cuisines match user preferences
    const cuisineMatch = restaurant.cuisine.some((c) => prefs.cuisineTypes.includes(c)) ? 100 : 50;

    // Price match - convert priceRange string to numeric level
    const avgPrice = this.priceRangeToLevel(restaurant.priceRange);
    const [minPrice, maxPrice] = prefs.priceRange;
    const priceMatch = avgPrice >= minPrice && avgPrice <= maxPrice ? 100 : 60;

    // Rating match (higher is better)
    const ratingMatch = Math.min(100, (restaurant.rating / 10) * 100);

    // Location match (simplified - assume all restaurants are within range)
    const locationMatch = 80;

    // Dietary match
    let dietaryMatch = 100;
    if (prefs.dietaryRestrictions.length > 0) {
      // Simplified check - check if restaurant has vegetarian/vegan cuisine options
      const hasDietaryOption = restaurant.cuisine.some(
        (c) => c.toLowerCase().includes('vegetarian') || c.toLowerCase().includes('vegan')
      );
      dietaryMatch = hasDietaryOption ? 100 : 70;
    }

    // Popularity match (based on review count or similar metric)
    const popularityMatch = 75;

    return {
      cuisineMatch,
      priceMatch,
      ratingMatch,
      locationMatch,
      dietaryMatch,
      popularityMatch,
    };
  }

  /**
   * Calculate overall match score from breakdown
   */
  private static calculateOverallScore(breakdown: GroupSuggestion['matchBreakdown']): number {
    return Math.round(
      breakdown.cuisineMatch * MATCH_WEIGHTS.cuisineMatch +
        breakdown.priceMatch * MATCH_WEIGHTS.priceMatch +
        breakdown.ratingMatch * MATCH_WEIGHTS.ratingMatch +
        breakdown.locationMatch * MATCH_WEIGHTS.locationMatch +
        breakdown.dietaryMatch * MATCH_WEIGHTS.dietaryMatch +
        breakdown.popularityMatch * MATCH_WEIGHTS.popularityMatch
    );
  }

  /**
   * Get suggested friends for a user (for group dinner invitation)
   */
  static async getSuggestedFriends(userId: string): Promise<User[]> {
    // This would typically call UserService.getUserFriends
    // For now, return empty array as this needs integration
    await delay();
    return [];
  }
}

interface AggregatePreferences {
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  priceRange: [number, number];
  maxDistance: number;
}
