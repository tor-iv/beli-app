'use client';

import { Utensils, MapPin, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getRatingColor, COLORS } from '@/lib/theme/colors';

interface ProfileActivityCardProps {
  userAvatar: string;
  userName: string;
  action: string;
  restaurantName: string;
  cuisine?: string;
  location?: string;
  rating?: number;
  visitCount?: number;
  image?: string;
  notes?: string;
  onPress?: () => void;
}

export const ProfileActivityCard = React.memo(({
  userAvatar,
  userName,
  action,
  restaurantName,
  cuisine,
  location,
  rating,
  visitCount,
  image,
  notes,
  onPress,
}: ProfileActivityCardProps) => {
  return (
    <button
      onClick={onPress}
      className="w-full border-b border-gray-200 bg-white px-6 py-4 text-left transition-colors hover:bg-gray-50"
      type="button"
      aria-label={`View details for ${restaurantName}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="text-base leading-5 text-gray-900">
            <span className="font-semibold">{userName}</span> {action}{' '}
            <span className="font-semibold">{restaurantName}</span>
          </p>
          {cuisine && location && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-700">
              <Utensils className="h-3 w-3" />
              {cuisine} · {location}
            </p>
          )}
          {visitCount !== undefined && (
            <p className="flex items-center gap-1 text-sm text-gray-700">
              <RefreshCw className="h-3 w-3" />
              {visitCount} visit{visitCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {rating !== undefined && (
          <div
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2"
            style={{ borderColor: COLORS.ui.border }}
          >
            <span className="text-xl font-bold" style={{ color: getRatingColor(rating) }}>
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {image && (
        <div className="relative mb-2 h-[200px] w-full overflow-hidden rounded-lg">
          <Image src={image} alt={restaurantName} fill className="object-cover" />
        </div>
      )}

      {notes && <p className="text-base leading-6 text-gray-900">Notes: {notes}</p>}
    </button>
  );
});
