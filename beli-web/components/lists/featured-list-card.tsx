'use client';

import { MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import type { List } from '@/types';

interface FeaturedListCardProps {
  list: List;
  progress?: { visited: number; total: number };
}

export const FeaturedListCard = ({ list, progress }: FeaturedListCardProps) => {
  const progressPercentage = progress ? Math.round((progress.visited / progress.total) * 100) : 0;

  return (
    <Link
      href={`/tastemakers/lists/${list.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
    >
      {/* Image Section with Gradient Overlay */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={
            list.thumbnailImage ||
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop'
          }
          alt={list.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Badge */}
        {list.restaurants.length > 10 && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-bold text-white shadow-lg">
            <TrendingUp className="h-4 w-4" />
            <span>Popular</span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="mb-2 text-2xl font-bold text-white drop-shadow-lg">{list.name}</h3>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <MapPin className="h-4 w-4" />
            <span>{list.restaurants.length} restaurants</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Description */}
        <p className="mb-4 line-clamp-2 text-base leading-relaxed text-gray-700">
          {list.description || 'Explore this curated collection of exceptional dining experiences.'}
        </p>

        {/* Progress Section */}
        {progress && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Progress Text */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-800">
                You've been to {progress.visited} of {progress.total}
              </span>
              <span className="font-semibold text-primary">{progressPercentage}%</span>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
            <span>Explore list</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
