import { useState, useMemo } from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { FilterSectionType } from '@/lib/config/filter-config';
import { SearchInput } from './SearchInput';
import { CheckboxList } from './CheckboxList';
import { ButtonGrid } from './ButtonGrid';
import { ButtonRow } from './ButtonRow';

/**
 * Reusable filter section component that handles all common filter UI patterns
 * Eliminates code duplication across filter types by providing a unified interface
 *
 * Supports four patterns:
 * 1. searchable-list: Searchable checkbox list (cities, cuisines)
 * 2. button-grid: Grid of toggle buttons (tags, good-for)
 * 3. button-row: Row of toggle buttons (price, thresholds)
 * 4. custom: Custom content passed as children
 */
interface FilterSectionProps {
  /** Unique ID for the accordion item */
  id: string;
  /** Display title */
  title: string;
  /** Type of filter UI to display */
  type: FilterSectionType;
  /** List of items for selection */
  items?: readonly string[] | readonly { value: number | null; label: string }[];
  /** Currently selected item(s) */
  selectedItems?: string[] | string | number | null;
  /** Callback for toggling multi-select items (checkboxes, multi-buttons) */
  onToggle?: (item: string) => void;
  /** Callback for selecting single-select items (thresholds) */
  onSelect?: (value: string | number | null) => void;
  /** Whether to show search input */
  searchable?: boolean;
  /** Number of selected items (for display in header) */
  selectedCount?: number;
  /** Label for selected items (for display in header) */
  selectedLabel?: string;
  /** Number of columns for button-grid */
  gridCols?: number;
  /** Whether this is a single-select filter */
  singleSelect?: boolean;
  /** Custom children for 'custom' type */
  children?: React.ReactNode;
}

export function FilterSection({
  id,
  title,
  type,
  items = [],
  selectedItems = [],
  onToggle,
  onSelect,
  searchable = false,
  selectedCount,
  selectedLabel,
  gridCols = 2,
  singleSelect = false,
  children,
}: FilterSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query (for searchable lists)
  const filteredItems = useMemo(() => {
    if (!searchable || !searchQuery || type !== 'searchable-list') {
      return items as readonly string[];
    }
    return (items as readonly string[]).filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery, searchable, type]);

  // Render selected count or label in header
  const renderSelectedBadge = () => {
    if (selectedCount !== undefined && selectedCount > 0) {
      return (
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({selectedCount} selected)
        </span>
      );
    }
    if (selectedLabel) {
      return (
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({selectedLabel})
        </span>
      );
    }
    return null;
  };

  // Render content based on type
  const renderContent = () => {
    switch (type) {
      case 'searchable-list':
        return (
          <div className="space-y-3">
            {searchable && (
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={`Search ${title.toLowerCase()}...`}
              />
            )}
            <CheckboxList
              items={filteredItems}
              selectedItems={Array.isArray(selectedItems) ? selectedItems : []}
              onToggle={(item, checked) => {
                if (onToggle) {
                  onToggle(item);
                }
              }}
            />
          </div>
        );

      case 'button-grid':
        return (
          <ButtonGrid
            items={items as readonly string[]}
            selectedItems={Array.isArray(selectedItems) ? selectedItems : []}
            onToggle={onToggle || (() => {})}
            gridCols={gridCols}
          />
        );

      case 'button-row':
        return (
          <ButtonRow
            items={items}
            selectedItem={selectedItems}
            onSelect={onSelect || (() => {})}
            singleSelect={singleSelect}
          />
        );

      case 'custom':
        return children;

      default:
        return null;
    }
  };

  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="text-lg font-semibold">
        {title}
        {renderSelectedBadge()}
      </AccordionTrigger>
      <AccordionContent>{renderContent()}</AccordionContent>
    </AccordionItem>
  );
}
