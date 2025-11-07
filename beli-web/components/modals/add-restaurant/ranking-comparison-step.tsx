'use client';

import * as React from 'react';

import { getRankingProgress } from '@/lib/utils/binarySearchRanking';

import type { Restaurant as RestaurantType, RankedRestaurant, RankingState } from '@/types';

interface RankingComparisonStepProps {
  targetRestaurant: RestaurantType;
  comparisonRestaurant: RankedRestaurant;
  rankingState: RankingState;
  onChoice: (choice: 'left' | 'right') => void;
}

export const RankingComparisonStep = ({
  targetRestaurant,
  comparisonRestaurant,
  rankingState,
  onChoice,
}: RankingComparisonStepProps) => {
  const progress = getRankingProgress(rankingState);

  return (
    <div className="rounded-2xl bg-white p-4">
      <h3 className="mb-4 text-center text-lg font-semibold text-foreground">
        Which do you prefer?
      </h3>

      <div className="relative mb-3 flex items-center justify-center gap-0">
        {/* Left Card - Target Restaurant */}
        <button
          onClick={() => onChoice('left')}
          className="flex min-h-[200px] w-[45%] flex-col items-center justify-center rounded-2xl border-[1.5px] border-gray-200 bg-white px-5 py-10 transition-colors hover:bg-gray-50"
        >
          <p className="mb-2 line-clamp-3 w-full break-words text-center text-[22px] font-bold leading-7 text-foreground">
            {targetRestaurant.name}
          </p>
          <p className="line-clamp-2 w-full text-center text-[13px] leading-[18px] text-secondary">
            {targetRestaurant.location.city}, {targetRestaurant.location.state}
          </p>
        </button>

        {/* OR Divider */}
        <div className="absolute left-1/2 z-10 flex h-[50px] w-[50px] -translate-x-1/2 items-center justify-center rounded-full bg-primary">
          <span className="text-[12px] font-bold text-white">OR</span>
        </div>

        {/* Right Card - Comparison Restaurant */}
        <button
          onClick={() => onChoice('right')}
          className="flex min-h-[200px] w-[45%] flex-col items-center justify-center rounded-2xl border-[1.5px] border-gray-200 bg-white px-5 py-10 transition-colors hover:bg-gray-50"
        >
          <p className="mb-2 line-clamp-3 w-full break-words text-center text-[22px] font-bold leading-7 text-foreground">
            {comparisonRestaurant.name}
          </p>
          <p className="line-clamp-2 w-full text-center text-[13px] leading-[18px] text-secondary">
            {comparisonRestaurant.location.city}, {comparisonRestaurant.location.state}
          </p>
          {comparisonRestaurant.userRating && (
            <p className="mt-1.5 text-[12px] font-semibold text-primary">
              {comparisonRestaurant.userRating.toFixed(1)}
            </p>
          )}
        </button>
      </div>

      {/* Progress indicator */}
      <p className="mt-2 text-center text-[13px] text-secondary">
        Comparison {progress.currentComparison} of ~{progress.estimatedTotal}
      </p>
    </div>
  );
}
