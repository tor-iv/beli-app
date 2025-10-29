'use client';

import { useListFilters, CATEGORIES } from '@/lib/stores/list-filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CategoryDropdown() {
  const { category, setCategory } = useListFilters();

  return (
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger className="h-9 w-[180px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((cat) => (
          <SelectItem key={cat.value} value={cat.value}>
            {cat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
