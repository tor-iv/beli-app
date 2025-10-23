import { getRatingColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RatingBubbleProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingBubble({ rating, size = 'md', className }: RatingBubbleProps) {
  const colorClass = getRatingColor(rating);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div
      className={cn(
        'rating-bubble',
        `rating-${colorClass}`,
        sizeClasses[size],
        className
      )}
    >
      {rating.toFixed(1)}
    </div>
  );
}
