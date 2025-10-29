"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Share2,
  Calendar,
  CalendarPlus,
  Navigation,
  Info,
  Clock,
  ChevronRight,
} from "lucide-react"
import {
  BottomSheet,
  BottomSheetContent,
} from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { GroupDinnerMatch, User } from "@/types"

interface ConfirmationModalProps {
  open: boolean
  match?: GroupDinnerMatch
  participants: User[]
  onClose: () => void
  onKeepSwiping: () => void
}

interface ActionButtonProps {
  icon: React.ElementType
  title: string
  subtitle: string
  onClick: () => void
}

function ActionButton({ icon: Icon, title, subtitle, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="h-11 w-11 flex items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[15px] font-semibold leading-tight">{title}</p>
        <p className="text-[13px] text-secondary leading-tight">{subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-secondary flex-shrink-0" />
    </button>
  )
}

export function ConfirmationModal({
  open,
  match,
  participants,
  onClose,
  onKeepSwiping,
}: ConfirmationModalProps) {
  const router = useRouter()

  if (!match) return null

  const { restaurant, availability } = match

  const handleShare = async () => {
    const participantNames = participants.map(p => p.displayName).join(", ")
    const text = `Let's meet at ${restaurant.name}!\n\n${
      participants.length > 0 ? `Dining with: ${participantNames}\n\n` : ""
    }Address: ${restaurant.location.address}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dinner at ${restaurant.name}`,
          text: text,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      await navigator.clipboard.writeText(text)
      // TODO: Show toast "Link copied to clipboard"
      alert("Link copied to clipboard!")
    }
  }

  const handleReservation = () => {
    if (restaurant.website) {
      window.open(restaurant.website, "_blank")
    } else {
      alert("No website available for this restaurant")
    }
  }

  const handleCalendar = () => {
    // TODO: Implement calendar export utility
    alert("Calendar export coming soon!")
  }

  const handleDirections = () => {
    const { lat, lng } = restaurant.location.coordinates
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(url, "_blank")
  }

  const handleViewDetails = () => {
    router.push(`/restaurant/${restaurant.id}`)
  }

  return (
    <BottomSheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <BottomSheetContent height="auto" className="p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <h2 className="text-xl font-bold">Dinner Confirmed!</h2>
        </div>

        {/* Restaurant Image with Success Badge */}
        <div className="relative h-[240px]">
          <Image
            src={restaurant.images[0]}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          {/* Success Badge Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span className="font-semibold">Perfect match!</span>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          {/* Name */}
          <h3 className="text-2xl font-bold text-foreground mb-1">
            {restaurant.name}
          </h3>

          {/* Meta */}
          <p className="text-base text-secondary mb-2">
            {restaurant.cuisine.join(", ")} • {restaurant.priceRange}
          </p>

          {/* Address */}
          <p className="text-sm text-secondary">
            {restaurant.location.address}
          </p>

          {/* Availability Card */}
          {availability && (
            <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 mt-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-primary">
                Available {availability.timeSlot}
              </span>
            </div>
          )}

          {/* Dining With Section */}
          {participants.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-secondary mb-2">
                DINING WITH
              </h4>
              <div className="flex flex-wrap gap-2">
                {participants.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-6 w-6"
                    />
                    <span className="text-sm">{user.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-secondary mb-3">
              NEXT STEPS
            </h4>

            <div className="space-y-2">
              <ActionButton
                icon={Share2}
                title="Share with group"
                subtitle="Send location to dining companions"
                onClick={handleShare}
              />

              <ActionButton
                icon={Calendar}
                title="Make Reservation"
                subtitle="Book your table"
                onClick={handleReservation}
              />

              <ActionButton
                icon={CalendarPlus}
                title="Add to Calendar"
                subtitle="Save dinner to your calendar"
                onClick={handleCalendar}
              />

              <ActionButton
                icon={Navigation}
                title="Get Directions"
                subtitle="Open in maps"
                onClick={handleDirections}
              />

              <ActionButton
                icon={Info}
                title="View Details"
                subtitle="See full restaurant info"
                onClick={handleViewDetails}
              />
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2 mt-6">
            <Button
              variant="ghost"
              onClick={onKeepSwiping}
              className="flex-1"
            >
              Keep Swiping
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  )
}
