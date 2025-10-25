'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  IoDocument,
  IoDocumentOutline,
  IoList,
  IoListOutline,
  IoAdd,
  IoTrophy,
  IoTrophyOutline,
  IoPersonCircle,
  IoPersonCircleOutline
} from 'react-icons/io5';

const navigation = [
  { name: 'Feed', href: '/feed', icon: IoDocument, outlineIcon: IoDocumentOutline },
  { name: 'Lists', href: '/lists', icon: IoList, outlineIcon: IoListOutline },
  { name: 'Search', href: '/search', icon: IoAdd, outlineIcon: IoAdd, isSpecial: true },
  { name: 'Leaderboard', href: '/leaderboard', icon: IoTrophy, outlineIcon: IoTrophyOutline },
  { name: 'Profile', href: '/profile/current', icon: IoPersonCircle, outlineIcon: IoPersonCircleOutline },
];

export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/feed" className="flex items-center space-x-2">
              <div className="h-12 relative">
                <img src="/beli-logo.webp" alt="Beli" className="h-full object-contain" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = isActive ? item.icon : item.outlineIcon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center py-2 px-2">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = isActive ? item.icon : item.outlineIcon;

            // Special circular button for search
            if (item.isSpecial) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-2"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md',
                    'active:scale-95 transition-transform',
                    isActive ? 'opacity-100' : 'opacity-75'
                  )}>
                    <Icon className="w-[22px] h-[22px] text-white" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 min-w-[60px]',
                  isActive ? 'text-primary' : 'text-muted'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[11px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
