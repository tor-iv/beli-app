'use client';

import { IoSwapVertical, IoTrendingDown, IoTrendingUp, IoCheckmark } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useListFilters } from '@/lib/stores/list-filters';


const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating', icon: IoTrendingDown },
  { value: 'distance', label: 'Distance', icon: IoTrendingUp },
  { value: 'friends', label: 'Friends', icon: IoTrendingDown },
] as const;

export const SortSelector = () => {
  const { sortBy, sortDirection, setSortBy, setSortDirection } = useListFilters();

  const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortBy);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <IoSwapVertical className="h-4 w-4" />
          <span className="hidden sm:inline">Sort:</span>
          <span className="font-medium">{currentSort?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = sortBy === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                if (isActive) {
                  // Toggle direction if clicking current sort
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  // Set new sort with default direction
                  setSortBy(option.value);
                  // Rating and Friends default to descending, Distance to ascending
                  setSortDirection(option.value === 'distance' ? 'asc' : 'desc');
                }
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
              {isActive && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                  <IoCheckmark className="h-4 w-4 text-primary" />
                </div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
