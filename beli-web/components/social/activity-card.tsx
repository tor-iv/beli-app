import { Heart, MessageCircle, Share2, Bookmark, PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { RatingBubble } from '@/components/rating/rating-bubble';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  currentUserId?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onAddPress?: () => void;
}

function formatTimeAgo(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export const ActivityCard = ({
  activity,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onAddPress,
}: ActivityCardProps) => {
  const isLiked = currentUserId && activity.interactions?.likes?.includes(currentUserId);
  const isBookmarked = currentUserId && activity.interactions?.bookmarks?.includes(currentUserId);

  return (
    <Card className="beli-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.user.avatar} alt={activity.user.displayName} />
              <AvatarFallback>{activity.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/profile/${activity.user.username}`}
                className="font-semibold hover:underline"
              >
                {activity.user.displayName}
              </Link>
              <p className="text-sm text-muted">visited {activity.restaurant.name}</p>
              <p className="text-xs text-muted">{formatTimeAgo(activity.timestamp)}</p>
            </div>
          </div>

          <RatingBubble rating={activity.rating} size="sm" />
        </div>
      </CardHeader>

      <CardContent>
        <Link href={`/restaurant/${activity.restaurant.id}`} className="mb-3 block">
          <h3 className="font-semibold hover:underline">{activity.restaurant.name}</h3>
          <p className="text-sm text-muted">
            {activity.restaurant.cuisine.join(', ')} • {activity.restaurant.priceRange}
          </p>
        </Link>

        {activity.comment && <p className="mb-3 text-sm">{activity.comment}</p>}

        {activity.photos && activity.photos.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {activity.photos.slice(0, 4).map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Social Actions */}
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                onLike?.();
              }}
            >
              <Heart
                className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-800'}`}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                onComment?.();
              }}
            >
              <MessageCircle className="h-5 w-5 text-gray-800" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                onShare?.();
              }}
            >
              <Share2 className="h-5 w-5 text-gray-800" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                onAddPress?.();
              }}
            >
              <PlusCircle className="h-5 w-5 text-gray-800" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                onBookmark?.();
              }}
            >
              <Bookmark
                className={`h-5 w-5 ${isBookmarked ? 'fill-[#0B7B7F] text-[#0B7B7F]' : 'text-gray-800'}`}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
