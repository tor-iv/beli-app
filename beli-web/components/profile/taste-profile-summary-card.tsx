'use client';

import { Share2, MapPin, UtensilsCrossed, Globe } from 'lucide-react';

import type { Last30DaysStats } from '@/types';

interface TasteProfileSummaryCardProps {
  stats: Last30DaysStats;
  onShare?: () => void;
}

export const TasteProfileSummaryCard = ({ stats, onShare }: TasteProfileSummaryCardProps) => {
  const percentile = 100 - stats.activityPercentile;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 p-8 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold tracking-widest text-white/90">LAST 30 DAYS</p>
        {onShare && (
          <button
            onClick={onShare}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            aria-label="Share taste profile"
          >
            <Share2 className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      {/* Title - Enhanced visibility */}
      <h2 className="mb-4 text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
        Top {percentile}% Diner
      </h2>

      {/* Location */}
      <div className="mb-10 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-white/90" />
        <p className="text-lg text-white/95">{stats.primaryLocation}</p>
      </div>

      {/* Stats Row */}
      <div className="mb-8 flex gap-16">
        <div className="flex flex-col">
          <p className="mb-2 text-6xl font-bold text-white drop-shadow-md">
            {stats.restaurantsCount}
          </p>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-white/90" />
            <p className="text-base text-white/95">Restaurants</p>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-6xl font-bold text-white drop-shadow-md">{stats.cuisinesCount}</p>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-white/90" />
            <p className="text-base text-white/95">Cuisines</p>
          </div>
        </div>
      </div>

      {/* Activity Comparison */}
      <p className="mb-10 text-base leading-relaxed text-white/95">
        More active than {stats.activityPercentile}% of diners in {stats.primaryLocation}
      </p>

      {/* Beli Logo */}
      <p className="text-center text-4xl font-light tracking-wide text-white">beli</p>
    </div>
  );
}
