import { Search, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  showIcon?: boolean;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChangeText,
      placeholder = 'Search restaurants, cuisine, occasion',
      onFocus,
      onBlur,
      onClear,
      autoFocus = false,
      disabled = false,
      showIcon = true,
      className,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeText(e.target.value);
    };

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        onChangeText('');
      }
    };

    return (
      <div
        className={cn(
          'relative flex items-center rounded-lg bg-white px-3 py-2 shadow-button',
          className
        )}
      >
        {showIcon && <Search className="mr-2 h-[18px] w-[18px] flex-shrink-0 text-secondary" />}

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
          disabled={disabled}
          className="placeholder:text-tertiary flex-1 bg-transparent text-base outline-none disabled:cursor-not-allowed"
          {...props}
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 flex-shrink-0 rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Clear search"
          >
            <X className="h-[18px] w-[18px] text-secondary" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
