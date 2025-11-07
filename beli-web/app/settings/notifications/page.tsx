'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { SettingsRow } from '@/components/settings/settings-row';
import { useUserSettingsStore } from '@/lib/stores/user-settings-store';


export default function NotificationSettingsPage() {
  const notifications = useUserSettingsStore((state) => state.notifications);
  const setNotification = useUserSettingsStore((state) => state.setNotification);

  const handleToggle = (key: string, value: boolean) => {
    // Prevent disabling shared reservations
    if (key === 'sharedReservations' && !value) {
      alert('This notification must be enabled to use the reservations feature.');
      return;
    }
    setNotification(key as any, value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <ChevronLeft className="h-6 w-6 text-secondary transition-colors hover:text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Notification settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <SettingsRow
            type="toggle"
            label="Someone follows you"
            checked={notifications.follows}
            onCheckedChange={(value) => handleToggle('follows', value)}
          />

          <SettingsRow
            type="toggle"
            label="Someone bookmarks from your list"
            checked={notifications.bookmarks}
            onCheckedChange={(value) => handleToggle('bookmarks', value)}
          />

          <SettingsRow
            type="toggle"
            label="Someone likes one of your ratings or bookmarks"
            checked={notifications.likes}
            onCheckedChange={(value) => handleToggle('likes', value)}
          />

          <SettingsRow
            type="toggle"
            label="Someone comments on one of your ratings or bookmarks"
            checked={notifications.comments}
            onCheckedChange={(value) => handleToggle('comments', value)}
          />

          <SettingsRow
            type="toggle"
            label="One of your contacts joins Beli"
            checked={notifications.contactJoins}
            onCheckedChange={(value) => handleToggle('contactJoins', value)}
          />

          <SettingsRow
            type="toggle"
            label="New featured list"
            checked={notifications.featuredLists}
            onCheckedChange={(value) => handleToggle('featuredLists', value)}
          />

          <SettingsRow
            type="toggle"
            label="Restaurant news"
            checked={notifications.restaurantNews}
            onCheckedChange={(value) => handleToggle('restaurantNews', value)}
          />

          <SettingsRow
            type="toggle"
            label="Shared reservations"
            sublabel="This must be enabled to claim reservations"
            checked={notifications.sharedReservations}
            onCheckedChange={(value) => handleToggle('sharedReservations', value)}
            required
          />

          <SettingsRow
            type="toggle"
            label="Weekly rank reminders"
            checked={notifications.weeklyRankReminders}
            onCheckedChange={(value) => handleToggle('weeklyRankReminders', value)}
          />

          <SettingsRow
            type="toggle"
            label="Streak reminders"
            checked={notifications.streakReminders}
            onCheckedChange={(value) => handleToggle('streakReminders', value)}
          />

          <SettingsRow
            type="toggle"
            label='"What to order" reminders for reservations made on Beli'
            checked={notifications.orderReminders}
            onCheckedChange={(value) => handleToggle('orderReminders', value)}
          />

          <SettingsRow
            type="toggle"
            label="Reminder to rank after a reservation made on Beli"
            checked={notifications.rankReminders}
            onCheckedChange={(value) => handleToggle('rankReminders', value)}
          />
        </div>
      </div>
    </div>
  );
}
