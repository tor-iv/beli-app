import * as React from 'react';

import { cn } from '@/lib/utils';

export interface MatchPercentageBadgeProps {
  percentage: number;
  variant?: 'default' | 'compact';
  className?: string;
}

export const MatchPercentageBadge = ({
  percentage,
  variant = 'default',
  className,
}: MatchPercentageBadgeProps) => {
  const displayText = variant === 'compact' ? `${percentage}%` : `+${percentage}% Match`;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-sm bg-emerald-50 font-semibold text-emerald-600',
        variant === 'compact' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm',
        className
      )}
    >
      {displayText}
    </div>
  );
}
