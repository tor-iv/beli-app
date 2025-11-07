import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Grid of toggle buttons for multi-select filters
 * Used for tags, good-for options, and other categorical filters
 */
interface ButtonGridProps {
  /** List of items to display as buttons */
  items: readonly string[];
  /** Currently selected items */
  selectedItems: string[];
  /** Callback when a button is toggled */
  onToggle: (item: string) => void;
  /** Number of columns in the grid (default: 2) */
  gridCols?: number;
}

export const ButtonGrid = ({ items, selectedItems, onToggle, gridCols = 2 }: ButtonGridProps) => {
  const gridClass = cn(
    'grid gap-2',
    gridCols === 2 && 'grid-cols-2',
    gridCols === 3 && 'grid-cols-3',
    gridCols === 4 && 'grid-cols-4'
  );

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <Button
          key={item}
          variant={selectedItems.includes(item) ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToggle(item)}
          className="justify-start text-left"
        >
          {item}
        </Button>
      ))}
    </div>
  );
}
