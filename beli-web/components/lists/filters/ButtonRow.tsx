import { Button } from '@/components/ui/button';

/**
 * Row of toggle buttons for single or multi-select filters
 * Used for price ranges, score thresholds, friend count thresholds
 */
interface ButtonRowProps {
  /** List of items to display - can be strings or objects with value/label */
  items: readonly string[] | readonly { value: number | null; label: string }[];
  /** Currently selected item(s) - string[], string, number, or null */
  selectedItem: string[] | string | number | null;
  /** Callback when a button is toggled/selected */
  onSelect: (value: string | number | null) => void;
  /** Whether this is a single-select filter (default: false for multi-select) */
  singleSelect?: boolean;
}

export function ButtonRow({
  items,
  selectedItem,
  onSelect,
  singleSelect = false,
}: ButtonRowProps) {
  // Type guard to check if items are threshold objects
  const isThresholdItems = (
    items: readonly string[] | readonly { value: number | null; label: string }[]
  ): items is readonly { value: number | null; label: string }[] => {
    return items.length > 0 && typeof items[0] === 'object' && 'value' in items[0];
  };

  // Check if an item is selected
  const isSelected = (itemValue: string | number | null): boolean => {
    if (Array.isArray(selectedItem)) {
      return selectedItem.includes(itemValue as string);
    }
    if (singleSelect) {
      return selectedItem === itemValue;
    }
    return false;
  };

  // Handle click - toggle for multi-select, set for single-select
  const handleClick = (itemValue: string | number | null) => {
    if (singleSelect) {
      // For single-select: toggle off if already selected, otherwise select
      onSelect(isSelected(itemValue) ? null : itemValue);
    } else {
      // For multi-select (like price): parent component handles toggle logic
      onSelect(itemValue);
    }
  };

  return (
    <div className="flex gap-2">
      {isThresholdItems(items)
        ? items.map((item) => (
            <Button
              key={item.label}
              variant={isSelected(item.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleClick(item.value)}
              className="flex-1"
            >
              {item.label}
            </Button>
          ))
        : items.map((item) => (
            <Button
              key={item}
              variant={isSelected(item) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleClick(item)}
              className="flex-1"
            >
              {item}
            </Button>
          ))}
    </div>
  );
}
