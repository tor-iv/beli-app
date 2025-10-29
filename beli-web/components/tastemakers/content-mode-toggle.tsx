'use client'

interface ContentModeToggleProps {
  mode: 'lists' | 'articles'
  onModeChange: (mode: 'lists' | 'articles') => void
}

export function ContentModeToggle({ mode, onModeChange }: ContentModeToggleProps) {
  return (
    <div className="mx-4 my-4 flex rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => onModeChange('lists')}
        className={`
          flex-1 py-3 px-4 text-base font-semibold text-center
          transition-colors rounded-l-lg
          ${
            mode === 'lists'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        Featured Lists
      </button>
      <button
        onClick={() => onModeChange('articles')}
        className={`
          flex-1 py-3 px-4 text-base font-semibold text-center
          transition-colors rounded-r-lg
          ${
            mode === 'articles'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        Tastemaker Articles
      </button>
    </div>
  )
}
