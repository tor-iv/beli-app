'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IoLocationSharp, IoRestaurant } from 'react-icons/io5';

import { RatingBubble } from '@/components/rating/rating-bubble';

import type { Restaurant } from '@/types';

interface InlineRestaurantCardProps {
  restaurant: Restaurant;
  rank?: number;
}

export const InlineRestaurantCard = ({ restaurant, rank }: InlineRestaurantCardProps) => {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="group my-8 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative h-64 w-full md:h-auto md:w-2/5">
            <Image
              src={
                restaurant.images?.[0] ||
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop'
              }
              alt={restaurant.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Rank Badge */}
            {rank && (
              <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-xl font-bold text-yellow-900 shadow-lg">
                #{rank}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 md:p-8">
            {/* Restaurant Name & Rating */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-bold transition-colors group-hover:text-primary">
                  {restaurant.name}
                </h3>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted">
                  <IoLocationSharp size={16} />
                  <span>{restaurant.location.neighborhood}</span>
                  <span>•</span>
                  <IoRestaurant size={16} />
                  <span>{restaurant.cuisine.join(', ')}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <RatingBubble
                  rating={restaurant.scores?.averageScore || restaurant.rating}
                  size="lg"
                />
              </div>
            </div>

            {/* Description - Using tags as a fallback since description doesn't exist */}
            {restaurant.tags && restaurant.tags.length > 0 && (
              <p className="mb-4 line-clamp-3 leading-relaxed text-gray-700">
                {restaurant.tags.join(' • ')}
              </p>
            )}

            {/* Key Details */}
            <div className="mb-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                {restaurant.priceRange}
              </span>
              {restaurant.acceptsReservations && (
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                  Reservations Available
                </span>
              )}
            </div>

            {/* Popular Dishes */}
            {restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-sm font-semibold text-gray-900">Must-Try Dishes:</p>
                <div className="flex flex-wrap gap-2">
                  {restaurant.popularDishes.slice(0, 3).map((dish, idx) => (
                    <span key={idx} className="rounded bg-gray-50 px-2 py-1 text-sm text-gray-800">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-6">
              <span className="inline-flex items-center gap-1 font-semibold text-primary transition-all group-hover:gap-2">
                View Full Details
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
