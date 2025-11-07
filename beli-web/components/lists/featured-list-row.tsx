'use client';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedListRowProps {
  id: string;
  title: string;
  description: string;
  thumbnailImage: string;
  progressText: string;
  isLast?: boolean;
}

export const FeaturedListRow = ({
  id,
  title,
  description,
  thumbnailImage,
  progressText,
  isLast = false,
}: FeaturedListRowProps) => {
  return (
    <Link
      href={`/tastemakers/lists/${id}`}
      className={`flex items-center bg-white px-4 py-4 transition-colors hover:bg-gray-50 ${isLast ? '' : 'border-b border-gray-200'} `}
    >
      <div className="relative mr-4 h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        <Image src={thumbnailImage} alt={title} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 truncate text-lg font-bold text-gray-900">{title}</h3>
        <p className="mb-1 line-clamp-2 text-base leading-tight text-gray-800">{description}</p>
        <p className="text-sm text-gray-700">{progressText}</p>
      </div>
      <ChevronRight className="ml-2 h-5 w-5 flex-shrink-0 text-gray-800" />
    </Link>
  );
}
