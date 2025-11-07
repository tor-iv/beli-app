import { Utensils, MapPin } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface ChallengeActivityCardProps {
  userAvatar: string;
  userName: string;
  restaurantName: string;
  cuisine: string;
  neighborhood: string;
  rating: number;
  notes?: string;
  date: string;
}

export const ChallengeActivityCard = ({
  userAvatar,
  userName,
  restaurantName,
  cuisine,
  neighborhood,
  rating,
  notes,
  date,
}: ChallengeActivityCardProps) => {
  // Determine rating color based on score
  const getRatingColor = (score: number) => {
    if (score >= 8.0) return 'bg-green-500';
    if (score >= 7.0) return 'bg-green-400';
    if (score >= 5.0) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="border-b border-gray-100 bg-white px-4 py-4 last:border-b-0">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Image src={userAvatar} alt={userName} width={40} height={40} className="rounded-full" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[15px] text-foreground">
            You ranked <span className="font-semibold">{restaurantName}</span>
          </p>

          {/* Restaurant info */}
          <div className="mb-2 flex items-center gap-2 text-sm text-secondary">
            <Utensils className="h-3.5 w-3.5" />
            <span>{cuisine}</span>
            <span>•</span>
            <MapPin className="h-3.5 w-3.5" />
            <span>{neighborhood}</span>
          </div>

          {/* Rating bubble */}
          <div className="mb-2 flex items-center gap-2">
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                getRatingColor(rating)
              )}
            >
              <span className="text-lg font-bold text-white">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="mb-2 rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-secondary">
                <span className="font-semibold text-foreground">Notes:</span> {notes}
              </p>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-secondary">{date}</p>
        </div>
      </div>
    </div>
  );
}
