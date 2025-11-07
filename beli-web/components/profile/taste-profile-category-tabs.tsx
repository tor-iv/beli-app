'use client';

export type TasteProfileCategory = 'cuisines' | 'cities' | 'countries';

interface TasteProfileCategoryTabsProps {
  activeCategory: TasteProfileCategory;
  onCategoryChange: (category: TasteProfileCategory) => void;
}

const CATEGORIES: Array<{ id: TasteProfileCategory; label: string }> = [
  { id: 'cuisines', label: 'Cuisines' },
  { id: 'cities', label: 'Cities' },
  { id: 'countries', label: 'Countries' },
];

export const TasteProfileCategoryTabs = ({
  activeCategory,
  onCategoryChange,
}: TasteProfileCategoryTabsProps) => {
  return (
    <div className="flex gap-2 rounded-lg bg-white p-1 shadow-sm">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`relative flex-1 rounded-md px-4 py-2 text-base font-medium transition-all ${
              isActive
                ? 'bg-gray-100 font-semibold text-gray-900'
                : 'text-gray-800 hover:text-gray-900'
            } `}
          >
            {category.label}
            {isActive && (
              <div className="absolute bottom-0 left-1/2 h-0.5 w-3/5 -translate-x-1/2 rounded-full bg-gray-900" />
            )}
          </button>
        );
      })}
    </div>
  );
}
