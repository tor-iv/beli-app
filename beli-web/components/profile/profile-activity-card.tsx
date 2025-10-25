'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Utensils, MapPin, RefreshCw } from 'lucide-react';

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

export function ProfileActivityCard({
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
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#10B981'; // green-500
    if (rating >= 6) return '#84CC16'; // lime-500
    if (rating >= 4) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  return (
    <button
      onClick={onPress}
      className="w-full bg-white px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
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
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <Utensils className="w-3 h-3" />
              {cuisine} · {location}
            </p>
          )}
          {visitCount !== undefined && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {visitCount} visit{visitCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {rating !== undefined && (
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center border-2 border-gray-300"
            style={{ borderColor: '#D9D9DE' }}
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
}
