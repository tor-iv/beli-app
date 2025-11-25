/**
 * GroupDinnerService
 *
 * Manages group dining features including:
 * - Friend and companion management
 * - Restaurant availability checking
 * - AI-powered group dinner matching algorithm
 * - Complex scoring based on want-to-try overlap, dietary restrictions, and location
 * - Reservation management (claiming, sharing, reminders)
 *
 * NOTE: Reservation functionality (claim, share, reminders) was merged from ReservationService.
 */

import { mockRestaurants } from '@/data/mock/restaurants';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockUsers } from '@/data/mock/users';
import {
  mockReservations,
  getUserPriorityLevel,
  getAvailableReservations,
  getClaimedReservationsByUser,
  getSharedReservationsByUser,
  getReservationReminders,
} from '@/data/mock/reservations';

import { delay } from '../base/BaseService';

import type { User, GroupDinnerMatch, ListCategory, Reservation, ReservationPriorityLevel } from '@/types';


export class GroupDinnerService {
  /**
   * Get user's friends list
   * Returns a simplified list of potential dining companions
   *
   * @param userId - ID of the user
   * @returns Array of friend users (currently returns first 10 non-self users)
   */
  static async getUserFriends(userId: string): Promise<User[]> {
    await delay();
    // Return users who the current user is following (simplified)
    // In a real app, this would be a proper friends/following relationship
    return mockUsers.filter((u) => u.id !== userId).slice(0, 10);
  }

  /**
   * Get recent dining companions
   * Returns users who have recently dined with the given user
   *
   * @param userId - ID of the user
   * @returns Array of recent dining companions (currently returns first 5 non-self users)
   */
  static async getRecentDiningCompanions(userId: string): Promise<User[]> {
    await delay();
    // For now, return a subset of friends
    // In a real app, this would track who you've actually dined with
    return mockUsers.filter((u) => u.id !== userId).slice(0, 5);
  }

  /**
   * Check restaurant availability
   * Mock implementation that simulates checking reservation availability
   *
   * @param restaurantId - ID of the restaurant
   * @param date - Date to check availability for
   * @returns Availability status and potential time slot
   */
  static async getRestaurantAvailability(
    restaurantId: string,
    date: Date
  ): Promise<{ available: boolean; timeSlot?: string }> {
    await delay();
    // Mock availability - in reality this would check reservation system
    const randomAvailable = Math.random() > 0.3; // 70% chance of availability
    const timeSlots = ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];
    const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

