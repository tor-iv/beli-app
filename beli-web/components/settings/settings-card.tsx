import * as React from "react"
import { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SettingsCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  href: string
  iconColor?: string
  iconBgColor?: string
}

export function SettingsCard({
  icon: Icon,
  title,
  subtitle,
  href,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
}: SettingsCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-[17px] font-semibold text-foreground mb-0.5">
              {title}
            </h3>
            <p className="text-sm text-secondary leading-snug">
              {subtitle}
            </p>
          </div>

          {/* Chevron */}
          <ChevronRight className="h-5 w-5 text-secondary flex-shrink-0 mt-3" />
        </div>
      </div>
    </Link>
  )
}
