'use client';

import React from 'react';

export type ContentMode = 'featured-lists' | 'tastemaker-picks';

interface ContentModeSelectorProps {
  mode: ContentMode;
  onModeChange: (mode: ContentMode) => void;
}

export function ContentModeSelector({ mode, onModeChange }: ContentModeSelectorProps) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full max-w-md">
      <button
        onClick={() => onModeChange('featured-lists')}
        className={`
          flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
          ${
            mode === 'featured-lists'
              ? 'bg-[#0B7B7F] text-white shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }
        `}
      >
        Featured Lists
      </button>
      <button
        onClick={() => onModeChange('tastemaker-picks')}
        className={`
          flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
          ${
            mode === 'tastemaker-picks'
              ? 'bg-[#0B7B7F] text-white shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }
        `}
      >
        Tastemaker Picks
      </button>
    </div>
  );
}
