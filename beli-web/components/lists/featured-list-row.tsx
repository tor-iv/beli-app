'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface FeaturedListRowProps {
  id: string
  title: string
  description: string
  thumbnailImage: string
  progressText: string
  isLast?: boolean
}

export function FeaturedListRow({
  id,
  title,
  description,
  thumbnailImage,
  progressText,
  isLast = false,
}: FeaturedListRowProps) {
  return (
    <Link
      href={`/tastemakers/lists/${id}`}
      className={`
        flex items-center bg-white px-4 py-4 hover:bg-gray-50 transition-colors
        ${isLast ? '' : 'border-b border-gray-200'}
      `}
    >
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 mr-4">
        <Image
          src={thumbnailImage}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
          {title}
        </h3>
        <p className="text-base text-gray-800 line-clamp-2 leading-tight mb-1">
          {description}
        </p>
        <p className="text-sm text-gray-700">
          {progressText}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-800 ml-2 flex-shrink-0" />
    </Link>
  )
}
