'use client';

import { useState, useEffect, useCallback } from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useListFilters } from '@/lib/stores/list-filters';

interface ListSearchProps {
  placeholder?: string;
}

export const ListSearch = ({ placeholder = 'Search restaurants...' }: ListSearchProps) => {
  const { searchQuery, setSearchQuery } = useListFilters();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search query updates (300ms like native)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  // Sync with store when external changes occur
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <div className="relative">
      <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        className="h-10 pl-9 pr-9"
      />
      {localQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full hover:bg-muted"
        >
          <IoClose className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
