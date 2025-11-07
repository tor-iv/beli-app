"use client"

import * as React from "react"
import type { Restaurant as RestaurantType, RankedRestaurant, RankingState } from "@/types"
import { getRankingProgress } from "@/lib/utils/binarySearchRanking"

interface RankingComparisonStepProps {
  targetRestaurant: RestaurantType
  comparisonRestaurant: RankedRestaurant
  rankingState: RankingState
  onChoice: (choice: "left" | "right") => void
}

export function RankingComparisonStep({
  targetRestaurant,
  comparisonRestaurant,
  rankingState,
  onChoice,
}: RankingComparisonStepProps) {
  const progress = getRankingProgress(rankingState)

  return (
    <div className="bg-white rounded-2xl p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
        Which do you prefer?
      </h3>

      <div className="flex items-center justify-center gap-0 mb-3 relative">
        {/* Left Card - Target Restaurant */}
        <button
          onClick={() => onChoice("left")}
          className="w-[45%] min-h-[200px] flex flex-col items-center justify-center px-5 py-10 border-[1.5px] border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors"
        >
          <p className="text-[22px] font-bold text-foreground text-center leading-7 mb-2 line-clamp-3 break-words w-full">
            {targetRestaurant.name}
          </p>
          <p className="text-[13px] text-secondary text-center leading-[18px] line-clamp-2 w-full">
            {targetRestaurant.location.city}, {targetRestaurant.location.state}
          </p>
        </button>

        {/* OR Divider */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[50px] h-[50px] rounded-full bg-primary flex items-center justify-center">
          <span className="text-[12px] font-bold text-white">OR</span>
        </div>

        {/* Right Card - Comparison Restaurant */}
        <button
          onClick={() => onChoice("right")}
          className="w-[45%] min-h-[200px] flex flex-col items-center justify-center px-5 py-10 border-[1.5px] border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors"
        >
          <p className="text-[22px] font-bold text-foreground text-center leading-7 mb-2 line-clamp-3 break-words w-full">
            {comparisonRestaurant.name}
          </p>
          <p className="text-[13px] text-secondary text-center leading-[18px] line-clamp-2 w-full">
            {comparisonRestaurant.location.city}, {comparisonRestaurant.location.state}
          </p>
          {comparisonRestaurant.userRating && (
            <p className="text-[12px] font-semibold text-primary mt-1.5">
              {comparisonRestaurant.userRating.toFixed(1)}
            </p>
          )}
        </button>
      </div>

      {/* Progress indicator */}
      <p className="text-[13px] text-secondary text-center mt-2">
        Comparison {progress.currentComparison} of ~{progress.estimatedTotal}
      </p>
    </div>
  )
}
