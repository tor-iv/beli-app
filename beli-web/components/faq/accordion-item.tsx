"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
  question: string
  answer: string
  defaultOpen?: boolean
}

export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-[17px] font-semibold text-foreground pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-secondary flex-shrink-0 transition-transform duration-200 mt-0.5",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-[15px] text-secondary leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}
