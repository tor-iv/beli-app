/**
 * Notification Hooks
 *
 * React Query hooks for user notifications.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService, Notification } from '../services/notifications/NotificationService';

/**
 * Get all notifications for current user
 */
export function useNotifications(userId?: string, limit: number = 50) {
  return useQuery({
    queryKey: ['notifications', userId, limit],
    queryFn: () => NotificationService.getNotifications(userId, limit),
    staleTime: 1 * 60 * 1000, // Notifications should be relatively fresh
    refetchInterval: 60 * 1000, // Poll every minute
  });
}

/**
 * Get unread notifications count
 */
export function useUnreadCount(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId, 'unread-count'],
    queryFn: () => NotificationService.getUnreadCount(userId),
    staleTime: 30 * 1000, // Refresh more frequently
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}

/**
 * Get unread notifications
 */
export function useUnreadNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId, 'unread'],
    queryFn: () => NotificationService.getUnreadNotifications(userId),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Get notifications by type
 */
export function useNotificationsByType(userId: string | undefined, type: Notification['type']) {
  return useQuery({
    queryKey: ['notifications', userId, 'type', type],
    queryFn: () => NotificationService.getNotificationsByType(userId!, type),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Mark notification as read mutation
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Update in all notification lists
      queryClient.setQueriesData<Notification[]>(
        { queryKey: ['notifications'] },
        (old) =>
          old?.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Mark all notifications as read mutation
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId?: string) => NotificationService.markAllAsRead(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Optimistically mark all as read
      queryClient.setQueriesData<Notification[]>(
        { queryKey: ['notifications'] },
        (old) => old?.map((n) => ({ ...n, isRead: true }))
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Delete notification mutation
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.deleteNotification(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Remove from all notification lists
      queryClient.setQueriesData<Notification[]>(
        { queryKey: ['notifications'] },
        (old) => old?.filter((n) => n.id !== notificationId)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Re-export types
export type { Notification };
