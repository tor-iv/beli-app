'use client';

import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const CheckboxRow = ({ label, checked, onCheckedChange }: CheckboxRowProps) => {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-gray-50"
    >
      <span className="text-[17px] text-foreground">{label}</span>

      <div
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'border-2 border-gray-300'
        )}
      >
        {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
