"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxRowProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function CheckboxRow({ label, checked, onCheckedChange }: CheckboxRowProps) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
    >
      <span className="text-[17px] text-foreground">{label}</span>

      <div className={cn(
        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
        checked ? "bg-primary" : "border-2 border-gray-300"
      )}>
        {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </div>
    </button>
  )
}
