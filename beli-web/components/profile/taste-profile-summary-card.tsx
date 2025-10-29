'use client';

import { Share2, MapPin, UtensilsCrossed, Globe } from 'lucide-react';
import { Last30DaysStats } from '@/types';

interface TasteProfileSummaryCardProps {
  stats: Last30DaysStats;
  onShare?: () => void;
}

export function TasteProfileSummaryCard({ stats, onShare }: TasteProfileSummaryCardProps) {
  const percentile = 100 - stats.activityPercentile;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-indigo-600 p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm font-semibold text-white/90 tracking-widest">LAST 30 DAYS</p>
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Share taste profile"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Title - Enhanced visibility */}
      <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
        Top {percentile}% Diner
      </h2>

      {/* Location */}
      <div className="flex items-center gap-2 mb-10">
        <MapPin className="w-5 h-5 text-white/90" />
        <p className="text-lg text-white/95">{stats.primaryLocation}</p>
      </div>

      {/* Stats Row */}
      <div className="flex gap-16 mb-8">
        <div className="flex flex-col">
          <p className="text-6xl font-bold text-white mb-2 drop-shadow-md">{stats.restaurantsCount}</p>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-white/90" />
            <p className="text-base text-white/95">Restaurants</p>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-6xl font-bold text-white mb-2 drop-shadow-md">{stats.cuisinesCount}</p>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-white/90" />
            <p className="text-base text-white/95">Cuisines</p>
          </div>
        </div>
      </div>

      {/* Activity Comparison */}
      <p className="text-base text-white/95 mb-10 leading-relaxed">
        More active than {stats.activityPercentile}% of diners in {stats.primaryLocation}
      </p>

      {/* Beli Logo */}
      <p className="text-4xl font-light text-white text-center tracking-wide">beli</p>
    </div>
  );
}
