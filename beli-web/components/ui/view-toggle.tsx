'use client';

import { FileText, Map } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'detail' | 'map';
  onViewChange: (view: 'detail' | 'map') => void;
  className?: string;
}

export const ViewToggle = ({ view, onViewChange, className }: ViewToggleProps) => {
  return (
    <div className={cn('inline-flex rounded-lg border border-gray-200 bg-white p-1', className)}>
      <button
        onClick={() => onViewChange('detail')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          view === 'detail'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="h-4 w-4" />
        Details
      </button>
      <button
        onClick={() => onViewChange('map')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          view === 'map'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Map className="h-4 w-4" />
        Map
      </button>
    </div>
  );
}
