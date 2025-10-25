'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface MasterDetailProps<T> {
  items: T[];
  renderMaster: (item: T, isSelected: boolean, onSelect: () => void) => ReactNode;
  renderDetail: (item: T | null) => ReactNode;
  masterClassName?: string;
  detailClassName?: string;
  className?: string;
  defaultSelectedIndex?: number;
  emptyDetailMessage?: string;
}

export function MasterDetail<T>({
  items,
  renderMaster,
  renderDetail,
  masterClassName,
  detailClassName,
  className,
  defaultSelectedIndex = 0,
  emptyDetailMessage = 'Select an item to view details',
}: MasterDetailProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    items.length > 0 ? defaultSelectedIndex : null
  );

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4 h-full', className)}>
      {/* Master list */}
      <div className={cn('overflow-auto', masterClassName)}>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index}>
              {renderMaster(item, selectedIndex === index, () => setSelectedIndex(index))}
            </div>
          ))}
        </div>
      </div>

      {/* Detail pane */}
      <div className={cn('hidden md:block overflow-auto sticky top-0', detailClassName)}>
        {selectedItem ? (
          renderDetail(selectedItem)
        ) : (
          <div className="flex items-center justify-center h-full text-muted">
            <p>{emptyDetailMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
