'use client';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';


interface SidebarProps {
  children: ReactNode;
  className?: string;
  position?: 'left' | 'right';
  /**
   * Sidebar width on desktop
   * @default 'md' (320px)
   */
  width?: 'sm' | 'md' | 'lg';
  /**
   * Whether sidebar should be sticky
   * @default false
   */
  sticky?: boolean;
}

const widthClasses = {
  sm: 'md:w-64',
  md: 'md:w-80',
  lg: 'md:w-96',
};

export const Sidebar = ({
  children,
  className,
  position = 'right',
  width = 'md',
  sticky = false,
}: SidebarProps) => {
  return (
    <aside
      className={cn(
        'w-full',
        widthClasses[width],
        sticky && 'md:sticky md:top-4 md:h-[calc(100vh-2rem)]',
        'overflow-auto',
        className
      )}
    >
      {children}
    </aside>
  );
}

interface SidebarLayoutProps {
  main: ReactNode;
  sidebar: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg';
  sidebarSticky?: boolean;
  className?: string;
  mainClassName?: string;
  sidebarClassName?: string;
  /**
   * On mobile, hide sidebar
   * @default true
   */
  hideSidebarOnMobile?: boolean;
}

export const SidebarLayout = ({
  main,
  sidebar,
  sidebarPosition = 'right',
  sidebarWidth = 'md',
  sidebarSticky = false,
  className,
  mainClassName,
  sidebarClassName,
  hideSidebarOnMobile = true,
}: SidebarLayoutProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row',
        sidebarPosition === 'left' && 'md:flex-row-reverse',
        className
      )}
    >
      <main className={cn('min-w-0 flex-1', mainClassName)}>{main}</main>
      <div className={cn(hideSidebarOnMobile && 'hidden md:block')}>
        <Sidebar
          position={sidebarPosition}
          width={sidebarWidth}
          sticky={sidebarSticky}
          className={sidebarClassName}
        >
          {sidebar}
        </Sidebar>
      </div>
    </div>
  );
}
