"use client"

import * as React from "react"
import { Menu, Bell, Calendar, Utensils, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/icon-button"
import { HamburgerMenu } from "./hamburger-menu"

interface MobileFeedHeaderProps {
  unreadNotificationCount?: number
  onNotificationsClick?: () => void
  onReservationsClick?: () => void
  onGroupDinnerClick?: () => void
  onSearchClick?: () => void
  className?: string
}

export function MobileFeedHeader({
  unreadNotificationCount = 0,
  onNotificationsClick,
  onReservationsClick,
  onGroupDinnerClick,
  onSearchClick,
  className,
}: MobileFeedHeaderProps) {
  return (
    <div className={cn("md:hidden bg-white", className)}>
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">beli</h1>
          <span className="bg-teal-50 text-primary text-[11px] font-semibold px-1.5 py-0.5 rounded">
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
            <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
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
              <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-semibold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
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
          className="w-full flex items-center bg-white rounded-lg shadow-button border border-gray-300 px-3 py-2.5 text-left"
        >
          <Search className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0" />
          <span className="text-base text-tertiary">Search a restaurant, member, etc.</span>
        </button>
      </div>
    </div>
  )
}
