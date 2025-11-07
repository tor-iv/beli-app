'use client';

import React from 'react';

export type ContentMode = 'featured-lists' | 'tastemaker-picks';

interface ContentModeSelectorProps {
  mode: ContentMode;
  onModeChange: (mode: ContentMode) => void;
}

export const ContentModeSelector = ({ mode, onModeChange }: ContentModeSelectorProps) => {
  return (
    <div className="flex w-full max-w-md gap-2 rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => onModeChange('featured-lists')}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
          mode === 'featured-lists'
            ? 'bg-[#0B7B7F] text-white shadow-sm'
            : 'bg-transparent text-gray-800 hover:text-gray-900'
        } `}
      >
        Featured Lists
      </button>
      <button
        onClick={() => onModeChange('tastemaker-picks')}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
          mode === 'tastemaker-picks'
            ? 'bg-[#0B7B7F] text-white shadow-sm'
            : 'bg-transparent text-gray-800 hover:text-gray-900'
        } `}
      >
        Tastemaker Picks
      </button>
    </div>
  );
}
