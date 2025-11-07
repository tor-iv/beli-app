'use client';

import { CheckCircle, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { GroupDinnerMatch } from '@/types';

interface SelectionScreenProps {
  savedRestaurants: GroupDinnerMatch[];
  onSelectRestaurant: (match: GroupDinnerMatch) => void;
  onStartOver: () => void;
  onBack: () => void;
  onViewDetails: (restaurantId: string) => void;
}

interface RestaurantOptionCardProps {
  match: GroupDinnerMatch;
  optionNumber: number;
  onChoose: () => void;
  onViewDetails: () => void;
}

const RestaurantOptionCard = ({
  match,
  optionNumber,
  onChoose,
  onViewDetails,
}: RestaurantOptionCardProps) => {
  const { restaurant, matchReasons, availability } = match;

  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return 'text-green-600';
    if (rating >= 7.0) return 'text-lime-500';
    if (rating >= 5.0) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-cardElevated">
      {/* Option Badge */}
      <div className="bg-primary px-3 py-1.5 text-sm font-semibold text-white">
        Option {optionNumber}
      </div>

      {/* Restaurant Image */}
      <div className="relative h-[200px]">
        <Image src={restaurant.images[0]} alt={restaurant.name} fill className="object-cover" />
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="mb-1 line-clamp-1 text-xl font-bold text-foreground">{restaurant.name}</h3>

        {/* Meta Row */}
        <div className="mb-2 flex items-center text-sm text-gray-700">
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
        <div className="mb-3 flex items-center">
          <div className="mr-2 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-gray-300 bg-white">
            <span className={cn('text-lg font-bold', getRatingColor(restaurant.rating))}>
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          {restaurant.ratingCount && (
            <span className="text-xs text-muted">({restaurant.ratingCount} reviews)</span>
          )}
        </div>

        {/* Match Highlights */}
        <div className="bg-primary/8 mb-3 rounded-lg p-3">
          <div className="space-y-1.5">
            {/* Show first 2 match reasons */}
            {matchReasons.slice(0, 2).map((reason, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mr-1 text-sm font-bold leading-[18px] text-primary">•</span>
                <span className="flex-1 text-sm leading-[18px] text-foreground">{reason}</span>
              </div>
            ))}

            {/* Availability */}
            {availability && (
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm leading-[18px] text-foreground">
                  Available {availability.timeSlot}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Choose Button */}
        <Button onClick={onChoose} className="mb-2 w-full">
          Choose This One
        </Button>

        {/* View Details Link */}
        <button
          onClick={onViewDetails}
          className="w-full py-2 text-sm font-medium text-primary hover:underline"
        >
          View full details
        </button>
      </div>
    </div>
  );
}

export const SelectionScreen = ({
  savedRestaurants,
  onSelectRestaurant,
  onStartOver,
  onBack,
  onViewDetails,
}: SelectionScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-6">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h1 className="text-center text-2xl font-bold">Choose Your Spot!</h1>
        <p className="mt-2 text-center text-base text-muted">
          You've saved {savedRestaurants.length} great options
        </p>
      </div>

      {/* Scrollable Cards */}
      <div className="space-y-4 px-4 py-4 pb-24">
        {savedRestaurants.map((match, index) => (
          <RestaurantOptionCard
            key={match.restaurant.id}
            match={match}
            optionNumber={index + 1}
            onChoose={() => onSelectRestaurant(match)}
            onViewDetails={() => onViewDetails(match.restaurant.id)}
          />
        ))}
      </div>

      {/* Fixed Footer */}
      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        <Button variant="outline" onClick={onStartOver} className="w-full">
          Start Over & Keep Swiping
        </Button>
      </div>
    </div>
  );
}
