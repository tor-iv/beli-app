import { Restaurant } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { IoLocationSharp } from 'react-icons/io5';
import Link from 'next/link';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="beli-card cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              <p className="text-sm text-muted">
                {restaurant.cuisine.join(', ')} • {restaurant.priceRange}
              </p>
            </div>
            <RatingBubble rating={restaurant.rating} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-1 text-sm text-muted mb-3">
            <IoLocationSharp className="w-4 h-4" />
            <span>{restaurant.location.neighborhood}</span>
            {restaurant.distance && (
              <span className="ml-2">{restaurant.distance.toFixed(1)} mi</span>
            )}
          </div>

          {restaurant.friendAvatars && restaurant.friendAvatars.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {restaurant.friendAvatars.slice(0, 3).map((avatar, i) => (
                  <Avatar key={i} className="w-6 h-6 border-2 border-white">
                    <AvatarImage src={avatar} alt="" />
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted">
                {restaurant.friendsWantToTryCount} friends want to try
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
