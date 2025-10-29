import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularBadgeProps {
  year: number
  size?: number
  className?: string
}

export function CircularBadge({ year, size = 160, className }: CircularBadgeProps) {
  const outerSize = size
  const innerSize = size * 0.85

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: outerSize, height: outerSize }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-4 border-primary/30"
        style={{ width: outerSize, height: outerSize }}
      />

      {/* Inner circle */}
      <div
        className="absolute rounded-full bg-white shadow-lg flex items-center justify-center"
        style={{
          width: innerSize,
          height: innerSize,
        }}
      >
        <span className="text-5xl font-bold text-primary">
          {year}
        </span>
      </div>
    </div>
  )
}
