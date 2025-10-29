import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-95 active:opacity-70 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-gray-200 text-foreground",
        outlined: "bg-transparent border border-border text-foreground",
        filter: "bg-white border border-gray-200 text-foreground shadow-button",
      },
      size: {
        small: "h-7 px-2 text-xs",
        medium: "h-8 px-3 text-sm",
      },
      selected: {
        true: "bg-primary text-white border-primary",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "medium",
      selected: false,
    },
  }
)

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  label: string
  onPress?: () => void
  asDiv?: boolean
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, selected, label, onPress, asDiv, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onPress) {
        onPress()
      }
      if (onClick) {
        onClick(e)
      }
    }

    const isInteractive = Boolean(onPress || onClick)

    if (!isInteractive || asDiv) {
      return (
        <div className={cn(chipVariants({ variant, size, selected, className }))}>
          {label}
        </div>
      )
    }

    return (
      <button
        className={cn(chipVariants({ variant, size, selected, className }))}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {label}
      </button>
    )
  }
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
