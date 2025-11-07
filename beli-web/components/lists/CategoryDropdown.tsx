'use client';

import { useState } from 'react';
import { IoChevronDown, IoCheckmark } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useListFilters, CATEGORIES } from '@/lib/stores/list-filters';
import { cn } from '@/lib/utils';



export const CategoryDropdown = () => {
  const { category, setCategory } = useListFilters();
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Find selected category label
  const selectedLabel = CATEGORIES.find((cat) => cat.value === category)?.label || 'All';

  const handleSelect = (value: typeof category) => {
    setCategory(value);
    setIsOpen(false);
  };

  // Desktop: Dropdown Menu Pattern
  if (isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">{selectedLabel}</span>
              <IoChevronDown className="h-4 w-4 flex-shrink-0 text-gray-700" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <div className="grid grid-cols-2 gap-1 p-1">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;

              return (
                <DropdownMenuItem
                  key={cat.value}
                  onClick={() => handleSelect(cat.value)}
                  className={cn(
                    'cursor-pointer justify-center py-2 text-sm font-semibold',
                    isSelected && 'bg-primary text-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{cat.label}</span>
                    {isSelected && <IoCheckmark className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Mobile: Bottom Sheet Pattern
  return (
    <>
      {/* Trigger Button - Large Bold Text */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 py-2 transition-opacity active:opacity-70"
      >
        <span className="text-[32px] font-bold leading-none text-gray-900">{selectedLabel}</span>
        <IoChevronDown className="h-5 w-5 flex-shrink-0 text-gray-700" />
      </button>

      {/* Bottom Sheet Modal */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-auto px-4 pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-semibold">Choose a category</SheetTitle>
          </SheetHeader>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;

              return (
                <button
                  key={cat.value}
                  onClick={() => handleSelect(cat.value)}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-center transition-all active:scale-95',
                    'text-[15px] font-semibold',
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
