'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { NotificationListItem } from '@/components/social/notification-list-item';
import { useNotifications, useMarkNotificationAsRead } from '@/lib/hooks';

import type { Notification } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    if (
      notification.type === 'rating_liked' ||
      notification.type === 'bookmark_liked' ||
      notification.type === 'comment' ||
      notification.type === 'list_bookmark'
    ) {
      if (notification.targetRestaurant) {
        router.push(`/restaurant/${notification.targetRestaurant.id}`);
      }
    } else if (notification.type === 'follow') {
      // Navigate to user profile (when implemented)
      if (notification.actorUser) {
        router.push(`/profile/${notification.actorUser.username}`);
      }
    }
    // streak notifications don't navigate anywhere
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex h-11 items-center justify-between bg-white px-2">
          <button
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="h-7 w-7 text-black" />
          </button>
          <h1 className="text-[20px] font-bold text-black">Notifications</h1>
          <div className="w-11" /> {/* Spacer for symmetry */}
        </div>

        {/* Loading state */}
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0A6C70] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 flex h-11 items-center justify-between bg-white px-2 lg:hidden">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft className="h-7 w-7 text-black" />
        </button>
        <h1 className="text-[20px] font-bold text-black">Notifications</h1>
        <div className="w-11" /> {/* Spacer for symmetry */}
      </div>

      {/* Desktop Header */}
      <div className="hidden border-b border-[#E5E5EA] bg-white lg:block">
        <div className="mx-auto flex h-11 max-w-3xl items-center justify-between px-2">
          <button
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="h-7 w-7 text-black" />
          </button>
          <h1 className="text-[20px] font-bold text-black">Notifications</h1>
          <div className="w-11" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Content Container */}
      <div className="lg:mx-auto lg:max-w-3xl">
        {/* Section Header */}
        <div className="bg-[#FAFAFA] px-4 pb-3 pt-4">
          <h2 className="text-[30px] font-bold text-black">Earlier</h2>
        </div>

        {/* Notifications List */}
        <div className="bg-white">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <NotificationListItem
                  notification={notification}
                  onPress={handleNotificationPress}
                />
                {/* Separator - show for all except last item */}
                {index < notifications.length - 1 && (
                  <div className="mx-4 h-[0.5px] bg-[#E5E5EA]" />
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-[15px] text-[#8E8E93]">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
