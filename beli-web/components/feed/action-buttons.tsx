import { Calendar, Navigation, TrendingUp, Users } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  onReserveClick?: () => void;
  onRecsNearbyClick?: () => void;
  onTrendingClick?: () => void;
  onFriendRecsClick?: () => void;
  className?: string;
}

export const ActionButtons = ({
  onReserveClick,
  onRecsNearbyClick,
  onTrendingClick,
  onFriendRecsClick,
  className,
}: ActionButtonsProps) => {
  return (
    <div className={cn('grid grid-cols-4 gap-2 px-4 pb-3 md:hidden', className)}>
      <button
        onClick={onReserveClick}
        className="flex flex-col items-center justify-center rounded-lg bg-primary px-2 py-2.5 text-white transition-opacity active:opacity-70"
      >
        <Calendar className="mb-1 h-[18px] w-[18px]" />
        <span className="text-xs font-medium leading-tight">Reserve now</span>
      </button>

      <button
        onClick={onRecsNearbyClick}
        className="flex flex-col items-center justify-center rounded-lg bg-primary px-2 py-2.5 text-white transition-opacity active:opacity-70"
      >
        <Navigation className="mb-1 h-[18px] w-[18px]" />
        <span className="text-xs font-medium leading-tight">Recs Nearby</span>
      </button>

      <button
        onClick={onTrendingClick}
        className="flex flex-col items-center justify-center rounded-lg bg-primary px-2 py-2.5 text-white transition-opacity active:opacity-70"
      >
        <TrendingUp className="mb-1 h-[18px] w-[18px]" />
        <span className="text-xs font-medium leading-tight">Trending</span>
      </button>

      <button
        onClick={onFriendRecsClick}
        className="flex flex-col items-center justify-center rounded-lg bg-primary px-2 py-2.5 text-white transition-opacity active:opacity-70"
      >
        <Users className="mb-1 h-[18px] w-[18px]" />
        <span className="text-xs font-medium leading-tight">Friend recs</span>
      </button>
    </div>
  );
}
