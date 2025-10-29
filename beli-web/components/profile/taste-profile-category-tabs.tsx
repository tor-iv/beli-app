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

export function TasteProfileCategoryTabs({
  activeCategory,
  onCategoryChange,
}: TasteProfileCategoryTabsProps) {
  return (
    <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex-1 py-2 px-4 rounded-md text-base font-medium transition-all relative
              ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-800 hover:text-gray-900'
              }
            `}
          >
            {category.label}
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-0.5 bg-gray-900 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
