'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Utensils, MapPin, RefreshCw } from 'lucide-react';
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

export const ProfileActivityCard = React.memo(function ProfileActivityCard({
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
}: ProfileActivityCardProps) {

  return (
    <button
      onClick={onPress}
      className="w-full bg-white px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
      type="button"
      aria-label={`View details for ${restaurantName}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="text-base text-gray-900 leading-5">
            <span className="font-semibold">{userName}</span> {action}{' '}
            <span className="font-semibold">{restaurantName}</span>
          </p>
          {cuisine && location && (
            <p className="text-sm text-gray-700 mt-0.5 flex items-center gap-1">
              <Utensils className="w-3 h-3" />
              {cuisine} · {location}
            </p>
          )}
          {visitCount !== undefined && (
            <p className="text-sm text-gray-700 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {visitCount} visit{visitCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {rating !== undefined && (
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center border-2"
            style={{ borderColor: COLORS.ui.border }}
          >
            <span
              className="text-xl font-bold"
              style={{ color: getRatingColor(rating) }}
            >
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {image && (
        <div className="relative w-full h-[200px] rounded-lg overflow-hidden mb-2">
          <Image
            src={image}
            alt={restaurantName}
            fill
            className="object-cover"
          />
        </div>
      )}

      {notes && (
        <p className="text-base text-gray-900 leading-6">Notes: {notes}</p>
      )}
    </button>
  );
});
