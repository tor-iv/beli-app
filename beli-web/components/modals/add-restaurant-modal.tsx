"use client"

import * as React from "react"
import { Utensils, Coffee, Cake, IceCream, MoreHorizontal, Users, Tag, Edit, Camera, Calendar, Lock, ChevronRight, Check, ChevronDown, Undo2, ArrowRight } from "lucide-react"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetClose,
} from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import type { Restaurant as RestaurantType, ListCategory, InitialSentiment, RankingState, RankingResult } from "@/types"
import {
  initializeRanking,
  getNextComparison,
  processComparison,
  undoLastComparison,
  getRankingProgress,
  generateRankingResult,
} from "@/lib/utils/binarySearchRanking"
import { useRankedRestaurants } from "@/lib/hooks"

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
  userId: string
  onSubmit?: (data: RestaurantSubmissionData) => void
  onRankingComplete?: (result: RankingResult, data: RestaurantSubmissionData) => void
}

const RATING_OPTIONS = [
  { key: "liked" as const, label: "I liked it!", color: "bg-green-500" },
  { key: "fine" as const, label: "It was fine", color: "bg-amber-200" },
  { key: "disliked" as const, label: "I didn't like it", color: "bg-red-200" },
]

const LIST_TYPE_OPTIONS = [
  { key: "restaurants" as const, label: "Restaurants", icon: Utensils },
  { key: "bars" as const, label: "Bars", icon: Coffee },
  { key: "bakeries" as const, label: "Bakeries", icon: Cake },
  { key: "coffee_tea" as const, label: "Coffee & Tea", icon: Coffee },
  { key: "dessert" as const, label: "Dessert", icon: IceCream },
  { key: "other" as const, label: "Other", icon: MoreHorizontal },
]

type ModalMode = 'initial' | 'ranking'

