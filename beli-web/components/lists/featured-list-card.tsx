'use client'

import Link from 'next/link'
import { MapPin, TrendingUp } from 'lucide-react'
import { List } from '@/types'

interface FeaturedListCardProps {
  list: List
  progress?: { visited: number; total: number }
}

export function FeaturedListCard({ list, progress }: FeaturedListCardProps) {
  const progressPercentage = progress
    ? Math.round((progress.visited / progress.total) * 100)
    : 0

  return (
    <Link
      href={`/tastemakers/lists/${list.id}`}
      className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
    >
      {/* Image Section with Gradient Overlay */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={list.thumbnailImage || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop'}
          alt={list.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Badge */}
        {list.restaurants.length > 10 && (
          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <TrendingUp className="w-4 h-4" />
            <span>Popular</span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
            {list.name}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{list.restaurants.length} restaurants</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-2">
          {list.description || 'Explore this curated collection of exceptional dining experiences.'}
        </p>

        {/* Progress Section */}
        {progress && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Progress Text */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                You've been to {progress.visited} of {progress.total}
              </span>
              <span className="text-primary font-semibold">
                {progressPercentage}%
              </span>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-2">
            <span>Explore list</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
