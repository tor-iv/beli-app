'use client';

import { ArrowUpDown, ChevronRight } from 'lucide-react';

import { RatingBubble } from '@/components/rating/rating-bubble';

import type { CuisineBreakdown, CityBreakdown, CountryBreakdown } from '@/types';

export type SortOption = 'count' | 'avgScore';

interface TasteProfileListProps {
  data: Array<CuisineBreakdown | CityBreakdown | CountryBreakdown>;
  totalCount: number;
  sortBy: SortOption;
  onSortPress: () => void;
  onItemPress: (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => void;
}

export const TasteProfileList = ({
  data,
  totalCount,
  sortBy,
  onSortPress,
  onItemPress,
}: TasteProfileListProps) => {
  const getSortLabel = () => {
    return sortBy === 'count' ? 'Sort: Count' : 'Sort: Avg. Score';
  };

  const getItemName = (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => {
    if ('cuisine' in item) return item.cuisine;
    if ('city' in item) return item.city;
    return item.country;
  };

  const getUniqueKey = (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => {
    if ('cuisine' in item) return `cuisine-${item.cuisine}`;
    if ('city' in item) return `city-${item.city}`;
    return `country-${item.country}`;
  };

  return (
    <div className="mt-4 rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <p className="text-base font-medium text-gray-800">
          {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
        </p>
        <button
          onClick={onSortPress}
          className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1 transition-colors hover:bg-gray-50"
          type="button"
          aria-label={`Change sort to ${sortBy === 'count' ? 'average score' : 'count'}`}
        >
          <ArrowUpDown className="h-4 w-4 text-gray-800" />
          <span className="text-sm text-gray-800">{getSortLabel()}</span>
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {data.map((item) => {
          const name = getItemName(item);

          return (
            <button
              key={getUniqueKey(item)}
              onClick={() => onItemPress(item)}
              className="group flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
              type="button"
              aria-label={`View restaurants for ${name}`}
            >
              <div className="flex-1 text-left">
                <p className="mb-1 text-base font-semibold text-gray-900">{name}</p>
                <p className="text-sm text-gray-800">{item.count} places</p>
              </div>

              <div className="flex items-center gap-4">
                <RatingBubble rating={item.avgScore} />
                <ChevronRight className="h-5 w-5 text-gray-800 transition-colors group-hover:text-gray-800" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
