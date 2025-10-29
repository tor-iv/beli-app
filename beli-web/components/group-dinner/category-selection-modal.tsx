"use client"

import * as React from "react"
import { X, Utensils, Wine, Cake, Coffee, IceCream } from "lucide-react"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
} from "@/components/ui/bottom-sheet"
import type { ListCategory } from "@/types"

interface CategorySelectionModalProps {
  open: boolean
  selectedCategory: ListCategory | null
  onSelectCategory: (category: ListCategory) => void
  onOpenChange: (open: boolean) => void
}

interface CategoryOption {
  key: ListCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'restaurants', label: 'Restaurants', icon: Utensils },
  { key: 'bars', label: 'Bars', icon: Wine },
  { key: 'bakeries', label: 'Bakeries', icon: Cake },
  { key: 'coffee_tea', label: 'Coffee & Tea', icon: Coffee },
  { key: 'dessert', label: 'Dessert', icon: IceCream },
]

export function CategorySelectionModal({
  open,
  selectedCategory,
  onSelectCategory,
  onOpenChange,
}: CategorySelectionModalProps) {
  const handleSelectCategory = (category: ListCategory) => {
    onSelectCategory(category)
    onOpenChange(false)
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="p-0 md:max-w-md md:mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <BottomSheetTitle className="text-xl font-bold">Choose a category</BottomSheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Category Options */}
        <div className="p-4 space-y-3">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = selectedCategory === option.key
            const Icon = option.icon

            return (
              <button
                key={option.key}
                onClick={() => handleSelectCategory(option.key)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-700'}`} />
                <span className={`text-base font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </BottomSheetContent>
    </BottomSheet>
  )
}
