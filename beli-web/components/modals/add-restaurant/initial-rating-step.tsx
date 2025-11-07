'use client';

import {
  Utensils,
  Coffee,
  Cake,
  IceCream,
  MoreHorizontal,
  Users,
  Tag,
  Edit,
  Camera,
  Calendar,
  Lock,
  ChevronRight,
  Check,
  ChevronDown,
} from 'lucide-react';
import * as React from 'react';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  BottomSheetClose,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import type { Restaurant as RestaurantType, ListCategory } from '@/types';

const RATING_OPTIONS = [
  { key: 'liked' as const, label: 'I liked it!', color: 'bg-green-500' },
  { key: 'fine' as const, label: 'It was fine', color: 'bg-amber-200' },
  { key: 'disliked' as const, label: "I didn't like it", color: 'bg-red-200' },
];

const LIST_TYPE_OPTIONS = [
  { key: 'restaurants' as const, label: 'Restaurants', icon: Utensils },
  { key: 'bars' as const, label: 'Bars', icon: Coffee },
  { key: 'bakeries' as const, label: 'Bakeries', icon: Cake },
  { key: 'coffee_tea' as const, label: 'Coffee & Tea', icon: Coffee },
  { key: 'dessert' as const, label: 'Dessert', icon: IceCream },
  { key: 'other' as const, label: 'Other', icon: MoreHorizontal },
];

export type RatingType = 'liked' | 'fine' | 'disliked';
export type ListTypeKey = (typeof LIST_TYPE_OPTIONS)[number]['key'];

interface InitialRatingStepProps {
  restaurant: RestaurantType;
  rating: RatingType | null;
  onRatingChange: (rating: RatingType) => void;
  listType: ListTypeKey;
  onListTypeChange: (listType: ListTypeKey) => void;
  stealthMode: boolean;
  onStealthModeChange: (enabled: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const InitialRatingStep = ({
  restaurant,
  rating,
  onRatingChange,
  listType,
  onListTypeChange,
  stealthMode,
  onStealthModeChange,
  onSubmit,
  isLoading,
}: InitialRatingStepProps) => {
  const [showListTypePicker, setShowListTypePicker] = React.useState(false);

  const selectedListType = LIST_TYPE_OPTIONS.find((opt) => opt.key === listType);
  const SelectedIcon = selectedListType?.icon || Utensils;

  return (
    <>
      <div className="space-y-3">
        {/* List Type Selector */}
        <div className="rounded-2xl bg-white p-4">
          <p className="mb-2.5 text-sm text-foreground">Add to my list of</p>
          <button
            onClick={() => setShowListTypePicker(true)}
            className="flex w-full items-center gap-2 rounded-lg border-[1.5px] border-gray-200 px-3.5 py-2.5"
          >
            <SelectedIcon className="h-5 w-5 text-foreground" />
            <span className="flex-1 text-left text-base font-semibold text-foreground">
              {selectedListType?.label}
            </span>
            <ChevronDown className="h-5 w-5 text-secondary" />
          </button>
        </div>

        {/* Rating Section */}
        <div className="rounded-2xl bg-white p-4">
          <h3 className="mb-4 text-center text-lg font-semibold text-foreground">How was it?</h3>
          <div className="flex justify-around gap-2">
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => onRatingChange(option.key)}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    'flex h-[70px] w-[70px] items-center justify-center rounded-full',
                    option.color,
                    rating === option.key && 'ring-[3px] ring-foreground'
                  )}
                >
                  {rating === option.key && <Check className="h-7 w-7 text-white" />}
                </div>
                <span className="text-center text-[13px] font-medium text-foreground">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Options - Only show after rating is selected */}
        {rating !== null && (
          <div className="rounded-2xl bg-white px-4">
            <button className="flex w-full items-center gap-3 border-b border-gray-200 py-3">
              <Users className="h-5 w-5 flex-shrink-0 text-foreground" />
              <span className="flex-1 text-left text-base text-foreground">
                Who did you go with?
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-secondary" />
            </button>

            <button className="flex w-full items-center gap-3 border-b border-gray-200 py-3">
              <Tag className="h-5 w-5 flex-shrink-0 text-foreground" />
              <div className="flex flex-1 items-center gap-2">
                <span className="text-base text-foreground">Add labels (good for, etc.)</span>
                <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                  SC
                </span>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-secondary" />
            </button>

            <button className="flex w-full items-center gap-3 border-b border-gray-200 py-3">
              <Edit className="h-5 w-5 flex-shrink-0 text-foreground" />
              <span className="flex-1 text-left text-base text-foreground">Add notes</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-secondary" />
            </button>

            <button className="flex w-full items-center gap-3 border-b border-gray-200 py-3">
              <Utensils className="h-5 w-5 flex-shrink-0 text-foreground" />
              <span className="flex-1 text-left text-base text-foreground">
                Add favorite dishes
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-secondary" />
            </button>

            <button className="flex w-full items-center gap-3 border-b border-gray-200 py-3">
              <Camera className="h-5 w-5 flex-shrink-0 text-foreground" />
              <span className="flex-1 text-left text-base text-foreground">Add photos</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-secondary" />
            </button>

            <button className="flex w-full items-center gap-3 border-b border-gray-200 py-3">
              <Calendar className="h-5 w-5 flex-shrink-0 text-foreground" />
              <span className="flex-1 text-left text-base text-foreground">Add visit date</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-secondary" />
            </button>

            <div className="flex w-full items-center gap-3 py-3">
              <Lock className="h-5 w-5 flex-shrink-0 text-foreground" />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-base text-foreground">Stealth mode</span>
                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                    SC
                  </span>
                </div>
                <p className="text-[13px] text-secondary">Hide this activity from newsfeed</p>
              </div>
              <Switch checked={stealthMode} onCheckedChange={onStealthModeChange} />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="px-4 pb-5 pt-3">
          <Button
            onClick={onSubmit}
            disabled={isLoading || rating === null}
            className="h-12 w-full text-base font-semibold"
          >
            {isLoading ? <LoadingSpinner className="h-5 w-5" /> : 'Rank it!'}
          </Button>
        </div>
      </div>

      {/* List Type Picker Modal */}
      <BottomSheet open={showListTypePicker} onOpenChange={setShowListTypePicker}>
        <BottomSheetContent>
          <div className="p-5 pb-8">
            <div className="mb-5 flex items-center justify-between">
              <BottomSheetTitle className="text-lg font-semibold text-foreground">
                Choose a category
              </BottomSheetTitle>
              <BottomSheetClose className="rounded-full p-1 hover:bg-gray-100">
                <span className="sr-only">Close</span>
              </BottomSheetClose>
            </div>
            <div className="space-y-3">
              {LIST_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = listType === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      onListTypeChange(option.key);
                      setShowListTypePicker(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border-[1.5px] px-4 py-3.5',
                      isSelected ? 'border-primary bg-primary' : 'border-gray-200 bg-white'
                    )}
                  >
                    <Icon
                      className={cn('h-5 w-5', isSelected ? 'text-white' : 'text-foreground')}
                    />
                    <span
                      className={cn(
                        'text-base font-semibold',
                        isSelected ? 'text-white' : 'text-foreground'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
}
