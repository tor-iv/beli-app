import { getRatingColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RatingBubbleProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RatingBubble = ({ rating, size = 'md', className }: RatingBubbleProps) => {
  const colorClass = getRatingColor(rating);

  // Match native sizes: small=32px/12px, medium=44px/14px, large=56px/18px
  const sizeClasses = {
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-11 h-11 text-[14px]',
    lg: 'w-14 h-14 text-[18px]',
  };

  return (
    <div className={cn('rating-bubble', `rating-${colorClass}`, sizeClasses[size], className)}>
      {rating.toFixed(1)}
    </div>
  );
}
