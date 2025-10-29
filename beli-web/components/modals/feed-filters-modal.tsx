"use client"

import * as React from "react"
import { X, CheckCircle2, Circle } from "lucide-react"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
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
  filters: FeedFilters
  onClose: () => void
  onApply: (filters: FeedFilters) => void
}

interface CheckboxRowProps {
  label: string
  description?: string
  checked: boolean
  onToggle: () => void
}

function CheckboxRow({ label, description, checked, onToggle }: CheckboxRowProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors w-full"
    >
      <div className="flex-1 mr-3 text-left">
        <p className="text-[17px] font-medium text-foreground mb-0.5">{label}</p>
        {description && <p className="text-sm text-secondary leading-4">{description}</p>}
      </div>
      {checked ? (
        <CheckCircle2 className="h-7 w-7 text-primary flex-shrink-0" />
      ) : (
        <Circle className="h-7 w-7 text-tertiary flex-shrink-0" />
      )}
    </button>
  )
}

export function FeedFiltersModal({
  open,
  filters,
  onClose,
  onApply,
}: FeedFiltersModalProps) {
  const [localFilters, setLocalFilters] = React.useState<FeedFilters>(filters)

  // Update local state when filters prop or modal opens
  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
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
    onClose()
  }

  return (
    <BottomSheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <BottomSheetContent height="auto" className="p-0" forceBottomSheet>
        {/* Header */}
        <BottomSheetHeader className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BottomSheetTitle className="text-xl font-bold">Filter feed</BottomSheetTitle>
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              SC
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-7 w-7 text-foreground" />
          </button>
        </BottomSheetHeader>

        {/* Filter Options */}
        <div className="pt-4">
          <CheckboxRow
            label="Rankings only"
            description="Show only posts with restaurant rankings"
            checked={localFilters.rankingsOnly}
            onToggle={() => toggleFilter("rankingsOnly")}
          />
          <CheckboxRow
            label="Top rated (>9)"
            description="Show only excellent ratings (9.0+)"
            checked={localFilters.topRatedOnly}
            onToggle={() => toggleFilter("topRatedOnly")}
          />
          <CheckboxRow
            label="Restaurants only"
            description="Exclude bars, bakeries, and other categories"
            checked={localFilters.restaurantsOnly}
            onToggle={() => toggleFilter("restaurantsOnly")}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-4 mt-2">
          <button
            onClick={handleClearAll}
            className="text-[17px] font-medium text-primary hover:underline"
          >
            Clear All
          </button>
          <Button
            onClick={handleApply}
            size="lg"
            className="px-12 py-3 h-auto rounded-full text-[17px] font-semibold"
          >
            Apply
          </Button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  )
}
