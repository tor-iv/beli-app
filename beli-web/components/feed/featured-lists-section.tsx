'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

import type { List } from '@/types';

interface FeaturedListsSectionProps {
  lists: List[];
  onSeeAllClick?: () => void;
  className?: string;
}

interface FeaturedListCardProps {
  list: List;
  beenCount?: number;
}

const FeaturedListCard = ({ list, beenCount = 0 }: FeaturedListCardProps) => {
  const total = list.restaurants.length;

  return (
    <Link
      href={`/lists/featured/${list.id}`}
      className="group relative h-[240px] w-[85vw] flex-shrink-0 overflow-hidden rounded-2xl shadow-cardElevated"
    >
      <div className="relative h-full w-full">
        <Image
          src={
            list.thumbnailImage ||
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop'
          }
          alt={list.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/85" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="mb-1 text-2xl font-bold text-white drop-shadow-md">{list.name}</h3>
          <p className="text-base text-white/95 drop-shadow-sm">
            You've been to {beenCount} of {total}
          </p>
        </div>
      </div>
    </Link>
  );
}

export const FeaturedListsSection = ({
  lists,
  onSeeAllClick,
  className,
}: FeaturedListsSectionProps) => {
  if (lists.length === 0) return null;

  // Show first 6 featured lists
  const displayLists = lists.slice(0, 6);

  return (
    <div className={cn('pb-3 md:hidden', className)}>
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-xs font-semibold tracking-wide text-foreground">TASTEMAKERS</h2>
        <button
          onClick={onSeeAllClick}
          className="text-sm font-medium text-primary hover:underline"
        >
          See all
        </button>
      </div>

      {/* Horizontal Scroll */}
      <div className="scrollbar-hide overflow-x-auto">
        <div className="flex gap-3 px-4">
          {displayLists.map((list) => (
            <FeaturedListCard key={list.id} list={list} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
