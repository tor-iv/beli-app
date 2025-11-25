'use client';

import { format, subDays, startOfWeek, isToday, isYesterday, isSameDay } from 'date-fns';
import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface VisitDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitDate: Date | null;
  onSave: (date: Date | null) => void;
}

// Quick date options
const getQuickOptions = () => {
  const today = new Date();
  return [
    { label: 'Today', date: today },
    { label: 'Yesterday', date: subDays(today, 1) },
    { label: 'This Week', date: startOfWeek(today, { weekStartsOn: 1 }) },
  ];
};

export function VisitDateDialog({
  open,
  onOpenChange,
  visitDate,
  onSave,
}: VisitDateDialogProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    visitDate || undefined
  );

  // Sync with external date when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedDate(visitDate || undefined);
    }
  }, [open, visitDate]);

  const handleSave = () => {
    onSave(selectedDate || null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedDate(visitDate || undefined);
    onOpenChange(false);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
  };

  const quickOptions = getQuickOptions();

  const getDateLabel = (date: Date | undefined) => {
    if (!date) return 'Select a date';
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>When did you visit?</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Quick Options */}
          <div className="mb-4 flex gap-2">
            {quickOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                size="sm"
                className={cn(
                  'flex-1',
                  selectedDate && isSameDay(selectedDate, option.date) && 'bg-primary text-white'
                )}
                onClick={() => setSelectedDate(option.date)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="flex justify-center rounded-lg border">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </div>

          {/* Selected Date Display */}
          <p className="mt-3 text-center text-sm text-secondary">
            {getDateLabel(selectedDate)}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-secondary"
            disabled={!selectedDate}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Date</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
