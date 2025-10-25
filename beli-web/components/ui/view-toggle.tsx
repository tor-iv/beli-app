'use client';

import { FileText, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'detail' | 'map';
  onViewChange: (view: 'detail' | 'map') => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-gray-200 p-1 bg-white', className)}>
      <button
        onClick={() => onViewChange('detail')}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
          view === 'detail'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="w-4 h-4" />
        Details
      </button>
      <button
        onClick={() => onViewChange('map')}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
          view === 'map'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
}
