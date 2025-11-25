import { Heart, MessageCircle, Share2, Bookmark, PlusCircle, Utensils, RotateCcw } from 'lucide-react';
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

/**
 * Get the action verb based on activity type
 */
function getActionVerb(type: Activity['type']): string {
  switch (type) {
    case 'visit':
      return 'ranked';
    case 'review':
      return 'reviewed';
    case 'recommendation':
      return 'recommended';
    case 'want_to_try':
      return 'wants to try';
    case 'bookmark':
      return 'saved';
    default:
      return 'visited';
  }
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

  // Generate visit count (mock - in real app this would come from data)
  const visitCount = 1;

  return (
    <Card className="beli-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {/* Avatar - clickable to profile */}
            <Link href={`/profile/${activity.user.username}`}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={activity.user.avatar} alt={activity.user.displayName} />
                <AvatarFallback>{activity.user.displayName[0]}</AvatarFallback>
              </Avatar>
            </Link>

            {/* Activity headline with inline links */}
            <div className="flex-1">
              {/* Main action line: "username ranked Restaurant Name" */}
              <p className="text-base leading-snug">
                <Link
                  href={`/profile/${activity.user.username}`}
                  className="font-bold text-foreground hover:underline"
                >
                  {activity.user.username}
                </Link>
                <span className="text-foreground"> {getActionVerb(activity.type)} </span>
                <Link
                  href={`/restaurant/${activity.restaurant.id}`}
                  className="font-bold text-foreground hover:underline"
                >
                  {activity.restaurant.name}
                </Link>
              </p>

              {/* Companions line: "with Username" */}
              {activity.companions && activity.companions.length > 0 && (
                <p className="text-base text-foreground">
                  with{' '}
                  {activity.companions.map((companion, index) => (
                    <span key={companion.id}>
                      <Link
                        href={`/profile/${companion.username}`}
                        className="font-bold hover:underline"
                      >
                        {companion.displayName}
                      </Link>
                      {index < activity.companions!.length - 1 && ', '}
                    </span>
                  ))}
                </p>
              )}

              {/* Location line with fork/knife icon */}
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <Utensils className="h-3.5 w-3.5" />
                <span>•</span>
                <span>{activity.restaurant.location.neighborhood}, {activity.restaurant.location.city}</span>
              </p>

              {/* Visit count */}
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{visitCount} visit{visitCount !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>

          {/* Rating bubble */}
          <RatingBubble rating={activity.rating} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Photos - single image full width like in the design */}
        {activity.photos && activity.photos.length > 0 && (
          <div className="mb-3">
            {activity.photos.length === 1 ? (
              <img
                src={activity.photos[0]}
                alt=""
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '400px' }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
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
          </div>
        )}

        {/* Notes/Comment with bold "Notes:" label */}
        {activity.comment && (
          <p className="mb-3 text-base">
            <span className="font-bold">Notes:</span> {activity.comment}
          </p>
        )}

        {/* Likes and comments count */}
        <div className="flex items-center gap-4 text-sm text-foreground">
          {activity.interactions?.likes && activity.interactions.likes.length > 0 && (
            <span>{activity.interactions.likes.length} like{activity.interactions.likes.length !== 1 ? 's' : ''}</span>
          )}
          {activity.interactions?.comments && activity.interactions.comments.length > 0 && (
            <button
              onClick={onComment}
              className="text-muted-foreground hover:text-foreground"
            >
              View {activity.interactions.comments.length} comment{activity.interactions.comments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Social Actions */}
        <div className="mt-2 flex items-center justify-between border-t pt-3">
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
                className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-800'}`}
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
              <MessageCircle className="h-6 w-6 text-gray-800" />
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
              <Share2 className="h-6 w-6 text-gray-800" />
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
              <PlusCircle className="h-6 w-6 text-gray-800" />
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
                className={`h-6 w-6 ${isBookmarked ? 'fill-[#0B7B7F] text-[#0B7B7F]' : 'text-gray-800'}`}
              />
            </Button>
          </div>
        </div>

        {/* Timestamp */}
        <p className="mt-2 text-xs text-muted-foreground">
          {formatTimeAgo(activity.timestamp)}
        </p>
      </CardContent>
    </Card>
  );
}
