/**
 * NotificationService
 *
 * Manages user notifications including:
 * - Fetching notifications
 * - Marking as read
 * - Notification preferences
 *
 * Ported from beli-web with React Native adaptations.
 */

import { withFallback } from '../../data-provider';
import { delay, DEMO_USER_ID } from '../base/BaseService';
import type { Notification } from '../../../types';

// Import notifications if available
let mockNotifications: Notification[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const notifModule = require('../../../data/mock/notifications');
  mockNotifications = notifModule.mockNotifications || [];
} catch {
  // Module may not exist yet
}

// Re-export the Notification type
export type { Notification } from '../../../types';

// Lazy import supabase
const getSupabase = async () => {
  const { getSupabase: getSupa } = await import('../../supabase/client');
  return getSupa();
};

export class NotificationService {
  /**
   * Get all notifications for a user
   */
  static async getNotifications(userId?: string, limit: number = 50): Promise<Notification[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data as unknown as Notification[];
      },
      async () => {
        await delay();
        // Return all mock notifications sorted by timestamp
        return [...mockNotifications]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      },
      { operationName: 'getNotifications' }
    );

    return data;
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(userId?: string): Promise<number> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId)
          .eq('is_read', false);

        if (error) throw error;
        return count || 0;
      },
      async () => {
        await delay();
        return mockNotifications.filter((n) => !n.isRead).length;
      },
      { operationName: 'getUnreadCount' }
    );

    return data;
  }

  /**
   * Get unread notifications
   */
  static async getUnreadNotifications(userId?: string): Promise<Notification[]> {
    const { data } = await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('is_read', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as unknown as Notification[];
      },
      async () => {
        await delay();
        return mockNotifications
          .filter((n) => !n.isRead)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },
      { operationName: 'getUnreadNotifications' }
    );

    return data;
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) throw error;
      },
      async () => {
        await delay();
        const notification = mockNotifications.find((n) => n.id === notificationId);
        if (notification) {
          (notification as { isRead: boolean }).isRead = true;
        }
      },
      { operationName: 'markAsRead' }
    );
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId?: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();
        const targetUserId = userId || DEMO_USER_ID;

        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', targetUserId)
          .eq('is_read', false);

        if (error) throw error;
      },
      async () => {
        await delay();
        mockNotifications.forEach((n) => {
          (n as { isRead: boolean }).isRead = true;
        });
      },
      { operationName: 'markAllAsRead' }
    );
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    await withFallback(
      async () => {
        const supabase = await getSupabase();

        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) throw error;
      },
      async () => {
        await delay();
        const index = mockNotifications.findIndex((n) => n.id === notificationId);
        if (index !== -1) {
          mockNotifications.splice(index, 1);
        }
      },
      { operationName: 'deleteNotification' }
    );
  }

  /**
   * Get notifications by type
   */
  static async getNotificationsByType(
    userId: string,
    type: Notification['type']
  ): Promise<Notification[]> {
    const allNotifications = await this.getNotifications(userId);
    return allNotifications.filter((n) => n.type === type);
  }
}
