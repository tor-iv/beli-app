import * as React from "react"
import Image from "next/image"
import { Utensils, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChallengeActivityCardProps {
  userAvatar: string
  userName: string
  restaurantName: string
  cuisine: string
  neighborhood: string
  rating: number
  notes?: string
  date: string
}

export function ChallengeActivityCard({
  userAvatar,
  userName,
  restaurantName,
  cuisine,
  neighborhood,
  rating,
  notes,
  date,
}: ChallengeActivityCardProps) {
  // Determine rating color based on score
  const getRatingColor = (score: number) => {
    if (score >= 8.0) return "bg-green-500"
    if (score >= 7.0) return "bg-green-400"
    if (score >= 5.0) return "bg-orange-400"
    return "bg-red-400"
  }

  return (
    <div className="bg-white px-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={userAvatar}
            alt={userName}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-foreground mb-2">
            You ranked <span className="font-semibold">{restaurantName}</span>
          </p>

          {/* Restaurant info */}
          <div className="flex items-center gap-2 text-sm text-secondary mb-2">
            <Utensils className="h-3.5 w-3.5" />
            <span>{cuisine}</span>
            <span>•</span>
            <MapPin className="h-3.5 w-3.5" />
            <span>{neighborhood}</span>
          </div>

          {/* Rating bubble */}
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center",
              getRatingColor(rating)
            )}>
              <span className="text-white font-bold text-lg">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-sm text-secondary">
                <span className="font-semibold text-foreground">Notes:</span> {notes}
              </p>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-secondary">{date}</p>
        </div>
      </div>
    </div>
  )
}
