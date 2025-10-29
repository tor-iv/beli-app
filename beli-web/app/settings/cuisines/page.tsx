"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckboxRow } from "@/components/settings/checkbox-row"
import { useUserSettingsStore } from "@/lib/stores/user-settings-store"
import { useRouter } from "next/navigation"

const cuisineOptions = [
  "American",
  "Barbecue",
  "British",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Latin American",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Spanish",
  "Thai",
  "Vietnamese",
]

export default function DislikedCuisinesPage() {
  const router = useRouter()
  const dislikedCuisines = useUserSettingsStore((state) => state.dislikedCuisines)
  const toggleDislikedCuisine = useUserSettingsStore((state) => state.toggleDislikedCuisine)

  const handleSave = () => {
    // Cuisines are saved in real-time via Zustand store
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10" /> {/* Spacer */}
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Your disliked cuisines</h1>
          <p className="text-sm text-secondary">
            Beli won&apos;t recommend these types of restaurants to you.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          {cuisineOptions.map((option) => (
            <CheckboxRow
              key={option}
              label={option}
              checked={dislikedCuisines.includes(option)}
              onCheckedChange={() => toggleDislikedCuisine(option)}
            />
          ))}
        </div>

        {/* Save Button */}
        <div className="px-4 py-6">
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
