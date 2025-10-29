import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon = "🍽️",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center p-6", className)}>
      <div className="mb-4 opacity-50">
        {typeof icon === 'string' ? <span className="text-6xl">{icon}</span> : icon}
      </div>

      <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-secondary text-center leading-[22px] mb-6 max-w-md">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} className="min-w-[200px]">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
