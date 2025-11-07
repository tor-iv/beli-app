'use client';

interface ContentModeToggleProps {
  mode: 'lists' | 'articles';
  onModeChange: (mode: 'lists' | 'articles') => void;
}

export const ContentModeToggle = ({ mode, onModeChange }: ContentModeToggleProps) => {
  return (
    <div className="mx-4 my-4 flex overflow-hidden rounded-lg bg-white">
      <button
        onClick={() => onModeChange('lists')}
        className={`flex-1 rounded-l-lg px-4 py-3 text-center text-base font-semibold transition-colors ${
          mode === 'lists' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        } `}
      >
        Featured Lists
      </button>
      <button
        onClick={() => onModeChange('articles')}
        className={`flex-1 rounded-r-lg px-4 py-3 text-center text-base font-semibold transition-colors ${
          mode === 'articles'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        } `}
      >
        Tastemaker Articles
      </button>
    </div>
  );
}