    return {
      available: randomAvailable,
      timeSlot: randomAvailable ? randomSlot : undefined,
    };
  }

  /**
   * Get group dinner suggestions
   * AI-powered matching algorithm that finds best restaurants for group dining
   * based on want-to-try overlap, dietary restrictions, and location convenience
   *
   * Scoring algorithm:
   * - Want-to-try overlap: 70% weight
   * - Dietary compatibility: 20% weight
   * - Location convenience: 10% weight
   *
   * @param userId - ID of the user organizing the dinner
   * @param participantIds - Optional array of participant user IDs
   * @param category - Optional category filter
   * @returns Array of restaurant matches sorted by score (highest first)
   */
  static async getGroupDinnerSuggestions(
    userId: string,
    participantIds?: string[],
    category?: ListCategory
  ): Promise<GroupDinnerMatch[]> {
    await delay();

    const isGroup = participantIds && participantIds.length > 0;
    const allUserIds = isGroup ? [userId, ...participantIds] : [userId];

    // Get want-to-try restaurants for all participants
    const wantToTryRelations = mockUserRestaurantRelations.filter(
      (rel) => allUserIds.includes(rel.userId) && rel.status === 'want_to_try'
    );

    // Get restaurants that have been visited recently (to filter out)
    const recentlyVisited = mockUserRestaurantRelations
      .filter(
        (rel) =>
          allUserIds.includes(rel.userId) &&
          rel.status === 'been' &&
          rel.visitDate &&
          new Date().getTime() - new Date(rel.visitDate).getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
      )
      .map((rel) => rel.restaurantId);

    // Get all users for dietary restrictions
    const users = mockUsers.filter((u) => allUserIds.includes(u.id));
    const allDietaryRestrictions = users.flatMap((u) => u.dietaryRestrictions || []);

    // Count how many people have each restaurant on their want-to-try list
    const restaurantCounts = new Map<string, { count: number; userIds: string[] }>();

    wantToTryRelations.forEach((rel) => {
      const existing = restaurantCounts.get(rel.restaurantId) || { count: 0, userIds: [] };
      restaurantCounts.set(rel.restaurantId, {
        count: existing.count + 1,
        userIds: [...existing.userIds, rel.userId],
      });
    });

    // Build scored matches
    const matches: GroupDinnerMatch[] = [];

    for (const [restaurantId, data] of Array.from(restaurantCounts.entries())) {
      // Skip recently visited
      if (recentlyVisited.includes(restaurantId)) continue;

      const restaurant = mockRestaurants.find((r) => r.id === restaurantId);
      if (!restaurant) continue;

      // Filter by category if specified
      if (category && restaurant.category !== category) continue;

      // Calculate score
      let score = 0;
      const matchReasons: string[] = [];

      // Want-to-try overlap (70% weight)
      const overlapRatio = data.count / allUserIds.length;
      const wantToTryScore = overlapRatio * 70;
      score += wantToTryScore;

      if (data.count === allUserIds.length) {
        matchReasons.push('Everyone wants to try this!');
      } else if (data.count > 1) {
        matchReasons.push(`On ${data.count} want-to-try lists`);
      } else {
        matchReasons.push('On your want-to-try list');
      }

      // Dietary compatibility (20% weight)
      // For simplicity, assume all restaurants can accommodate dietary restrictions in mock
      const dietaryScore = 20;
      score += dietaryScore;
      if (allDietaryRestrictions.length > 0) {
        matchReasons.push('Accommodates dietary restrictions');
      }

      // Location convenience (10% weight)
      // In real app, would calculate distance from participants
      const locationScore = restaurant.distance ? Math.max(0, 10 - restaurant.distance) : 10;
      score += locationScore;
      if (restaurant.distance && restaurant.distance < 2) {
        matchReasons.push('Nearby location');
      }

      // Get availability
      const availability = await this.getRestaurantAvailability(restaurantId, new Date());

      matches.push({
        restaurant,
        score: Math.round(score),
        onListsCount: data.count,
        participants: data.userIds,
        matchReasons,
        availability: availability.available
          ? {
              date: new Date().toLocaleDateString(),
              timeSlot: availability.timeSlot || 'Various times',
            }
          : undefined,
      });
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  // ============================================
  // Reservation Methods (merged from ReservationService)
  // ============================================

  /**
   * Get user's reservations with optional filtering
   * @param userId - ID of the user
   * @param filter - Optional filter: 'available', 'claimed', or 'shared'
   * @returns Filtered reservations
   */
  static async getUserReservations(
    userId: string,
    filter?: 'available' | 'claimed' | 'shared'
  ): Promise<Reservation[]> {
    await delay();

    if (filter === 'available') {
      return getAvailableReservations();
    } else if (filter === 'claimed') {
      return getClaimedReservationsByUser(userId);
    } else if (filter === 'shared') {
      return getSharedReservationsByUser(userId);
    }

    // Return all user's reservations (owned, claimed, or shared)
    return mockReservations.filter(
      (r) => r.userId === userId || r.claimedBy === userId || r.sharedWith?.includes(userId)
    );
  }

  /**
   * Get all available reservations
   * @returns Available reservations
   */
  static async getAvailableReservations(): Promise<Reservation[]> {
    await delay();
    return getAvailableReservations();
  }

  /**
   * Get reservations claimed by a user
   * @param userId - ID of the user
   * @returns Claimed reservations
   */
  static async getClaimedReservations(userId: string): Promise<Reservation[]> {
    await delay();
    return getClaimedReservationsByUser(userId);
  }

  /**
   * Get reservations shared with a user
   * @param userId - ID of the user
   * @returns Shared reservations
   */
  static async getSharedReservations(userId: string): Promise<Reservation[]> {
    await delay();
    return getSharedReservationsByUser(userId);
  }

  /**
   * Claim an available reservation
   * @param reservationId - ID of the reservation to claim
   * @param userId - ID of the user claiming the reservation
   * @returns True if successfully claimed
   */
  static async claimReservation(reservationId: string, userId: string): Promise<boolean> {
    await delay();

    const reservation = mockReservations.find((r) => r.id === reservationId);
    if (!reservation || reservation.status !== 'available') {
      return false;
    }

    reservation.status = 'claimed';
    reservation.claimedBy = userId;
    return true;
  }

  /**
   * Share a reservation with other users
   * @param reservationId - ID of the reservation to share
   * @param recipientUserIds - Array of user IDs to share with
   * @returns True if successfully shared
   */
  static async shareReservation(
    reservationId: string,
    recipientUserIds: string[]
  ): Promise<boolean> {
    await delay();

    const reservation = mockReservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return false;
    }

    reservation.status = 'shared';
    reservation.sharedWith = recipientUserIds;
    return true;
  }

  /**
   * Cancel a reservation share
   * @param reservationId - ID of the reservation to cancel
   * @returns True if successfully cancelled
   */
  static async cancelReservationShare(reservationId: string): Promise<boolean> {
    await delay();

    const reservation = mockReservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return false;
    }

    reservation.status = 'cancelled';
    return true;
  }

  /**
   * Get user's reservation priority level
   * @param userId - ID of the user
   * @returns User's priority level
   */
  static async getUserReservationPriority(userId: string): Promise<ReservationPriorityLevel> {
    await delay();
    return getUserPriorityLevel(userId);
  }

  /**
   * Get upcoming reservation reminders for a user
   * @param userId - ID of the user
   * @returns Upcoming reservations
   */
  static async getReservationReminders(userId: string): Promise<Reservation[]> {
    await delay();
    return getReservationReminders(userId);
  }

  /**
   * Get a reservation by ID
   * @param reservationId - ID of the reservation
   * @returns Reservation or null if not found
   */
  static async getReservationById(reservationId: string): Promise<Reservation | null> {
    await delay();
    return mockReservations.find((r) => r.id === reservationId) || null;
  }
}
