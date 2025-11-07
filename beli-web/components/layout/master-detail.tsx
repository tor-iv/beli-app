'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import type { ReactNode} from 'react';

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
    <div className={cn('grid h-full grid-cols-1 gap-4 md:grid-cols-[2fr_3fr]', className)}>
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
      <div className={cn('sticky top-0 hidden overflow-auto md:block', detailClassName)}>
        {selectedItem ? (
          renderDetail(selectedItem)
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <p>{emptyDetailMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
