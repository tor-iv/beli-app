import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';
import { Notification } from '@/types';

/**
 * Hook to fetch notifications with auto-refresh
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => MockDataService.getNotifications(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 30000, // Consider data stale after 30 seconds (matches refetchInterval)
  });
}

/**
 * Hook to get unread notification count for badge
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => MockDataService.getUnreadNotificationCount(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 30000, // Consider data stale after 30 seconds (matches refetchInterval)
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      MockDataService.markNotificationAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);

      // Optimistically update to the new value
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          ['notifications'],
          previousNotifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousNotifications };
    },
    onError: (_err, _notificationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => MockDataService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}
