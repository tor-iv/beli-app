"use client"

import * as React from "react"
import { Restaurant, Coffee, Cake, IceCream, MoreHorizontal, Users, Tag, Edit, Camera, Calendar, Lock, ChevronRight, Check, ChevronDown } from "lucide-react"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetClose,
} from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { Restaurant as RestaurantType } from "@/types"

export interface RestaurantSubmissionData {
  rating: "liked" | "fine" | "disliked" | null
  listType: "restaurants" | "bars" | "bakeries" | "coffee_tea" | "dessert" | "other"
  companions: string[]
  labels: string[]
  notes: string
  favoriteDishes: string[]
  photos: string[]
  visitDate: Date | null
  stealthMode: boolean
}

interface AddRestaurantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurant: RestaurantType
  onSubmit: (data: RestaurantSubmissionData) => void
}

const RATING_OPTIONS = [
  { key: "liked" as const, label: "I liked it!", color: "bg-green-500" },
  { key: "fine" as const, label: "It was fine", color: "bg-amber-200" },
  { key: "disliked" as const, label: "I didn't like it", color: "bg-red-200" },
]

const LIST_TYPE_OPTIONS = [
  { key: "restaurants" as const, label: "Restaurants", icon: Restaurant },
  { key: "bars" as const, label: "Bars", icon: Coffee },
  { key: "bakeries" as const, label: "Bakeries", icon: Cake },
  { key: "coffee_tea" as const, label: "Coffee & Tea", icon: Coffee },
  { key: "dessert" as const, label: "Dessert", icon: IceCream },
  { key: "other" as const, label: "Other", icon: MoreHorizontal },
]

