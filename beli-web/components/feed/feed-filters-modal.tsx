'use client';

import { CheckCircle, Circle } from 'lucide-react';
import * as React from 'react';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetClose,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FeedFilters {
  rankingsOnly: boolean;
  topRatedOnly: boolean;
  restaurantsOnly: boolean;
}

interface FeedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FeedFilters;
  onApply: (filters: FeedFilters) => void;
}

export const FeedFiltersModal = ({ open, onOpenChange, filters, onApply }: FeedFiltersModalProps) => {
  const [localFilters, setLocalFilters] = React.useState<FeedFilters>(filters);

  // Update local state when filters prop or modal visibility changes
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const toggleFilter = (key: keyof FeedFilters) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClearAll = () => {
    setLocalFilters({
      rankingsOnly: false,
      topRatedOnly: false,
      restaurantsOnly: false,
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const renderCheckbox = (label: string, key: keyof FeedFilters, description?: string) => {
    const isChecked = localFilters[key];

    return (
      <button
        onClick={() => toggleFilter(key)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <div className="mr-3 flex-1">
          <p className="mb-0.5 text-lg font-medium text-foreground">{label}</p>
          {description && <p className="text-sm leading-4 text-secondary">{description}</p>}
        </div>
        {isChecked ? (
          <CheckCircle className="h-7 w-7 flex-shrink-0 text-primary" />
        ) : (
          <Circle className="text-tertiary h-7 w-7 flex-shrink-0" />
        )}
      </button>
    );
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-h-[80vh]" forceBottomSheet>
        <div className="pb-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <BottomSheetTitle className="text-xl font-bold text-foreground">
                Filter feed
              </BottomSheetTitle>
              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                SC
              </span>
            </div>
            <BottomSheetClose className="rounded-full p-1 hover:bg-gray-100">
              <span className="sr-only">Close</span>
            </BottomSheetClose>
          </div>

          {/* Filter Options */}
          <div className="pt-4">
            {renderCheckbox(
              'Rankings only',
              'rankingsOnly',
              'Show only posts with restaurant rankings'
            )}
            {renderCheckbox('Top rated (>9)', 'topRatedOnly', 'Show only excellent ratings (9.0+)')}
            {renderCheckbox(
              'Restaurants only',
              'restaurantsOnly',
              'Exclude bars, bakeries, and other categories'
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 pt-6">
            <button
              onClick={handleClearAll}
              className="text-lg font-medium text-primary hover:underline"
            >
              Clear All
            </button>
            <Button onClick={handleApply} className="rounded-full px-12 py-3 text-lg font-semibold">
              Apply
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
