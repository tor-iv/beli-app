"use client"

import * as React from "react"
import { CheckCircle, Circle } from "lucide-react"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetClose,
  BottomSheetTitle,
} from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FeedFilters {
  rankingsOnly: boolean
  topRatedOnly: boolean
  restaurantsOnly: boolean
}

interface FeedFiltersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FeedFilters
  onApply: (filters: FeedFilters) => void
}

export function FeedFiltersModal({
  open,
  onOpenChange,
  filters,
  onApply,
}: FeedFiltersModalProps) {
  const [localFilters, setLocalFilters] = React.useState<FeedFilters>(filters)

  // Update local state when filters prop or modal visibility changes
  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters, open])

  const toggleFilter = (key: keyof FeedFilters) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleClearAll = () => {
    setLocalFilters({
      rankingsOnly: false,
      topRatedOnly: false,
      restaurantsOnly: false,
    })
  }

  const handleApply = () => {
    onApply(localFilters)
    onOpenChange(false)
  }

  const renderCheckbox = (
    label: string,
    key: keyof FeedFilters,
    description?: string
  ) => {
    const isChecked = localFilters[key]

    return (
      <button
        onClick={() => toggleFilter(key)}
        className="flex items-center justify-between px-4 py-3 w-full text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 mr-3">
          <p className="text-lg font-medium text-foreground mb-0.5">{label}</p>
          {description && <p className="text-sm text-secondary leading-4">{description}</p>}
        </div>
        {isChecked ? (
          <CheckCircle className="h-7 w-7 text-primary flex-shrink-0" />
        ) : (
          <Circle className="h-7 w-7 text-tertiary flex-shrink-0" />
        )}
      </button>
    )
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-h-[80vh]" forceBottomSheet>
        <div className="pb-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BottomSheetTitle className="text-xl font-bold text-foreground">Filter feed</BottomSheetTitle>
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                SC
              </span>
            </div>
            <BottomSheetClose className="p-1 hover:bg-gray-100 rounded-full">
              <span className="sr-only">Close</span>
            </BottomSheetClose>
          </div>

          {/* Filter Options */}
          <div className="pt-4">
            {renderCheckbox(
              "Rankings only",
              "rankingsOnly",
              "Show only posts with restaurant rankings"
            )}
            {renderCheckbox(
              "Top rated (>9)",
              "topRatedOnly",
              "Show only excellent ratings (9.0+)"
            )}
            {renderCheckbox(
              "Restaurants only",
              "restaurantsOnly",
              "Exclude bars, bakeries, and other categories"
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 pt-6">
            <button
              onClick={handleClearAll}
              className="text-lg font-medium text-primary hover:underline"
            >
              Clear All
            </button>
            <Button onClick={handleApply} className="px-12 py-3 text-lg font-semibold rounded-full">
              Apply
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  )
}