export function AddRestaurantModal({
  open,
  onOpenChange,
  restaurant,
  onSubmit,
}: AddRestaurantModalProps) {
  const [rating, setRating] = React.useState<"liked" | "fine" | "disliked" | null>(null)
  const [listType, setListType] = React.useState<typeof LIST_TYPE_OPTIONS[number]["key"]>("restaurants")
  const [showListTypePicker, setShowListTypePicker] = React.useState(false)
  const [stealthMode, setStealthMode] = React.useState(false)

  const handleSubmit = () => {
    onSubmit({
      rating,
      listType,
      companions: [],
      labels: [],
      notes: "",
      favoriteDishes: [],
      photos: [],
      visitDate: null,
      stealthMode,
    })
    onOpenChange(false)
  }

  const selectedListType = LIST_TYPE_OPTIONS.find((opt) => opt.key === listType)
  const SelectedIcon = selectedListType?.icon || Restaurant

  return (
    <>
      <BottomSheet open={open} onOpenChange={onOpenChange}>
        <BottomSheetContent className="max-h-[90vh] overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between bg-white rounded-2xl p-4">
              <div className="flex-1 mr-3">
                <h2 className="text-xl font-bold text-foreground mb-1">{restaurant.name}</h2>
                <p className="text-sm text-secondary">
                  {restaurant.priceRange} | {restaurant.cuisine.join(", ")}
                </p>
              </div>
              <BottomSheetClose className="p-1 hover:bg-gray-100 rounded-full">
                <span className="sr-only">Close</span>
              </BottomSheetClose>
            </div>

            {/* List Type Selector */}
            <div className="bg-white rounded-2xl p-4">
              <p className="text-sm text-foreground mb-2.5">Add to my list of</p>
              <button
                onClick={() => setShowListTypePicker(true)}
                className="flex items-center w-full py-2.5 px-3.5 border-[1.5px] border-gray-200 rounded-lg gap-2"
              >
                <SelectedIcon className="h-5 w-5 text-foreground" />
                <span className="flex-1 text-left text-base font-semibold text-foreground">
                  {selectedListType?.label}
                </span>
                <ChevronDown className="h-5 w-5 text-secondary" />
              </button>
            </div>

            {/* Rating Section */}
            <div className="bg-white rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                How was it?
              </h3>
              <div className="flex justify-around gap-2">
                {RATING_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setRating(option.key)}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className={cn(
                        "w-[70px] h-[70px] rounded-full flex items-center justify-center",
                        option.color,
                        rating === option.key && "ring-[3px] ring-foreground"
                      )}
                    >
                      {rating === option.key && <Check className="h-7 w-7 text-white" />}
                    </div>
                    <span className="text-[13px] text-foreground font-medium text-center">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Options - Only show after rating is selected */}
            {rating !== null && (
              <div className="bg-white rounded-2xl px-4">
                <button className="flex items-center w-full py-3 border-b border-gray-200 gap-3">
                  <Users className="h-5 w-5 text-foreground flex-shrink-0" />
                  <span className="flex-1 text-left text-base text-foreground">
                    Who did you go with?
                  </span>
                  <ChevronRight className="h-4 w-4 text-secondary flex-shrink-0" />
                </button>

                <button className="flex items-center w-full py-3 border-b border-gray-200 gap-3">
                  <Tag className="h-5 w-5 text-foreground flex-shrink-0" />
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-base text-foreground">Add labels (good for, etc.)</span>
                    <span className="bg-teal-50 text-primary text-[11px] font-semibold px-1.5 py-0.5 rounded">
                      SC
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary flex-shrink-0" />
                </button>

                <button className="flex items-center w-full py-3 border-b border-gray-200 gap-3">
                  <Edit className="h-5 w-5 text-foreground flex-shrink-0" />
                  <span className="flex-1 text-left text-base text-foreground">Add notes</span>
                  <ChevronRight className="h-4 w-4 text-secondary flex-shrink-0" />
                </button>

                <button className="flex items-center w-full py-3 border-b border-gray-200 gap-3">
                  <Restaurant className="h-5 w-5 text-foreground flex-shrink-0" />
                  <span className="flex-1 text-left text-base text-foreground">
                    Add favorite dishes
                  </span>
                  <ChevronRight className="h-4 w-4 text-secondary flex-shrink-0" />
                </button>

                <button className="flex items-center w-full py-3 border-b border-gray-200 gap-3">
                  <Camera className="h-5 w-5 text-foreground flex-shrink-0" />
                  <span className="flex-1 text-left text-base text-foreground">Add photos</span>
                  <ChevronRight className="h-4 w-4 text-secondary flex-shrink-0" />
                </button>

                <button className="flex items-center w-full py-3 border-b border-gray-200 gap-3">
                  <Calendar className="h-5 w-5 text-foreground flex-shrink-0" />
                  <span className="flex-1 text-left text-base text-foreground">Add visit date</span>
                  <ChevronRight className="h-4 w-4 text-secondary flex-shrink-0" />
                </button>

                <div className="flex items-center w-full py-3 gap-3">
                  <Lock className="h-5 w-5 text-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base text-foreground">Stealth mode</span>
                      <span className="bg-teal-50 text-primary text-[11px] font-semibold px-1.5 py-0.5 rounded">
                        SC
                      </span>
                    </div>
                    <p className="text-[13px] text-secondary">Hide this activity from newsfeed</p>
                  </div>
                  <Switch checked={stealthMode} onCheckedChange={setStealthMode} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="px-4 pt-3 pb-5">
              <Button onClick={handleSubmit} className="w-full h-12 text-base font-semibold">
                Rank it!
              </Button>
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheet>

      {/* List Type Picker */}
      <BottomSheet open={showListTypePicker} onOpenChange={setShowListTypePicker}>
        <BottomSheetContent>
          <div className="p-5 pb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground">Choose a category</h3>
              <BottomSheetClose className="p-1 hover:bg-gray-100 rounded-full">
                <span className="sr-only">Close</span>
              </BottomSheetClose>
            </div>
            <div className="space-y-3">
              {LIST_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = listType === option.key
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      setListType(option.key)
                      setShowListTypePicker(false)
                    }}
                    className={cn(
                      "flex items-center w-full py-3.5 px-4 rounded-lg border-[1.5px] gap-3",
                      isSelected
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isSelected ? "text-white" : "text-foreground")} />
                    <span
                      className={cn(
                        "text-base font-semibold",
                        isSelected ? "text-white" : "text-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    </>
  )
}
