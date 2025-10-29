'use client'

interface CategoryPillsProps {
  selectedCategory: string
  onCategorySelect: (category: string) => void
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
]

export function CategoryPills({
  selectedCategory,
  onCategorySelect,
}: CategoryPillsProps) {
  return (
    <div className="overflow-x-auto mb-4 min-h-[40px] scrollbar-hide">
      <div className="flex gap-2 px-4 py-1">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.key
          return (
            <button
              key={category.key}
              onClick={() => onCategorySelect(category.key)}
              className={`
                px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
                transition-colors border
                ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
