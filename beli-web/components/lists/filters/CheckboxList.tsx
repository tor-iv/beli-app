import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Scrollable list of checkboxes for multi-select filters
 * Used for cities, cuisines, and other long lists
 */
interface CheckboxListProps {
  /** List of items to display */
  items: readonly string[];
  /** Currently selected items */
  selectedItems: string[];
  /** Callback when an item is toggled */
  onToggle: (item: string, checked: boolean) => void;
  /** Height of the scrollable area (default: "h-48") */
  height?: string;
}

export function CheckboxList({
  items,
  selectedItems,
  onToggle,
  height = 'h-48',
}: CheckboxListProps) {
  return (
    <ScrollArea className={height}>
      <div className="space-y-2 pr-4">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${item}`}
              checked={selectedItems.includes(item)}
              onCheckedChange={(checked) => onToggle(item, checked as boolean)}
            />
            <label
              htmlFor={`checkbox-${item}`}
              className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {item}
            </label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
