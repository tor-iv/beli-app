import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, CheckCircle2, Users, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GroupDinnerMatch } from "@/types"

interface GroupDinnerCardProps {
  match: GroupDinnerMatch
  onViewDetails?: () => void
  savedCount?: number
  className?: string
}

export function GroupDinnerCard({
  match,
  onViewDetails,
  savedCount = 0,
  className,
}: GroupDinnerCardProps) {
  const { restaurant, onListsCount, matchReasons, availability } = match

  // Determine rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return "text-green-600" // Excellent
    if (rating >= 7.0) return "text-lime-500" // Good
    if (rating >= 5.0) return "text-orange-500" // Average
    return "text-red-500" // Poor
  }

  return (
    <div className={cn("w-full bg-white rounded-2xl shadow-modal overflow-hidden", className)}>
      {/* Restaurant Image */}
      <div className="relative w-full h-[280px]">
        <Image
          src={restaurant.images[0]}
          alt={restaurant.name}
          fill
          className="object-cover"
        />

        {/* Saved Counter Badge */}
        {savedCount > 0 && (
          <div
            className={cn(
              "absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg shadow-card",
              savedCount >= 3 ? "bg-green-600" : "bg-primary"
            )}
          >
            <Heart className="h-4 w-4 text-white fill-white" />
            <span className="text-sm font-bold text-white leading-[18px]">{savedCount}</span>
          </div>
        )}

        {/* Availability Badge */}
        {availability && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg shadow-card">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-[13px] font-semibold text-green-600 leading-[17px]">
              Available {availability.timeSlot}
            </span>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-2xl font-bold text-foreground mb-1 line-clamp-1">
          {restaurant.name}
        </h3>

        {/* Meta Row */}
        <div className="flex items-center text-[15px] text-secondary mb-2">
          <span>{restaurant.cuisine.join(", ")}</span>
          <span className="mx-1">•</span>
          <span>{restaurant.priceRange}</span>
          {restaurant.distance !== undefined && (
            <>
              <span className="mx-1">•</span>
              <span>{restaurant.distance.toFixed(1)} mi</span>
            </>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="h-11 w-11 flex items-center justify-center rounded-full bg-white border-[1.5px] border-gray-300 mr-2">
            <span className={cn("text-lg font-bold", getRatingColor(restaurant.rating))}>
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          {restaurant.ratingCount && (
            <span className="text-[13px] text-secondary">
              ({restaurant.ratingCount} reviews)
            </span>
          )}
        </div>

        {/* Match Info */}
        <div className="bg-primary/8 rounded-lg p-3">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-[18px] w-[18px] text-primary" />
            <span className="text-[15px] font-semibold text-primary leading-[21px]">
              {onListsCount === 1 ? "Match Info" : `${onListsCount} people want this!`}
            </span>
          </div>

          {/* Reasons */}
          <div className="space-y-1">
            {matchReasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-2 pl-1">
                <span className="text-[15px] font-bold text-primary leading-[21px] mr-1">•</span>
                <span className="text-[15px] text-foreground leading-[21px] flex-1">
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* More Info Button */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center justify-center gap-1.5 w-full mt-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-[15px] font-semibold text-primary">More Info</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </button>
        )}
      </div>
    </div>
  )
}
