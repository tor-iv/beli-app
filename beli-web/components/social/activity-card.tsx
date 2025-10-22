import { FeedItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RatingBubble } from '@/components/rating/rating-bubble';
import Link from 'next/link';

interface ActivityCardProps {
  activity: FeedItem;
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

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="beli-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
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
              <p className="text-sm text-muted">
                visited {activity.restaurant.name}
              </p>
              <p className="text-xs text-muted">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>

          <RatingBubble rating={activity.rating} size="sm" />
        </div>
      </CardHeader>

      <CardContent>
        <Link
          href={`/restaurant/${activity.restaurant.id}`}
          className="block mb-3"
        >
          <h3 className="font-semibold hover:underline">
            {activity.restaurant.name}
          </h3>
          <p className="text-sm text-muted">
            {activity.restaurant.cuisine.join(', ')} • {activity.restaurant.priceRange}
          </p>
        </Link>

        {activity.comment && (
          <p className="text-sm mb-3">{activity.comment}</p>
        )}

        {activity.photos && activity.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {activity.photos.slice(0, 4).map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="rounded-lg w-full aspect-square object-cover"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
