'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export const AccordionItem = ({ question, answer, defaultOpen = false }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <span className="pr-4 text-[17px] font-semibold text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            'mt-0.5 h-5 w-5 flex-shrink-0 text-secondary transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-[15px] leading-relaxed text-secondary">{answer}</p>
        </div>
      )}
    </div>
  );
}
