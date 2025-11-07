import Link from 'next/link';
import { IoLocationSharp } from 'react-icons/io5';

import { RatingBubble } from '@/components/rating/rating-bubble';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { Restaurant } from '@/types';


interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="beli-card cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{restaurant.name}</h3>
              <p className="text-sm text-muted">
                {restaurant.cuisine.join(', ')} • {restaurant.priceRange}
              </p>
            </div>
            <RatingBubble rating={restaurant.rating} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-3 flex items-center gap-1 text-sm text-muted">
            <IoLocationSharp className="h-4 w-4" />
            <span>{restaurant.location.neighborhood}</span>
            {restaurant.distance && (
              <span className="ml-2">{restaurant.distance.toFixed(1)} mi</span>
            )}
          </div>

          {restaurant.friendAvatars && restaurant.friendAvatars.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {restaurant.friendAvatars.slice(0, 3).map((avatar, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-white">
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
