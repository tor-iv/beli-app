'use client';

import Link from 'next/link';
import { IoLocationOutline, IoCashOutline, IoTimeOutline, IoChevronForward } from 'react-icons/io5';

import { RatingBubble } from '@/components/rating/rating-bubble';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { Restaurant } from '@/types';

interface RestaurantDetailPreviewProps {
  restaurant: Restaurant;
}

export const RestaurantDetailPreview = ({ restaurant }: RestaurantDetailPreviewProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="mb-1 text-2xl font-bold">{restaurant.name}</h2>
            <p className="flex items-center gap-1 text-muted">
              <IoLocationOutline className="h-4 w-4" />
              {restaurant.location.neighborhood}, {restaurant.location.city}
            </p>
          </div>
          <RatingBubble rating={restaurant.rating} size="lg" />
        </div>

        {/* Cuisine badges */}
        <div className="mb-3 flex flex-wrap gap-2">
          {restaurant.cuisine.slice(0, 3).map((cuisine, i) => (
            <Badge key={i} variant="secondary">
              {cuisine}
            </Badge>
          ))}
        </div>

        {/* Quick info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted">
            <IoCashOutline className="h-4 w-4" />
            <span>{restaurant.priceRange}</span>
          </div>
          {restaurant.isOpen !== undefined && (
            <div className="flex items-center gap-1">
              <IoTimeOutline className="h-4 w-4" />
              <span className={restaurant.isOpen ? 'text-green-600' : 'text-red-600'}>
                {restaurant.isOpen ? 'Open now' : 'Closed'}
              </span>
              {restaurant.closingTime && restaurant.isOpen && (
                <span className="text-muted">• Closes {restaurant.closingTime}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scores */}
      {restaurant.scores && (
        <div className="grid grid-cols-2 gap-3">
          {restaurant.scores.recScore !== undefined && (
            <Card className="beli-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {restaurant.scores.recScore.toFixed(1)}
                </div>
                <div className="mt-1 text-xs text-muted">Rec Score</div>
              </CardContent>
            </Card>
          )}
          {restaurant.scores.friendScore !== undefined && (
            <Card className="beli-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {restaurant.scores.friendScore}
                </div>
                <div className="mt-1 text-xs text-muted">Friends</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Popular dishes */}
      {restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
        <Card className="beli-card">
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">Popular Dishes</h3>
            <div className="space-y-2">
              {restaurant.popularDishes.slice(0, 3).map((dish, index) => (
                <div key={index} className="text-sm">
                  • {dish}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {restaurant.tags && restaurant.tags.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.slice(0, 6).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* View full details link */}
      <Link
        href={`/restaurant/${restaurant.id}`}
        className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
      >
        <span className="text-sm font-medium">View full details</span>
        <IoChevronForward className="h-5 w-5 text-muted" />
      </Link>
    </div>
  );
}
