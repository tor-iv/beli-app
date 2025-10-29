import * as React from "react"
import { Calendar, Navigation, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionButtonsProps {
  onReserveClick?: () => void
  onRecsNearbyClick?: () => void
  onTrendingClick?: () => void
  onFriendRecsClick?: () => void
  className?: string
}

export function ActionButtons({
  onReserveClick,
  onRecsNearbyClick,
  onTrendingClick,
  onFriendRecsClick,
  className,
}: ActionButtonsProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2 px-4 pb-3 md:hidden", className)}>
      <button
        onClick={onReserveClick}
        className="flex flex-col items-center justify-center bg-primary text-white rounded-lg py-2.5 px-2 active:opacity-70 transition-opacity"
      >
        <Calendar className="h-[18px] w-[18px] mb-1" />
        <span className="text-xs font-medium leading-tight">Reserve now</span>
      </button>

      <button
        onClick={onRecsNearbyClick}
        className="flex flex-col items-center justify-center bg-primary text-white rounded-lg py-2.5 px-2 active:opacity-70 transition-opacity"
      >
        <Navigation className="h-[18px] w-[18px] mb-1" />
        <span className="text-xs font-medium leading-tight">Recs Nearby</span>
      </button>

      <button
        onClick={onTrendingClick}
        className="flex flex-col items-center justify-center bg-primary text-white rounded-lg py-2.5 px-2 active:opacity-70 transition-opacity"
      >
        <TrendingUp className="h-[18px] w-[18px] mb-1" />
        <span className="text-xs font-medium leading-tight">Trending</span>
      </button>

      <button
        onClick={onFriendRecsClick}
        className="flex flex-col items-center justify-center bg-primary text-white rounded-lg py-2.5 px-2 active:opacity-70 transition-opacity"
      >
        <Users className="h-[18px] w-[18px] mb-1" />
        <span className="text-xs font-medium leading-tight">Friend recs</span>
      </button>
    </div>
  )
}
