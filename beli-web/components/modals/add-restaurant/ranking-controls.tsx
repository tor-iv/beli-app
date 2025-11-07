'use client';

import { Undo2, ArrowRight } from 'lucide-react';
import * as React from 'react';

import type { RankingState } from '@/types';

interface RankingControlsProps {
  rankingState: RankingState;
  onUndo: () => void;
  onSkip: () => void;
  onTooTough: () => void;
}

export const RankingControls = ({
  rankingState,
  onUndo,
  onSkip,
  onTooTough,
}: RankingControlsProps) => {
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onUndo}
          disabled={rankingState.comparisonHistory.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 disabled:opacity-40"
        >
          <Undo2 className="h-[18px] w-[18px]" />
          <span className="text-base font-medium">Undo</span>
        </button>

        <button
          onClick={onTooTough}
          className="rounded-full border-[1.5px] border-gray-200 px-4 py-2"
        >
          <span className="text-base font-medium">Too tough</span>
        </button>

        <button
          onClick={onSkip}
          disabled={rankingState.skipsRemaining === 0}
          className="flex items-center gap-1.5 px-3 py-2 disabled:opacity-40"
        >
          <span className="text-base font-medium">
            Skip{rankingState.skipsRemaining > 0 && ` (${rankingState.skipsRemaining})`}
          </span>
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
