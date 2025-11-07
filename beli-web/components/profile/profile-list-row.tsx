'use client';

import { Check, Bookmark, Heart, ChevronRight } from 'lucide-react';

interface ProfileListRowProps {
  icon: 'check' | 'bookmark' | 'heart';
  label: string;
  count?: number;
  onPress?: () => void;
  isLast?: boolean;
}

const iconMap = {
  check: Check,
  bookmark: Bookmark,
  heart: Heart,
};

export const ProfileListRow = ({
  icon,
  label,
  count,
  onPress,
  isLast = false,
}: ProfileListRowProps) => {
  const IconComponent = iconMap[icon];

  return (
    <button
      onClick={onPress}
      className={`flex w-full items-center justify-between bg-white px-6 py-4 transition-colors hover:bg-gray-50 ${
        !isLast ? 'border-b border-gray-200' : ''
      }`}
      type="button"
      aria-label={`View ${label}${count !== undefined ? ` (${count} items)` : ''}`}
    >
      <div className="flex items-center gap-3">
        <IconComponent className="h-6 w-6 text-gray-900" />
        <span className="text-lg text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== undefined && <span className="text-xl font-bold text-gray-900">{count}</span>}
        <ChevronRight className="h-5 w-5 text-gray-800" />
      </div>
    </button>
  );
}
