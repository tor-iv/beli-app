'use client';

import { X, CheckCircle2, Circle } from 'lucide-react';
import * as React from 'react';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
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
  filters: FeedFilters;
  onClose: () => void;
  onApply: (filters: FeedFilters) => void;
}

interface CheckboxRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}

const CheckboxRow = ({ label, description, checked, onToggle }: CheckboxRowProps) => {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
    >
      <div className="mr-3 flex-1 text-left">
        <p className="mb-0.5 text-[17px] font-medium text-foreground">{label}</p>
        {description && <p className="text-sm leading-4 text-secondary">{description}</p>}
      </div>
      {checked ? (
        <CheckCircle2 className="h-7 w-7 flex-shrink-0 text-primary" />
      ) : (
        <Circle className="text-tertiary h-7 w-7 flex-shrink-0" />
      )}
    </button>
  );
}

export const FeedFiltersModal = ({ open, filters, onClose, onApply }: FeedFiltersModalProps) => {
  const [localFilters, setLocalFilters] = React.useState<FeedFilters>(filters);

  // Update local state when filters prop or modal opens
  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
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
    onClose();
  };

  return (
    <BottomSheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <BottomSheetContent height="auto" className="p-0" forceBottomSheet>
        {/* Header */}
        <BottomSheetHeader className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <BottomSheetTitle className="text-xl font-bold">Filter feed</BottomSheetTitle>
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
              SC
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-7 w-7 text-foreground" />
          </button>
        </BottomSheetHeader>

        {/* Filter Options */}
        <div className="pt-4">
          <CheckboxRow
            label="Rankings only"
            description="Show only posts with restaurant rankings"
            checked={localFilters.rankingsOnly}
            onToggle={() => toggleFilter('rankingsOnly')}
          />
          <CheckboxRow
            label="Top rated (>9)"
            description="Show only excellent ratings (9.0+)"
            checked={localFilters.topRatedOnly}
            onToggle={() => toggleFilter('topRatedOnly')}
          />
          <CheckboxRow
            label="Restaurants only"
            description="Exclude bars, bakeries, and other categories"
            checked={localFilters.restaurantsOnly}
            onToggle={() => toggleFilter('restaurantsOnly')}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex items-center justify-between px-4 py-4">
          <button
            onClick={handleClearAll}
            className="text-[17px] font-medium text-primary hover:underline"
          >
            Clear All
          </button>
          <Button
            onClick={handleApply}
            size="lg"
            className="h-auto rounded-full px-12 py-3 text-[17px] font-semibold"
          >
            Apply
          </Button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
