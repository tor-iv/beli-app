import { IoSearch } from 'react-icons/io5';

import { Input } from '@/components/ui/input';

/**
 * Search input with icon for filtering lists
 * Used in searchable filter sections (cities, cuisines, etc.)
 */
interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text (default: "Search...") */
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }: SearchInputProps) => {
  return (
    <div className="relative">
      <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
