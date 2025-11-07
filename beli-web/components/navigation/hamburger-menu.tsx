'use client';

import {
  Mail,
  GraduationCap,
  Settings,
  Calendar,
  Trophy,
  MessageCircle,
  Building,
  AlertTriangle,
  Utensils,
  Upload,
  Lock,
  FileText,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  type: 'navigation' | 'action' | 'info';
  href?: string;
  action?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  backgroundColor?: string;
}

interface HamburgerMenuProps {
  trigger?: React.ReactNode;
  invitesRemaining?: number;
  homeCity?: string;
}

export const HamburgerMenu = ({
  trigger,
  invitesRemaining = 3,
  homeCity = 'New York, NY',
}: HamburgerMenuProps) => {
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      // TODO: Implement logout logic
      console.log('Logging out...');
      setOpen(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'invites',
      icon: Mail,
      label: `You have ${invitesRemaining} invites left!`,
      type: 'info',
      showChevron: false,
      backgroundColor: 'bg-teal-50',
    },
    {
      id: 'school',
      icon: GraduationCap,
      label: 'Add Your School',
      type: 'action',
      action: () => {
        // TODO: Open school modal
        console.log('Add school');
      },
      showChevron: true,
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      type: 'navigation',
      href: '/settings',
      showChevron: true,
    },
    {
      id: 'reservations',
      icon: Calendar,
      label: 'Your Reservations',
      type: 'navigation',
      href: '/reservations',
      showChevron: true,
    },
    {
      id: 'goal',
      icon: Trophy,
      label: 'Your 2025 Goal',
      type: 'navigation',
      href: '/challenge',
      showChevron: true,
    },
    {
      id: 'faq',
      icon: MessageCircle,
      label: 'FAQ',
      type: 'navigation',
      href: '/faq',
      showChevron: true,
    },
    {
      id: 'homeCity',
      icon: Building,
      label: 'Home City',
      sublabel: homeCity,
      type: 'action',
      action: () => {
        // TODO: Open change home city modal
        console.log('Change home city');
      },
      showChevron: true,
    },
    {
      id: 'dietary',
      icon: AlertTriangle,
      label: 'Dietary Restrictions',
      type: 'navigation',
      href: '/settings/dietary',
      showChevron: true,
    },
    {
      id: 'disliked',
      icon: Utensils,
      label: 'Disliked Cuisines',
      type: 'navigation',
      href: '/settings/cuisines',
      showChevron: true,
    },
    {
      id: 'import',
      icon: Upload,
      label: 'Import Existing List',
      type: 'navigation',
      href: '/import',
      showChevron: true,
    },
    {
      id: 'password',
      icon: Lock,
      label: 'Change Password',
      type: 'navigation',
      href: '/settings/password',
      showChevron: true,
    },
    {
      id: 'privacy',
      icon: FileText,
      label: 'Privacy Policy',
      type: 'navigation',
      href: '/privacy',
      showChevron: true,
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      setOpen(false);
      // Navigation handled by Next.js Link
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-[85%] p-0 sm:w-[400px]">
        {/* Header */}
        <SheetHeader className="border-b border-gray-200 px-4 pb-3 pt-16">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-semibold">Menu</SheetTitle>
            <SheetClose className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300">
              <X className="h-6 w-6 text-secondary" />
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.type === 'info') {
              return (
                <div
                  key={item.id}
                  className={cn('flex items-center px-4 py-4', item.backgroundColor)}
                >
                  <Icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
                  <div className="ml-3 flex-1">
                    <p className="text-[17px] font-semibold leading-snug text-primary">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            }

            const content = (
              <>
                <Icon
                  className={cn(
                    'mt-0.5 h-6 w-6 flex-shrink-0',
                    item.destructive ? 'text-red-500' : 'text-secondary'
                  )}
                />
                <div className="ml-3 min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-[17px] leading-snug',
                      item.destructive ? 'text-red-500' : 'text-foreground'
                    )}
                  >
                    {item.label}
                  </p>
                  {item.sublabel && (
                    <p className="mt-1 text-sm leading-snug text-secondary">{item.sublabel}</p>
                  )}
                </div>
                {item.showChevron && (
                  <ChevronRight className="ml-2 h-5 w-5 flex-shrink-0 text-secondary" />
                )}
              </>
            );

            if (item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => handleItemClick(item)}
                  className="flex items-start px-4 py-4 transition-colors hover:bg-gray-50"
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="flex w-full items-start px-4 py-4 text-left transition-colors hover:bg-gray-50"
              >
                {content}
              </button>
            );
          })}

          {/* Divider */}
          <div className="mx-4 my-4 h-px bg-gray-200" />

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="flex w-full items-start px-4 py-4 text-left transition-colors hover:bg-gray-50"
          >
            <LogOut className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-500" />
            <span className="ml-3 text-[17px] leading-snug text-red-500">Log Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
