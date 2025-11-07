import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  iconColor?: string;
  iconBgColor?: string;
}

export const SettingsCard = ({
  icon: Icon,
  title,
  subtitle,
  href,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}: SettingsCardProps) => {
  return (
    <Link href={href}>
      <div className="cursor-pointer rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
              iconBgColor
            )}
          >
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="mb-0.5 text-[17px] font-semibold text-foreground">{title}</h3>
            <p className="text-sm leading-snug text-secondary">{subtitle}</p>
          </div>

          {/* Chevron */}
          <ChevronRight className="mt-3 h-5 w-5 flex-shrink-0 text-secondary" />
        </div>
      </div>
    </Link>
  );
}
