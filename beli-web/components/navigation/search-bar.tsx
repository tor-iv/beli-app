import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChangeText: (text: string) => void
  onClear?: () => void
  showIcon?: boolean
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChangeText,
      placeholder = "Search restaurants, cuisine, occasion",
      onFocus,
      onBlur,
      onClear,
      autoFocus = false,
      disabled = false,
      showIcon = true,
      className,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeText(e.target.value)
    }

    const handleClear = () => {
      if (onClear) {
        onClear()
      } else {
        onChangeText("")
      }
    }

    return (
      <div className={cn("relative flex items-center bg-white rounded-lg shadow-button px-3 py-2", className)}>
        {showIcon && (
          <Search className="h-[18px] w-[18px] text-secondary mr-2 flex-shrink-0" />
        )}

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
          disabled={disabled}
          className="flex-1 text-base bg-transparent outline-none placeholder:text-tertiary disabled:cursor-not-allowed"
          {...props}
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="h-[18px] w-[18px] text-secondary" />
          </button>
        )}
      </div>
    )
  }
)

SearchBar.displayName = "SearchBar"
