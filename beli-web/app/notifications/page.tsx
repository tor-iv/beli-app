'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { NotificationListItem } from '@/components/social/notification-list-item';
import { useNotifications, useMarkNotificationAsRead } from '@/lib/hooks';
import { Notification } from '@/types';

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
        <div className="sticky top-0 z-10 h-11 bg-white flex items-center justify-between px-2">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-black" />
          </button>
          <h1 className="text-[20px] font-bold text-black">Notifications</h1>
          <div className="w-11" /> {/* Spacer for symmetry */}
        </div>

        {/* Loading state */}
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#0A6C70] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-10 h-11 bg-white flex items-center justify-between px-2">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft className="w-7 h-7 text-black" />
        </button>
        <h1 className="text-[20px] font-bold text-black">Notifications</h1>
        <div className="w-11" /> {/* Spacer for symmetry */}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-[#E5E5EA]">
        <div className="max-w-3xl mx-auto h-11 flex items-center justify-between px-2">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-black" />
          </button>
          <h1 className="text-[20px] font-bold text-black">Notifications</h1>
          <div className="w-11" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Content Container */}
      <div className="lg:max-w-3xl lg:mx-auto">
        {/* Section Header */}
        <div className="px-4 pt-4 pb-3 bg-[#FAFAFA]">
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
                  <div className="h-[0.5px] bg-[#E5E5EA] mx-4" />
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-[#8E8E93] text-[15px]">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
