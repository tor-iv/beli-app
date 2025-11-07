'use client';

import { Menu, Bell, Calendar, Utensils, Search } from 'lucide-react';
import * as React from 'react';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';

import { HamburgerMenu } from './hamburger-menu';

interface MobileFeedHeaderProps {
  unreadNotificationCount?: number;
  onNotificationsClick?: () => void;
  onReservationsClick?: () => void;
  onGroupDinnerClick?: () => void;
  onSearchClick?: () => void;
  className?: string;
}

export const MobileFeedHeader = ({
  unreadNotificationCount = 0,
  onNotificationsClick,
  onReservationsClick,
  onGroupDinnerClick,
  onSearchClick,
  className,
}: MobileFeedHeaderProps) => {
  return (
    <div className={cn('bg-white md:hidden', className)}>
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">beli</h1>
          <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
            SC
          </span>
        </div>

        {/* Header Icons */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <IconButton
              variant="ghost"
              size="medium"
              onClick={onReservationsClick}
              aria-label="Reservations"
            >
              <Calendar className="h-6 w-6 text-foreground" />
            </IconButton>
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
              1
            </span>
          </div>

          <IconButton
            variant="ghost"
            size="medium"
            onClick={onGroupDinnerClick}
            aria-label="Group Dinner"
          >
            <Utensils className="h-6 w-6 text-foreground" />
          </IconButton>

          <div className="relative">
            <IconButton
              variant="ghost"
              size="medium"
              onClick={onNotificationsClick}
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6 text-foreground" />
            </IconButton>
            {unreadNotificationCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                {unreadNotificationCount}
              </span>
            )}
          </div>

          <HamburgerMenu
            trigger={
              <IconButton variant="ghost" size="medium" aria-label="Menu">
                <Menu className="h-6 w-6 text-foreground" />
              </IconButton>
            }
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <button
          onClick={onSearchClick}
          className="flex w-full items-center rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left shadow-button"
        >
          <Search className="mr-2 h-5 w-5 flex-shrink-0 text-gray-600" />
          <span className="text-tertiary text-base">Search a restaurant, member, etc.</span>
        </button>
      </div>
    </div>
  );
}
