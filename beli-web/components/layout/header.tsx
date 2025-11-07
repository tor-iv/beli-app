'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IoDocument,
  IoDocumentOutline,
  IoList,
  IoListOutline,
  IoStar,
  IoStarOutline,
  IoAdd,
  IoTrophy,
  IoTrophyOutline,
  IoPersonCircle,
  IoPersonCircleOutline,
  IoNotifications,
  IoNotificationsOutline,
} from 'react-icons/io5';

import { useUnreadNotificationCount } from '@/lib/hooks/use-notifications';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Feed', href: '/feed', icon: IoDocument, outlineIcon: IoDocumentOutline },
  { name: 'Lists', href: '/lists', icon: IoList, outlineIcon: IoListOutline },
  { name: 'Tastemakers', href: '/tastemakers', icon: IoStar, outlineIcon: IoStarOutline },
  { name: 'Search', href: '/search', icon: IoAdd, outlineIcon: IoAdd, isSpecial: true },
  { name: 'Leaderboard', href: '/leaderboard', icon: IoTrophy, outlineIcon: IoTrophyOutline },
  {
    name: 'Profile',
    href: '/profile/tor_iv',
    icon: IoPersonCircle,
    outlineIcon: IoPersonCircleOutline,
  },
];

export const Header = () => {
  const pathname = usePathname();
  const { data: unreadCount } = useUnreadNotificationCount();
  const isNotificationsActive = pathname?.startsWith('/notifications');

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/feed" className="flex items-center space-x-2">
              <div className="relative h-12">
                <img src="/beli-logo.webp" alt="Beli" className="h-full object-contain" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-6 md:flex">
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
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Notifications Bell */}
              <Link
                href="/notifications"
                className={cn(
                  'relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                  isNotificationsActive ? 'text-primary' : 'text-muted'
                )}
              >
                {isNotificationsActive ? (
                  <IoNotifications className="h-5 w-5" />
                ) : (
                  <IoNotificationsOutline className="h-5 w-5" />
                )}
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navigation
            .filter((item) => item.name !== 'Tastemakers')
            .map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = isActive ? item.icon : item.outlineIcon;

              // Special circular button for search
              if (item.isSpecial) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mt-2 flex flex-col items-center justify-center"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md',
                        'transition-transform active:scale-95',
                        isActive ? 'opacity-100' : 'opacity-75'
                      )}
                    >
                      <Icon className="h-[22px] w-[22px] text-white" />
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex min-w-[60px] flex-col items-center gap-1 p-2',
                    isActive ? 'text-primary' : 'text-muted'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[11px] font-medium">{item.name}</span>
                </Link>
              );
            })}
        </div>
      </nav>
    </>
  );
}
