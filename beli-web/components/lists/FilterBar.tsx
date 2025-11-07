'use client';

import { useState } from 'react';
import { IoFunnelOutline, IoClose } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import { useListFilters } from '@/lib/stores/list-filters';

import { FilterModal } from './FilterModal';
import { FilterPill } from './FilterPill';


export const FilterBar = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const filters = useListFilters();
  const activeFilterCount = filters.getActiveFilterCount();

  const handleClearAll = () => {
    filters.clearAllFilters();
  };

  return (
    <>
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2">
        {/* Filter button - always visible */}
        <Button
          variant={activeFilterCount > 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilterModal(true)}
          className="h-8 shrink-0 gap-2 rounded-full px-3"
        >
          <IoFunnelOutline className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Active filter pills */}
        {filters.cities.length > 0 && (
          <FilterPill
            label={filters.cities.length === 1 ? filters.cities[0] : 'Cities'}
            count={filters.cities.length > 1 ? filters.cities.length : undefined}
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setCities([])}
          />
        )}

        {filters.cuisines.length > 0 && (
          <FilterPill
            label={filters.cuisines.length === 1 ? filters.cuisines[0] : 'Cuisines'}
            count={filters.cuisines.length > 1 ? filters.cuisines.length : undefined}
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setCuisines([])}
          />
        )}

        {filters.prices.length > 0 && (
          <FilterPill
            label={filters.prices.join(', ')}
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setPrices([])}
          />
        )}

        {filters.tags.length > 0 && (
          <FilterPill
            label={filters.tags.length === 1 ? filters.tags[0] : 'Tags'}
            count={filters.tags.length > 1 ? filters.tags.length : undefined}
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setTags([])}
          />
        )}

        {filters.goodFor.length > 0 && (
          <FilterPill
            label={filters.goodFor.length === 1 ? filters.goodFor[0] : 'Good For'}
            count={filters.goodFor.length > 1 ? filters.goodFor.length : undefined}
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setGoodFor([])}
          />
        )}

        {filters.minScore !== null && (
          <FilterPill
            label={`${filters.minScore}+ Rating`}
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setMinScore(null)}
          />
        )}

        {filters.minFriends !== null && (
          <FilterPill
            label={`${filters.minFriends}+ Friends`}
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setMinFriends(null)}
          />
        )}

        {filters.openNow && (
          <FilterPill
            label="Open Now"
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setOpenNow(false)}
          />
        )}

        {filters.acceptsReservations && (
          <FilterPill
            label="Accepts Reservations"
            active
            onClick={() => setShowFilterModal(true)}
            onRemove={() => filters.setAcceptsReservations(false)}
          />
        )}

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 shrink-0 gap-1 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <IoClose className="h-4 w-4" />
            <span>Clear all</span>
          </Button>
        )}
      </div>

      <FilterModal open={showFilterModal} onOpenChange={setShowFilterModal} />
    </>
  );
}
