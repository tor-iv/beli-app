'use client';

import { cn } from '@/lib/utils';
import { IoChevronDown } from 'react-icons/io5';

export type MobileTabId = 'been' | 'want_to_try' | 'recs' | 'playlists' | 'more';

interface MobileTab {
  id: MobileTabId;
  label: string;
  showChevron?: boolean;
}

interface MobileTabsProps {
  tabs: MobileTab[];
  activeTab: MobileTabId;
  onChange: (tabId: MobileTabId) => void;
  className?: string;
}

export function MobileTabs({ tabs, activeTab, onChange, className }: MobileTabsProps) {
  return (
    <div className={cn('border-b border-gray-200 bg-white overflow-x-auto', className)}>
      <div className="flex px-4 min-w-full">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isLast = index === tabs.length - 1;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-0 py-3 text-[15px] whitespace-nowrap transition-colors min-h-[48px]',
                'flex items-center gap-1',
                !isLast && 'mr-6',
                isActive
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 font-medium hover:text-gray-700'
              )}
            >
              <span>{tab.label}</span>
              {tab.showChevron && (
                <IoChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  )}
                />
              )}

              {/* Active indicator - 3px underline */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Default tabs configuration
export const DEFAULT_MOBILE_TABS: MobileTab[] = [
  { id: 'been', label: 'Been' },
  { id: 'want_to_try', label: 'Want to Try' },
  { id: 'recs', label: 'Recs' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'more', label: 'More', showChevron: true },
];
