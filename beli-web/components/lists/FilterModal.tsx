'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion } from '@/components/ui/accordion';
import { useListFilters } from '@/lib/stores/list-filters';
import { FILTER_SECTIONS } from '@/lib/config/filter-config';
import { FilterSection, SwitchRow } from './filters';

/**
 * Filter modal for advanced restaurant filtering
 * Refactored to use configuration-driven components for reduced complexity
 * and easier maintenance
 */
interface FilterModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

export function FilterModal({ open, onOpenChange }: FilterModalProps) {
  const filters = useListFilters();

  const handleApply = () => {
    onOpenChange(false);
  };

  const handleReset = () => {
    filters.resetFilters();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl p-0">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle className="text-2xl">Filters</DialogTitle>
          <DialogDescription>
            Refine your restaurant list with advanced filters
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <Accordion type="multiple" className="w-full" defaultValue={['cities', 'cuisines']}>
            {/* Render all standard filter sections from configuration */}
            {FILTER_SECTIONS.filter((section) => section.type !== 'custom').map((section) => {
              const storeKey = section.storeKey!;
              let selectedItems = filters[storeKey] as string[] | string | number | null;
              let onToggle: ((item: string) => void) | undefined;
              let onSelect: ((value: string | number | null) => void) | undefined;

              // Handle different filter types with appropriate callbacks
              if (section.type === 'searchable-list' || section.type === 'button-grid') {
                // Multi-select filters (arrays)
                onToggle = (item: string) => {
                  if (storeKey === 'cities') {
                    filters.cities.includes(item)
                      ? filters.removeCity(item)
                      : filters.addCity(item);
                  } else if (storeKey === 'cuisines') {
                    filters.cuisines.includes(item)
                      ? filters.removeCuisine(item)
                      : filters.addCuisine(item);
                  } else if (storeKey === 'tags') {
                    filters.toggleTag(item);
                  } else if (storeKey === 'goodFor') {
                    filters.toggleGoodFor(item);
                  }
                };
              } else if (section.type === 'button-row') {
                // Handle price (multi-select) differently from thresholds (single-select)
                if (storeKey === 'prices') {
                  onToggle = (item: string) => {
                    filters.togglePrice(item as '$' | '$$' | '$$$' | '$$$$');
                  };
                } else if (storeKey === 'minScore') {
                  onSelect = (value: string | number | null) => {
                    filters.setMinScore(value as number | null);
                  };
                } else if (storeKey === 'minFriends') {
                  onSelect = (value: string | number | null) => {
                    filters.setMinFriends(value as number | null);
                  };
                }
              }

              return (
                <FilterSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  type={section.type}
                  items={section.items}
                  selectedItems={selectedItems}
                  selectedCount={section.getSelectedCount?.(filters)}
                  selectedLabel={section.getSelectedLabel?.(filters)}
                  searchable={section.searchable}
                  gridCols={section.gridCols}
                  singleSelect={section.singleSelect}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              );
            })}

            {/* Special "Other" section with custom switch controls */}
            <FilterSection id="other" title="Other" type="custom">
              <div className="space-y-4">
                <SwitchRow
                  id="open-now"
                  label="Open Now"
                  description="Show only restaurants currently open"
                  checked={filters.openNow}
                  onChange={filters.setOpenNow}
                />
                <SwitchRow
                  id="reservations"
                  label="Accepts Reservations"
                  description="Show only restaurants that accept reservations"
                  checked={filters.acceptsReservations}
                  onChange={filters.setAcceptsReservations}
                />
              </div>
            </FilterSection>
          </Accordion>
        </ScrollArea>

        <DialogFooter className="border-t p-6 pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset All
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