export function AddRestaurantModal({
  open,
  onOpenChange,
  restaurant,
  userId,
  onSubmit,
  onRankingComplete,
}: AddRestaurantModalProps) {
  const [modalMode, setModalMode] = React.useState<ModalMode>("initial")
  const [rating, setRating] = React.useState<"liked" | "fine" | "disliked" | null>(null)
  const [listType, setListType] = React.useState<typeof LIST_TYPE_OPTIONS[number]["key"]>("restaurants")
  const [showListTypePicker, setShowListTypePicker] = React.useState(false)
  const [stealthMode, setStealthMode] = React.useState(false)

  // Ranking state
  const [rankingState, setRankingState] = React.useState<RankingState | null>(null)
  const [currentComparison, setCurrentComparison] = React.useState<RestaurantType | null>(null)
  const [loadingRanking, setLoadingRanking] = React.useState(false)

  // Fetch ranked restaurants for the ranking flow
  const { data: rankedList } = useRankedRestaurants(userId, listType)

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setModalMode("initial")
      setRating(null)
      setListType("restaurants")
      setStealthMode(false)
      setRankingState(null)
      setCurrentComparison(null)
      setLoadingRanking(false)
    }
  }, [open])

  const startRankingFlow = async () => {
    if (!rating || !onRankingComplete) return

    setLoadingRanking(true)
    try {
      // Use the ranked list from the query
      const list = rankedList || []

      // Initialize ranking state
      const state = initializeRanking(
        restaurant.id,
        listType,
        list,
        rating as InitialSentiment
      )

      setRankingState(state)

      // Get first comparison
      const nextRestaurant = getNextComparison(state)
      setCurrentComparison(nextRestaurant)

      // Switch to ranking mode
      setModalMode("ranking")
    } catch (error) {
      console.error("Error initializing ranking:", error)
    } finally {
      setLoadingRanking(false)
    }
  }

  const handleComparisonChoice = (choice: "left" | "right") => {
    if (!rankingState || !currentComparison) return

    // Process the comparison
    const newState = processComparison(rankingState, currentComparison, choice)
    setRankingState(newState)

    // Check if complete
    if (newState.isComplete) {
      handleRankingComplete(newState)
      return
    }

    // Get next comparison
    const nextRestaurant = getNextComparison(newState)
    setCurrentComparison(nextRestaurant)
  }

  const handleSkip = () => {
    if (!rankingState || !currentComparison || rankingState.skipsRemaining <= 0) return

    const newState = processComparison(rankingState, currentComparison, "skip")
    setRankingState(newState)

    if (newState.isComplete) {
      handleRankingComplete(newState)
      return
    }

    const nextRestaurant = getNextComparison(newState)
    setCurrentComparison(nextRestaurant)
  }

  const handleTooTough = () => {
    if (!rankingState) return

    // Stop ranking immediately and use current position
    const finalState: RankingState = {
      ...rankingState,
      isComplete: true,
    }

    handleRankingComplete(finalState)
  }

  const handleUndo = () => {
    if (!rankingState || rankingState.comparisonHistory.length === 0) return

    const newState = undoLastComparison(rankingState)
    setRankingState(newState)

    // Get the comparison restaurant again
    const nextRestaurant = getNextComparison(newState)
    setCurrentComparison(nextRestaurant)
  }

  const handleRankingComplete = (state: RankingState) => {
    if (!onRankingComplete) return

    // Generate final result
    const result = generateRankingResult(state)

    // Create submission data
    const data: RestaurantSubmissionData = {
      rating,
      listType,
      companions: [],
      labels: [],
      notes: "",
      favoriteDishes: [],
      photos: [],
      visitDate: null,
      stealthMode,
    }

    // Call the completion callback
    onRankingComplete(result, data)
  }

  const handleRankIt = () => {
    if (onRankingComplete && rating !== null) {
      // Start the ranking flow
      startRankingFlow()
    } else if (onSubmit) {
      // Old behavior - just submit
      const data: RestaurantSubmissionData = {
        rating,
        listType,
        companions: [],
        labels: [],
        notes: "",
        favoriteDishes: [],
        photos: [],
        visitDate: null,
        stealthMode,
      }
      onSubmit(data)
      onOpenChange(false)
    }
  }

  const selectedListType = LIST_TYPE_OPTIONS.find((opt) => opt.key === listType)
  const SelectedIcon = selectedListType?.icon || Utensils

  const progress = rankingState ? getRankingProgress(rankingState) : null

  return (
    <>
      <BottomSheet open={open} onOpenChange={onOpenChange}>
        <BottomSheetContent className="max-h-[90vh] overflow-y-auto">
          <BottomSheetTitle className="sr-only">Add {restaurant.name} to your list</BottomSheetTitle>
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
                onClick={() => modalMode === "initial" && setShowListTypePicker(true)}
                disabled={modalMode === "ranking"}
                className="flex items-center w-full py-2.5 px-3.5 border-[1.5px] border-gray-200 rounded-lg gap-2 disabled:opacity-50"
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
                    onClick={() => modalMode === "initial" && setRating(option.key)}
                    disabled={modalMode === "ranking"}
                    className="flex-1 flex flex-col items-center gap-2 disabled:opacity-50"
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

            {/* Ranking Section - Only show when in ranking mode */}
            {modalMode === "ranking" && rankingState && currentComparison && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                  Which do you prefer?
                </h3>

                <div className="flex items-center justify-center gap-0 mb-3 relative">
                  {/* Left Card - Target Restaurant */}
                  <button
                    onClick={() => handleComparisonChoice("left")}
                    className="w-[45%] min-h-[200px] flex flex-col items-center justify-center px-5 py-10 border-[1.5px] border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-[22px] font-bold text-foreground text-center leading-7 mb-2 line-clamp-3 break-words w-full">
                      {restaurant.name}
                    </p>
                    <p className="text-[13px] text-secondary text-center leading-[18px] line-clamp-2 w-full">
                      {restaurant.location.city}, {restaurant.location.state}
                    </p>
                  </button>

                  {/* OR Divider */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[50px] h-[50px] rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[12px] font-bold text-white">OR</span>
                  </div>

                  {/* Right Card - Comparison Restaurant */}
                  <button
                    onClick={() => handleComparisonChoice("right")}
                    className="w-[45%] min-h-[200px] flex flex-col items-center justify-center px-5 py-10 border-[1.5px] border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-[22px] font-bold text-foreground text-center leading-7 mb-2 line-clamp-3 break-words w-full">
                      {currentComparison.name}
                    </p>
                    <p className="text-[13px] text-secondary text-center leading-[18px] line-clamp-2 w-full">
                      {currentComparison.location.city}, {currentComparison.location.state}
                    </p>
                    {(currentComparison as any).userRating && (
                      <p className="text-[12px] font-semibold text-primary mt-1.5">
                        {((currentComparison as any).userRating as number).toFixed(1)}
                      </p>
                    )}
                  </button>
                </div>

                {/* Progress indicator */}
                {progress && (
                  <p className="text-[13px] text-secondary text-center mt-2">
                    Comparison {progress.currentComparison} of ~{progress.estimatedTotal}
                  </p>
                )}
              </div>
            )}

            {/* Ranking Controls - Only show when in ranking mode */}
            {modalMode === "ranking" && rankingState && (
              <div className="bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleUndo}
                    disabled={rankingState.comparisonHistory.length === 0}
                    className="flex items-center gap-1.5 py-2 px-3 disabled:opacity-40"
                  >
                    <Undo2 className="h-[18px] w-[18px]" />
                    <span className="text-base font-medium">Undo</span>
                  </button>

                  <button
                    onClick={handleTooTough}
                    className="py-2 px-4 border-[1.5px] border-gray-200 rounded-full"
                  >
                    <span className="text-base font-medium">Too tough</span>
                  </button>

                  <button
                    onClick={handleSkip}
                    disabled={rankingState.skipsRemaining === 0}
                    className="flex items-center gap-1.5 py-2 px-3 disabled:opacity-40"
                  >
                    <span className="text-base font-medium">
                      Skip{rankingState.skipsRemaining > 0 && ` (${rankingState.skipsRemaining})`}
                    </span>
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </div>
            )}

            {/* Additional Options - Only show in initial mode after rating is selected */}
            {modalMode === "initial" && rating !== null && (
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
                  <Utensils className="h-5 w-5 text-foreground flex-shrink-0" />
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

            {/* Submit Button - Only show in initial mode */}
            {modalMode === "initial" && (
              <div className="px-4 pt-3 pb-5">
                <Button
                  onClick={handleRankIt}
                  disabled={loadingRanking}
                  className="w-full h-12 text-base font-semibold"
                >
                  {loadingRanking ? (
                    <LoadingSpinner className="h-5 w-5" />
                  ) : (
                    "Rank it!"
                  )}
                </Button>
              </div>
            )}
          </div>
        </BottomSheetContent>
      </BottomSheet>

      {/* List Type Picker */}
      <BottomSheet open={showListTypePicker} onOpenChange={setShowListTypePicker}>
        <BottomSheetContent>
          <div className="p-5 pb-8">
            <div className="flex items-center justify-between mb-5">
              <BottomSheetTitle className="text-lg font-semibold text-foreground">Choose a category</BottomSheetTitle>
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
