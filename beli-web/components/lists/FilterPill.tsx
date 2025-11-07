'use client';

import { IoClose } from 'react-icons/io5';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FilterPillProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'outline';
}

export const FilterPill = ({
  label,
  count,
  active = false,
  onClick,
  onRemove,
  variant = 'outline',
}: FilterPillProps) => {
  return (
    <Button
      variant={active ? 'default' : variant}
      size="sm"
      onClick={onClick}
      className={`h-8 gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium ${active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''} `}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <Badge
          variant={active ? 'secondary' : 'default'}
          className="h-5 min-w-[20px] rounded-full px-1.5 text-xs"
        >
          {count}
        </Badge>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-white/20"
        >
          <IoClose className="h-3.5 w-3.5" />
        </button>
      )}
    </Button>
  );
}
