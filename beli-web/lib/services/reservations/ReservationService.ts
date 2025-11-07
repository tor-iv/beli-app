/**
 * ReservationService
 *
 * Manages restaurant reservations including:
 * - Fetching user reservations with filters
 * - Claiming and sharing reservations
 * - Reservation priority levels
 * - Reservation reminders
 */

import {
  mockReservations,
  getUserPriorityLevel,
  getAvailableReservations,
  getClaimedReservationsByUser,
  getSharedReservationsByUser,
  getReservationReminders,
} from '@/data/mock/reservations';

import { delay } from '../base/BaseService';

import type { Reservation, ReservationPriorityLevel } from '@/types';


export class ReservationService {
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

    const reservations = mockReservations;

    if (filter === 'available') {
      return getAvailableReservations();
    } else if (filter === 'claimed') {
      return getClaimedReservationsByUser(userId);
    } else if (filter === 'shared') {
      return getSharedReservationsByUser(userId);
    }

    // Return all user's reservations (owned, claimed, or shared)
    return reservations.filter(
      (r) => r.userId === userId || r.claimedBy === userId || r.sharedWith?.includes(userId)
    );
  }

  /**
   * Get all available reservations
   * Returns reservations that can be claimed
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
   * Changes reservation status from 'available' to 'claimed'
   *
   * @param reservationId - ID of the reservation to claim
   * @param userId - ID of the user claiming the reservation
   * @returns True if successfully claimed, false otherwise
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
   * Changes reservation status to 'shared'
   *
   * @param reservationId - ID of the reservation to share
   * @param recipientUserIds - Array of user IDs to share with
   * @returns True if successfully shared, false otherwise
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
   * Changes reservation status to 'cancelled'
   *
   * @param reservationId - ID of the reservation to cancel
   * @returns True if successfully cancelled, false otherwise
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
   * Determines priority access to exclusive reservations
   *
   * @param userId - ID of the user
   * @returns User's priority level
   */
  static async getUserReservationPriority(userId: string): Promise<ReservationPriorityLevel> {
    await delay();
    return getUserPriorityLevel(userId);
  }

  /**
   * Get upcoming reservation reminders for a user
   * Returns reservations that are coming up soon
   *
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
