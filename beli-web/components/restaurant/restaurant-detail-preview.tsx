'use client';

import { Restaurant } from '@/types';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { IoLocationOutline, IoCashOutline, IoTimeOutline, IoChevronForward } from 'react-icons/io5';

interface RestaurantDetailPreviewProps {
  restaurant: Restaurant;
}

export function RestaurantDetailPreview({ restaurant }: RestaurantDetailPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{restaurant.name}</h2>
            <p className="text-muted flex items-center gap-1">
              <IoLocationOutline className="w-4 h-4" />
              {restaurant.location.neighborhood}, {restaurant.location.city}
            </p>
          </div>
          <RatingBubble rating={restaurant.rating} size="lg" />
        </div>

        {/* Cuisine badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.cuisine.slice(0, 3).map((cuisine, i) => (
            <Badge key={i} variant="secondary">
              {cuisine}
            </Badge>
          ))}
        </div>

        {/* Quick info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted">
            <IoCashOutline className="w-4 h-4" />
            <span>{restaurant.priceRange}</span>
          </div>
          {restaurant.isOpen !== undefined && (
            <div className="flex items-center gap-1">
              <IoTimeOutline className="w-4 h-4" />
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
                <div className="text-xs text-muted mt-1">Rec Score</div>
              </CardContent>
            </Card>
          )}
          {restaurant.scores.friendScore !== undefined && (
            <Card className="beli-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {restaurant.scores.friendScore}
                </div>
                <div className="text-xs text-muted mt-1">Friends</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Popular dishes */}
      {restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
        <Card className="beli-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Popular Dishes</h3>
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
          <h3 className="font-semibold mb-2 text-sm">Tags</h3>
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
        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-sm">View full details</span>
        <IoChevronForward className="w-5 h-5 text-muted" />
      </Link>
    </div>
  );
}
