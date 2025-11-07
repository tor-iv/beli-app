'use client';

interface CategoryPillsProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'pizza', label: 'Pizza' },
  { key: 'fine-dining', label: 'Fine Dining' },
  { key: 'budget-friendly', label: 'Budget Friendly' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'ramen', label: 'Ramen' },
  { key: 'street-food', label: 'Street Food' },
  { key: 'brunch', label: 'Brunch' },
];

export const CategoryPills = ({ selectedCategory, onCategorySelect }: CategoryPillsProps) => {
  return (
    <div className="scrollbar-hide mb-4 min-h-[40px] overflow-x-auto">
      <div className="flex gap-2 px-4 py-1">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.key;
          return (
            <button
              key={category.key}
              onClick={() => onCategorySelect(category.key)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200'
              } `}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
