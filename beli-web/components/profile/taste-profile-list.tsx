'use client';

import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { CuisineBreakdown, CityBreakdown, CountryBreakdown } from '@/types';

export type SortOption = 'count' | 'avgScore';

interface TasteProfileListProps {
  data: Array<CuisineBreakdown | CityBreakdown | CountryBreakdown>;
  totalCount: number;
  sortBy: SortOption;
  onSortPress: () => void;
  onItemPress: (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => void;
}

function getRatingColor(rating: number): string {
  if (rating >= 8.0) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (rating >= 7.0) return 'bg-green-100 text-green-700 border-green-200';
  if (rating >= 5.0) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

function RatingBubble({ rating }: { rating: number }) {
  const colorClasses = getRatingColor(rating);

  return (
    <div
      className={`flex items-center justify-center w-11 h-11 rounded-full border ${colorClasses} font-semibold text-sm`}
    >
      {rating.toFixed(1)}
    </div>
  );
}

export function TasteProfileList({
  data,
  totalCount,
  sortBy,
  onSortPress,
  onItemPress,
}: TasteProfileListProps) {
  const getSortLabel = () => {
    return sortBy === 'count' ? 'Sort: Count' : 'Sort: Avg. Score';
  };

  const getItemName = (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => {
    if ('cuisine' in item) return item.cuisine;
    if ('city' in item) return item.city;
    return item.country;
  };

  return (
    <div className="bg-white mt-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <p className="text-base font-medium text-gray-600">
          {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
        </p>
        <button
          onClick={onSortPress}
          className="flex items-center gap-2 py-1 px-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">{getSortLabel()}</span>
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {data.map((item, index) => {
          const name = getItemName(item);

          return (
            <button
              key={`${name}-${index}`}
              onClick={() => onItemPress(item)}
              className="w-full flex justify-between items-center py-4 px-6 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-1 text-left">
                <p className="text-base font-semibold text-gray-900 mb-1">{name}</p>
                <p className="text-sm text-gray-600">{item.count} places</p>
              </div>

              <div className="flex items-center gap-4">
                <RatingBubble rating={item.avgScore} />
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
