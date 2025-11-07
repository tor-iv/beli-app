'use client';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';


interface ThreeColumnLayoutProps {
  left?: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  leftClassName?: string;
  centerClassName?: string;
  rightClassName?: string;
  className?: string;
  /**
   * Whether sidebars should be sticky
   * @default true
   */
  stickySidebars?: boolean;
  /**
   * Hide left column on mobile
   * @default true
   */
  hideLeftOnMobile?: boolean;
  /**
   * Hide right column on mobile
   * @default true
   */
  hideRightOnMobile?: boolean;
}

export const ThreeColumnLayout = ({
  left,
  center,
  right,
  leftClassName,
  centerClassName,
  rightClassName,
  className,
  stickySidebars = true,
  hideLeftOnMobile = true,
  hideRightOnMobile = true,
}: ThreeColumnLayoutProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6',
        left && right && 'lg:grid-cols-[280px_1fr_280px]',
        left && !right && 'lg:grid-cols-[280px_1fr]',
        !left && right && 'lg:grid-cols-[1fr_280px]',
        className
      )}
    >
      {left && (
        <aside
          className={cn(
            hideLeftOnMobile && 'hidden lg:block',
            stickySidebars && 'overflow-auto lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]',
            leftClassName
          )}
        >
          {left}
        </aside>
      )}

      <main className={cn('min-w-0', centerClassName)}>{center}</main>

      {right && (
        <aside
          className={cn(
            hideRightOnMobile && 'hidden lg:block',
            stickySidebars && 'overflow-auto lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]',
            rightClassName
          )}
        >
          {right}
        </aside>
      )}
    </div>
  );
}
