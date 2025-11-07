/**
 * NotificationService
 *
 * Handles user notifications including:
 * - Fetching notifications
 * - Marking notifications as read
 * - Getting unread counts
 */

import { delay } from '../base/BaseService';
import { mockNotifications } from '@/data/mock/notifications';
import { Notification } from '@/types';

export class NotificationService {
  /**
   * Get all notifications for the current user
   * @returns Notifications sorted by timestamp (newest first)
   */
  static async getNotifications(): Promise<Notification[]> {
    await delay();
    // Return notifications sorted by timestamp (newest first)
    return [...mockNotifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Mark a specific notification as read
   * @param notificationId - ID of the notification to mark as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await delay();
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(): Promise<void> {
    await delay();
    mockNotifications.forEach(n => (n.isRead = true));
  }

  /**
   * Get count of unread notifications
   * @returns Number of unread notifications
   */
  static async getUnreadNotificationCount(): Promise<number> {
    await delay();
    return mockNotifications.filter(n => !n.isRead).length;
  }
}
