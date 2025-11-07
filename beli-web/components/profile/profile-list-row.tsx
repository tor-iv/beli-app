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

export function ProfileListRow({
  icon,
  label,
  count,
  onPress,
  isLast = false,
}: ProfileListRowProps) {
  const IconComponent = iconMap[icon];

  return (
    <button
      onClick={onPress}
      className={`w-full flex items-center justify-between bg-white px-6 py-4 hover:bg-gray-50 transition-colors ${
        !isLast ? 'border-b border-gray-200' : ''
      }`}
      type="button"
      aria-label={`View ${label}${count !== undefined ? ` (${count} items)` : ''}`}
    >
      <div className="flex items-center gap-3">
        <IconComponent className="w-6 h-6 text-gray-900" />
        <span className="text-lg text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== undefined && (
          <span className="text-xl font-bold text-gray-900">{count}</span>
        )}
        <ChevronRight className="w-5 h-5 text-gray-800" />
      </div>
    </button>
  );
}
