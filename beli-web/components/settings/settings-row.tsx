"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type SettingsRowType = "navigation" | "toggle" | "info"

interface BaseSettingsRowProps {
  icon?: LucideIcon
  label: string
  sublabel?: string
  destructive?: boolean
  disabled?: boolean
}

interface NavigationRowProps extends BaseSettingsRowProps {
  type: "navigation"
  href: string
  badge?: number
  value?: string
}

interface ToggleRowProps extends BaseSettingsRowProps {
  type: "toggle"
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  required?: boolean
}

interface InfoRowProps extends BaseSettingsRowProps {
  type: "info"
  value: string
}

type SettingsRowProps = NavigationRowProps | ToggleRowProps | InfoRowProps

export function SettingsRow(props: SettingsRowProps) {
  const { icon: Icon, label, sublabel, destructive, disabled } = props

  const iconElement = Icon && (
    <div className={cn(
      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
      destructive ? "bg-red-50" : "bg-gray-100"
    )}>
      <Icon className={cn("h-4 w-4", destructive ? "text-red-500" : "text-secondary")} />
    </div>
  )

  const labelElement = (
    <div className="flex-1 min-w-0">
      <p className={cn(
        "text-[17px] leading-snug",
        destructive ? "text-red-500" : "text-foreground",
        disabled && "opacity-50"
      )}>
        {label}
      </p>
      {sublabel && (
        <p className={cn(
          "text-sm text-secondary mt-0.5 leading-snug",
          disabled && "opacity-50"
        )}>
          {sublabel}
        </p>
      )}
    </div>
  )

  // Navigation row
  if (props.type === "navigation") {
    return (
      <Link href={props.href}>
        <div className={cn(
          "flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
          disabled && "pointer-events-none"
        )}>
          {iconElement}
          {labelElement}
          {props.value && (
            <span className="text-sm text-secondary">{props.value}</span>
          )}
          {props.badge !== undefined && props.badge > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full">
              {props.badge}
            </span>
          )}
          <ChevronRight className="h-5 w-5 text-secondary flex-shrink-0" />
        </div>
      </Link>
    )
  }

  // Toggle row
  if (props.type === "toggle") {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-b-0",
        disabled && "opacity-50"
      )}>
        {iconElement}
        {labelElement}
        <Switch
          checked={props.checked}
          onCheckedChange={props.onCheckedChange}
          disabled={disabled || props.required}
          className="ml-auto"
        />
      </div>
    )
  }

  // Info row (read-only)
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-b-0">
      {iconElement}
      {labelElement}
      <span className="text-sm text-secondary">{props.value}</span>
    </div>
  )
}
