'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/types';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { IoLocationSharp, IoRestaurant } from 'react-icons/io5';

interface InlineRestaurantCardProps {
  restaurant: Restaurant;
  rank?: number;
}

export function InlineRestaurantCard({ restaurant, rank }: InlineRestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="my-8 bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-2/5 h-64 md:h-auto">
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Rank Badge */}
            {rank && (
              <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                #{rank}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 md:p-8">
            {/* Restaurant Name & Rating */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted mb-3">
                  <IoLocationSharp size={16} />
                  <span>{restaurant.neighborhood}</span>
                  <span>•</span>
                  <IoRestaurant size={16} />
                  <span>{restaurant.cuisine}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <RatingBubble score={restaurant.averageScore} size="lg" />
              </div>
            </div>

            {/* Description */}
            {restaurant.description && (
              <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                {restaurant.description}
              </p>
            )}

            {/* Key Details */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {restaurant.priceRange}
              </span>
              {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  {restaurant.dietaryOptions[0]}
                </span>
              )}
              {restaurant.reservationRequired && (
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                  Reservation Required
                </span>
              )}
            </div>

            {/* Popular Dishes */}
            {restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Must-Try Dishes:</p>
                <div className="flex flex-wrap gap-2">
                  {restaurant.popularDishes.slice(0, 3).map((dish) => (
                    <span
                      key={dish.id}
                      className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded"
                    >
                      {dish.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-6">
              <span className="text-primary font-semibold group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                View Full Details
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
