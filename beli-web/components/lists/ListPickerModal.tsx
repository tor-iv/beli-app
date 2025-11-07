'use client';

import {
  IoCheckmarkCircle,
  IoBookmark,
  IoHeart,
  IoGrid,
  IoPeopleCircle,
  IoTrendingUp,
} from 'react-icons/io5';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

export type ListOptionId =
  | 'been'
  | 'want_to_try'
  | 'recs'
  | 'playlists'
  | 'recs_for_you'
  | 'recs_from_friends'
  | 'trending';

interface ListOption {
  id: ListOptionId;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

interface ListPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedList: ListOptionId;
  onSelectList: (listId: ListOptionId) => void;
  listCounts?: {
    been?: number;
    want_to_try?: number;
    recs?: number;
    playlists?: number;
  };
}

export const ListPickerModal = ({
  open,
  onOpenChange,
  selectedList,
  onSelectList,
  listCounts,
}: ListPickerModalProps) => {
  const listOptions: ListOption[] = [
    {
      id: 'been',
      label: 'Been',
      description: listCounts?.been
        ? `${listCounts.been} restaurant${listCounts.been !== 1 ? 's' : ''}`
        : "Places you've visited",
      Icon: IoCheckmarkCircle,
    },
    {
      id: 'want_to_try',
      label: 'Want to Try',
      description: listCounts?.want_to_try
        ? `${listCounts.want_to_try} restaurant${listCounts.want_to_try !== 1 ? 's' : ''}`
        : 'Saved for later',
      Icon: IoBookmark,
    },
    {
      id: 'recs_for_you',
      label: 'Recs for You',
      description: 'Made for you!',
      Icon: IoHeart,
    },
    {
      id: 'playlists',
      label: 'Playlists',
      description: listCounts?.playlists
        ? `${listCounts.playlists} playlist${listCounts.playlists !== 1 ? 's' : ''}`
        : 'Easily share recs!',
      Icon: IoGrid,
    },
    {
      id: 'recs_from_friends',
      label: 'Recs from Friends',
      description: 'Hand-picked!',
      Icon: IoPeopleCircle,
    },
    {
      id: 'trending',
      label: 'Trending',
      description: 'On Beli now!',
      Icon: IoTrendingUp,
    },
  ];

  const handleSelect = (listId: ListOptionId) => {
    onSelectList(listId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] px-4 pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg font-semibold">Lists</SheetTitle>
        </SheetHeader>

        <div className="grid max-h-[calc(70vh-80px)] grid-cols-2 gap-3 overflow-y-auto">
          {listOptions.map((option) => {
            const isSelected = selectedList === option.id;
            const Icon = option.Icon;

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  'flex flex-col items-start rounded-xl border p-4 transition-all active:scale-95',
                  'min-h-[90px] text-left',
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                )}
              >
                <Icon className={cn('mb-2 h-5 w-5', isSelected ? 'text-white' : 'text-gray-700')} />
                <span
                  className={cn(
                    'mb-0.5 text-base font-semibold',
                    isSelected ? 'text-white' : 'text-gray-900'
                  )}
                >
                  {option.label}
                </span>
                <span className={cn('text-sm', isSelected ? 'text-white/80' : 'text-gray-700')}>
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
