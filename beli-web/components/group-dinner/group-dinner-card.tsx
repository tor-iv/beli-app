import { Heart, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

import type { GroupDinnerMatch } from '@/types';

interface GroupDinnerCardProps {
  match: GroupDinnerMatch;
  onViewDetails?: () => void;
  savedCount?: number;
  className?: string;
}

export const GroupDinnerCard = ({
  match,
  onViewDetails,
  savedCount = 0,
  className,
}: GroupDinnerCardProps) => {
  const { restaurant, onListsCount, matchReasons, availability } = match;

  // Determine rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return 'text-green-600'; // Excellent
    if (rating >= 7.0) return 'text-lime-500'; // Good
    if (rating >= 5.0) return 'text-orange-500'; // Average
    return 'text-red-500'; // Poor
  };

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-white shadow-modal', className)}>
      {/* Restaurant Image */}
      <div className="relative h-[280px] w-full">
        <Image src={restaurant.images[0]} alt={restaurant.name} fill className="object-cover" />

        {/* Saved Counter Badge */}
        {savedCount > 0 && (
          <div
            className={cn(
              'absolute left-3 top-3 flex items-center gap-1.5 rounded-lg px-2 py-1 shadow-card',
              savedCount >= 3 ? 'bg-green-600' : 'bg-primary'
            )}
          >
            <Heart className="h-4 w-4 fill-white text-white" />
            <span className="text-sm font-bold leading-[18px] text-white">{savedCount}</span>
          </div>
        )}

        {/* Availability Badge */}
        {availability && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 shadow-card">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-[13px] font-semibold leading-[17px] text-green-600">
              Available {availability.timeSlot}
            </span>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="mb-1 line-clamp-1 text-2xl font-bold text-foreground">{restaurant.name}</h3>

        {/* Meta Row */}
        <div className="mb-2 flex items-center text-[15px] text-muted">
          <span>{restaurant.cuisine.join(', ')}</span>
          <span className="mx-1">•</span>
          <span>{restaurant.priceRange}</span>
          {restaurant.distance !== undefined && (
            <>
              <span className="mx-1">•</span>
              <span>{restaurant.distance.toFixed(1)} mi</span>
            </>
          )}
        </div>

        {/* Rating */}
        <div className="mb-4 flex items-center">
          <div className="mr-2 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-gray-300 bg-white">
            <span className={cn('text-lg font-bold', getRatingColor(restaurant.rating))}>
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          {restaurant.ratingCount && (
            <span className="text-[13px] text-muted">({restaurant.ratingCount} reviews)</span>
          )}
        </div>

        {/* Match Info */}
        <div className="bg-primary/8 rounded-lg p-3">
          {/* Header */}
          <div className="mb-2 flex items-center gap-1.5">
            <Users className="h-[18px] w-[18px] text-primary" />
            <span className="text-[15px] font-semibold leading-[21px] text-primary">
              {onListsCount === 1 ? 'Match Info' : `${onListsCount} people want this!`}
            </span>
          </div>

          {/* Reasons */}
          <div className="space-y-1">
            {matchReasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-2 pl-1">
                <span className="mr-1 text-[15px] font-bold leading-[21px] text-primary">•</span>
                <span className="flex-1 text-[15px] leading-[21px] text-foreground">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* More Info Button */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 transition-colors hover:bg-gray-50"
          >
            <span className="text-[15px] font-semibold text-primary">More Info</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </button>
        )}
      </div>
    </div>
  );
}
