'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SplitViewProps {
  left: ReactNode;
  right: ReactNode;
  leftClassName?: string;
  rightClassName?: string;
  className?: string;
  /**
   * Split ratio for desktop (left:right)
   * @default '40:60'
   */
  ratio?: '30:70' | '40:60' | '50:50' | '60:40' | '70:30';
  /**
   * On mobile, show only left or right pane, or stack vertically
   * @default 'stack'
   */
  mobileLayout?: 'left-only' | 'right-only' | 'stack';
}

const ratioClasses = {
  '30:70': 'md:grid-cols-[3fr_7fr]',
  '40:60': 'md:grid-cols-[2fr_3fr]',
  '50:50': 'md:grid-cols-2',
  '60:40': 'md:grid-cols-[3fr_2fr]',
  '70:30': 'md:grid-cols-[7fr_3fr]',
};

export function SplitView({
  left,
  right,
  leftClassName,
  rightClassName,
  className,
  ratio = '40:60',
  mobileLayout = 'stack',
}: SplitViewProps) {
  const gridClass = ratioClasses[ratio];

  const mobileClass = {
    'left-only': 'grid-cols-1',
    'right-only': 'grid-cols-1',
    'stack': 'grid-cols-1',
  }[mobileLayout];

  return (
    <div className={cn('grid gap-4 h-full', mobileClass, gridClass, className)}>
      <div
        className={cn(
          'overflow-auto',
          mobileLayout === 'right-only' && 'hidden md:block',
          leftClassName
        )}
      >
        {left}
      </div>
      <div
        className={cn(
          'overflow-auto',
          mobileLayout === 'left-only' && 'hidden md:block',
          rightClassName
        )}
      >
        {right}
      </div>
    </div>
  );
}
