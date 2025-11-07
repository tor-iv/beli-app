'use client';

import { IoChevronDown } from 'react-icons/io5';

import { cn } from '@/lib/utils';

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

export const MobileTabs = ({ tabs, activeTab, onChange, className }: MobileTabsProps) => {
  return (
    <div className={cn('overflow-x-auto border-b border-gray-200 bg-white', className)}>
      <div className="flex min-w-full px-4">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isLast = index === tabs.length - 1;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative min-h-[48px] whitespace-nowrap px-0 py-3 text-[15px] transition-colors',
                'flex items-center gap-1',
                !isLast && 'mr-6',
                isActive
                  ? 'font-semibold text-gray-900'
                  : 'font-medium text-gray-700 hover:text-gray-700'
              )}
            >
              <span>{tab.label}</span>
              {tab.showChevron && (
                <IoChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isActive ? 'text-gray-900' : 'text-gray-700'
                  )}
                />
              )}

              {/* Active indicator - 3px underline */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-gray-900" />
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
