"use client"

import * as React from "react"
import Image from "next/image"
import { CheckCircle, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GroupDinnerMatch } from "@/types"

interface SelectionScreenProps {
  savedRestaurants: GroupDinnerMatch[]
  onSelectRestaurant: (match: GroupDinnerMatch) => void
  onStartOver: () => void
  onBack: () => void
  onViewDetails: (restaurantId: string) => void
}

interface RestaurantOptionCardProps {
  match: GroupDinnerMatch
  optionNumber: number
  onChoose: () => void
  onViewDetails: () => void
}

function RestaurantOptionCard({
  match,
  optionNumber,
  onChoose,
  onViewDetails,
}: RestaurantOptionCardProps) {
  const { restaurant, matchReasons, availability } = match

  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return "text-green-600"
    if (rating >= 7.0) return "text-lime-500"
    if (rating >= 5.0) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-cardElevated">
      {/* Option Badge */}
      <div className="bg-primary text-white text-sm font-semibold px-3 py-1.5">
        Option {optionNumber}
      </div>

      {/* Restaurant Image */}
      <div className="relative h-[200px]">
        <Image
          src={restaurant.images[0]}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1">
          {restaurant.name}
        </h3>

        {/* Meta Row */}
        <div className="flex items-center text-sm text-muted mb-2">
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
        <div className="flex items-center mb-3">
          <div className="h-11 w-11 flex items-center justify-center rounded-full bg-white border-[1.5px] border-gray-300 mr-2">
            <span className={cn("text-lg font-bold", getRatingColor(restaurant.rating))}>
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          {restaurant.ratingCount && (
            <span className="text-xs text-muted">
              ({restaurant.ratingCount} reviews)
            </span>
          )}
        </div>

        {/* Match Highlights */}
        <div className="bg-primary/8 rounded-lg p-3 mb-3">
          <div className="space-y-1.5">
            {/* Show first 2 match reasons */}
            {matchReasons.slice(0, 2).map((reason, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-sm font-bold text-primary leading-[18px] mr-1">•</span>
                <span className="text-sm text-foreground leading-[18px] flex-1">
                  {reason}
                </span>
              </div>
            ))}

            {/* Availability */}
            {availability && (
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground leading-[18px]">
                  Available {availability.timeSlot}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Choose Button */}
        <Button onClick={onChoose} className="w-full mb-2">
          Choose This One
        </Button>

        {/* View Details Link */}
        <button
          onClick={onViewDetails}
          className="w-full text-sm font-medium text-primary hover:underline py-2"
        >
          View full details
        </button>
      </div>
    </div>
  )
}

export function SelectionScreen({
  savedRestaurants,
  onSelectRestaurant,
  onStartOver,
  onBack,
  onViewDetails,
}: SelectionScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white px-4 py-6 border-b sticky top-0 z-10">
        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-center">Choose Your Spot!</h1>
        <p className="text-base text-muted text-center mt-2">
          You've saved {savedRestaurants.length} great options
        </p>
      </div>

      {/* Scrollable Cards */}
      <div className="space-y-4 px-4 py-4 pb-24">
        {savedRestaurants.map((match, index) => (
          <RestaurantOptionCard
            key={match.restaurant.id}
            match={match}
            optionNumber={index + 1}
            onChoose={() => onSelectRestaurant(match)}
            onViewDetails={() => onViewDetails(match.restaurant.id)}
          />
        ))}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom">
        <Button
          variant="outline"
          onClick={onStartOver}
          className="w-full"
        >
          Start Over & Keep Swiping
        </Button>
      </div>
    </div>
  )
}
