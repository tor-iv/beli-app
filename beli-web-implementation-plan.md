# Beli Web Implementation Plan

**Version:** 1.0
**Created:** 2025-10-21
**Objective:** Build a web version of the Beli restaurant app using Next.js 15, shadcn/ui, and Tailwind CSS, deployable to Vercel

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Phase 1: Initial Setup](#phase-1-initial-setup)
5. [Phase 2: Design System Migration](#phase-2-design-system-migration)
6. [Phase 3: Core Components](#phase-3-core-components)
7. [Phase 4: Screen Implementation](#phase-4-screen-implementation)
8. [Phase 5: Data Layer Integration](#phase-5-data-layer-integration)
9. [Phase 6: Polish & Optimization](#phase-6-polish--optimization)
10. [Phase 7: Deployment](#phase-7-deployment)
11. [Implementation Timeline](#implementation-timeline)
12. [Success Metrics](#success-metrics)

---

## Executive Summary

### Goals
- Create a web version of Beli that mirrors the mobile app's functionality
- Maintain visual consistency with mobile design system
- Deploy to Vercel for public access
- Enable future backend integration
- Achieve excellent SEO for restaurant discovery

### Scope (MVP)
**In Scope:**
- All 5 main screens: Feed, Lists, Search, Leaderboard, Profile
- Restaurant detail screen
- Design system parity with mobile
- Mock data service (no real backend)
- Responsive design (desktop + tablet + mobile web)
- Vercel deployment

**Out of Scope (Future):**
- Authentication
- Real backend/database
- Image uploads
- Push notifications
- Mobile app features (native maps, camera)

### Key Advantages
1. **60-70% code reuse** - Types, data service, business logic
2. **Proven design system** - Already validated in mobile app
3. **Fast development** - 2-3 days for MVP
4. **SEO ready** - Next.js SSR for restaurant discovery
5. **Future-proof** - Easy to add backend later

---

## Tech Stack

### Core Framework
- **Next.js 15.1** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.7** - Type safety

### Styling & UI
- **Tailwind CSS 4.0** - Utility-first CSS
- **shadcn/ui** - Component library (copy-paste approach)
- **Radix UI** - Accessible primitives (via shadcn)
- **Lucide React** - Icon library

### State Management & Data
- **Zustand 5.0** - State management (same as mobile)
- **React Query (TanStack Query)** - Server state management
- **Mock Data Service** - Copied from mobile app

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Type checking

### Deployment
- **Vercel** - Hosting platform
- **Git** - Version control (same repo as mobile)

---

## Project Structure

```
beli-app/
├── beli-native/                # Existing mobile app
├── beli-web/                   # NEW - Web application
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (nav, providers)
│   │   ├── page.tsx            # Homepage (/)
│   │   ├── feed/
│   │   │   └── page.tsx        # Feed screen (/feed)
│   │   ├── lists/
│   │   │   └── page.tsx        # Lists screen (/lists)
│   │   ├── search/
│   │   │   └── page.tsx        # Search screen (/search)
│   │   ├── leaderboard/
│   │   │   └── page.tsx        # Leaderboard (/leaderboard)
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       └── page.tsx    # Profile (/profile/username)
│   │   └── restaurant/
│   │       └── [id]/
│   │           └── page.tsx    # Restaurant detail (/restaurant/123)
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   ├── restaurant/         # Restaurant components
│   │   │   ├── restaurant-card.tsx
│   │   │   ├── restaurant-header.tsx
│   │   │   ├── restaurant-metadata.tsx
│   │   │   ├── popular-dishes.tsx
│   │   │   └── score-card.tsx
│   │   │
│   │   ├── social/             # Social components
│   │   │   ├── activity-card.tsx
│   │   │   ├── user-preview.tsx
│   │   │   └── social-actions.tsx
│   │   │
│   │   ├── rating/             # Rating components
│   │   │   ├── rating-bubble.tsx
│   │   │   ├── match-percentage.tsx
│   │   │   └── score-badge.tsx
│   │   │
│   │   └── lists/              # List components
│   │       ├── list-section.tsx
│   │       ├── list-type-selector.tsx
│   │       └── list-card.tsx
│   │
│   ├── lib/                    # Utilities and services
│   │   ├── utils.ts            # shadcn utils (cn function)
│   │   ├── mockDataService.ts  # Copied from mobile
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── use-restaurants.ts
│   │   │   ├── use-feed.ts
│   │   │   └── use-user.ts
│   │   └── constants.ts        # App constants
│   │
│   ├── data/                   # Mock data
│   │   └── mock/               # Copied from mobile
│   │       ├── users.ts
│   │       ├── restaurants.ts
│   │       ├── reviews.ts
│   │       ├── activities.ts
│   │       ├── lists.ts
│   │       └── userRestaurantRelations.ts
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts            # Copied from mobile
│   │
│   ├── styles/                 # Global styles
│   │   └── globals.css         # Tailwind imports + custom CSS
│   │
│   ├── public/                 # Static assets
│   │   ├── images/
│   │   └── favicon.ico
│   │
│   ├── .env.local              # Environment variables
│   ├── .gitignore
│   ├── components.json         # shadcn/ui config
│   ├── next.config.ts          # Next.js config
│   ├── package.json
│   ├── postcss.config.mjs      # PostCSS config
│   ├── tailwind.config.ts      # Tailwind config
│   └── tsconfig.json           # TypeScript config
│
├── beli-images/                # Existing design assets
└── README.md
```

---

## Phase 1: Initial Setup

### 1.1 Create Next.js Project

**Command:**
```bash
cd /Users/torcox/beli-app
npx create-next-app@latest beli-web --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

**Selections during setup:**
- Would you like to use TypeScript? → **Yes**
- Would you like to use ESLint? → **Yes**
- Would you like to use Tailwind CSS? → **Yes**
- Would you like to use `src/` directory? → **No**
- Would you like to use App Router? → **Yes**
- Would you like to customize the default import alias? → **No** (use @/*)

**Time estimate:** 5 minutes

### 1.2 Initialize shadcn/ui

**Commands:**
```bash
cd beli-web
npx shadcn@latest init
```

**Selections:**
- Which style would you like to use? → **New York**
- Which color would you like to use as base color? → **Slate**
- Would you like to use CSS variables for colors? → **Yes**

**Result:** Creates `components.json` config file

**Time estimate:** 2 minutes

### 1.3 Install Additional Dependencies

```bash
npm install zustand @tanstack/react-query lucide-react
npm install -D prettier prettier-plugin-tailwindcss
```

**Packages:**
- `zustand` - State management (same as mobile)
- `@tanstack/react-query` - Data fetching/caching
- `lucide-react` - Icons
- `prettier` - Code formatting
- `prettier-plugin-tailwindcss` - Auto-sort Tailwind classes

**Time estimate:** 2 minutes

### 1.4 Create Essential shadcn/ui Components

**Commands:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add skeleton
npx shadcn@latest add separator
```

**Result:** Creates base UI components in `components/ui/`

**Time estimate:** 3 minutes

### 1.5 Configure Git

**Update `.gitignore`:**
```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

**Time estimate:** 1 minute

**Phase 1 Total Time: ~15 minutes**

---

## Phase 2: Design System Migration

### 2.1 Configure Tailwind with Beli Design Tokens

**Edit `tailwind.config.ts`:**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Beli Brand Colors
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#0A6C70',
          dark: '#075159',
          light: '#E6F7FF',
        },

        // Rating system colors
        rating: {
          excellent: '#22C55E',  // 8.5+ ratings
          good: '#84CC16',       // 7.0-8.4 ratings
          average: '#F59E0B',    // 5.0-6.9 ratings
          poor: '#EF4444',       // Below 5.0
        },

        // Semantic colors
        success: '#00A676',
        error: '#FF4D4F',
        warning: '#FAAD14',
        info: '#1890FF',

        // Text colors
        foreground: '#000000',
        muted: {
          DEFAULT: '#8E8E93',
          foreground: '#C7C7CC',
        },

        // Background colors
        background: '#FAFAFA',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },

        // Border colors
        border: '#E5E5EA',

        // Special colors
        streak: '#FF6B35',
        online: '#4CAF50',
        verified: '#1890FF',
      },

      // Typography
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'system-ui',
          'sans-serif',
        ],
      },

      fontSize: {
        xs: ['11px', { lineHeight: '1.3' }],
        sm: ['13px', { lineHeight: '1.4' }],
        base: ['15px', { lineHeight: '1.4' }],
        lg: ['17px', { lineHeight: '1.4' }],
        xl: ['20px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '1.2' }],
        '3xl': ['34px', { lineHeight: '1.2' }],
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // Spacing (matching mobile)
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
      },

      // Border radius
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
        full: '9999px',
        xl: '16px',
        '2xl': '24px',
      },

      // Shadows
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },

      // Animation
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Time estimate:** 15 minutes

### 2.2 Create Global Styles

**Edit `styles/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 250 250 250;
    --foreground: 0 0 0;
    --card: 255 255 255;
    --card-foreground: 0 0 0;
    --primary: 10 108 112;
    --primary-foreground: 255 255 255;
    --muted: 142 142 147;
    --muted-foreground: 199 199 204;
    --border: 229 229 234;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  /* Custom rating bubble */
  .rating-bubble {
    @apply flex items-center justify-center rounded-full font-bold;
    width: 44px;
    height: 44px;
    font-size: 15px;
  }

  /* Rating color variants */
  .rating-excellent {
    @apply bg-rating-excellent text-white;
  }

  .rating-good {
    @apply bg-rating-good text-white;
  }

  .rating-average {
    @apply bg-rating-average text-white;
  }

  .rating-poor {
    @apply bg-rating-poor text-white;
  }

  /* Content-first card style */
  .beli-card {
    @apply bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow;
  }
}
```

**Time estimate:** 10 minutes

### 2.3 Create Theme Constants

**Create `lib/constants.ts`:**

```typescript
// Color utilities
export const RATING_COLORS = {
  excellent: 'rating-excellent',
  good: 'rating-good',
  average: 'rating-average',
  poor: 'rating-poor',
} as const;

export function getRatingColor(rating: number): keyof typeof RATING_COLORS {
  if (rating >= 8.5) return 'excellent';
  if (rating >= 7.0) return 'good';
  if (rating >= 5.0) return 'average';
  return 'poor';
}

// Spacing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 640,   // sm
  tablet: 768,   // md
  desktop: 1024, // lg
  wide: 1280,    // xl
} as const;
```

**Time estimate:** 5 minutes

**Phase 2 Total Time: ~30 minutes**

---

## Phase 3: Core Components

### 3.1 Copy TypeScript Types

**Create `types/index.ts`:**

Copy entire contents from `beli-native/src/types.ts` (176 lines)

**Changes needed:** None - types are 100% compatible

**Time estimate:** 2 minutes (copy-paste)

### 3.2 Copy Mock Data

**Create `data/mock/` directory and copy files:**

1. `data/mock/users.ts` - User data
2. `data/mock/restaurants.ts` - Restaurant data
3. `data/mock/reviews.ts` - Review data
4. `data/mock/activities.ts` - Activity feed data
5. `data/mock/lists.ts` - User lists data
6. `data/mock/userRestaurantRelations.ts` - Relations
7. `data/mock/types.ts` - Mock types

**Changes needed:**
- Update import paths to use `@/types` instead of `../types`

**Time estimate:** 5 minutes

### 3.3 Copy MockDataService

**Create `lib/mockDataService.ts`:**

Copy from `beli-native/src/data/mockDataService.ts`

**Changes needed:**
- Update import paths:
  ```typescript
  // Before
  import { User, Restaurant, ... } from '../types';
  import { mockUsers, currentUser } from './mock/users';

  // After
  import { User, Restaurant, ... } from '@/types';
  import { mockUsers, currentUser } from '@/data/mock/users';
  ```

**Time estimate:** 5 minutes

### 3.4 Create Custom React Hooks

**Create `lib/hooks/use-restaurants.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => MockDataService.getAllRestaurants(),
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => MockDataService.getRestaurantById(id),
    enabled: !!id,
  });
}

export function useSearchRestaurants(query: string, filters?: any) {
  return useQuery({
    queryKey: ['restaurants', 'search', query, filters],
    queryFn: () => MockDataService.searchRestaurants(query, filters),
    enabled: query.length > 0,
  });
}
```

**Create `lib/hooks/use-feed.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useFeed(userId?: string) {
  return useQuery({
    queryKey: ['feed', userId],
    queryFn: () => MockDataService.getFeed(userId),
  });
}
```

**Create `lib/hooks/use-user.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => MockDataService.getCurrentUser(),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => MockDataService.getUserById(userId),
    enabled: !!userId,
  });
}
```

**Time estimate:** 15 minutes

### 3.5 Customize shadcn/ui Components

**Edit `components/ui/badge.tsx`** to add rating variants:

```typescript
// Add to badgeVariants:
rating: "bg-primary text-white hover:bg-primary/90",
ratingExcellent: "bg-rating-excellent text-white",
ratingGood: "bg-rating-good text-white",
ratingAverage: "bg-rating-average text-white",
ratingPoor: "bg-rating-poor text-white",
```

**Edit `components/ui/button.tsx`** to match Beli style:

```typescript
// Adjust primary variant to use teal
primary: "bg-primary text-white hover:bg-primary-dark",
```

**Time estimate:** 10 minutes

### 3.6 Create Rating Bubble Component

**Create `components/rating/rating-bubble.tsx`:**

```typescript
import { getRatingColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RatingBubbleProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingBubble({ rating, size = 'md', className }: RatingBubbleProps) {
  const colorClass = getRatingColor(rating);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div
      className={cn(
        'rating-bubble',
        `rating-${colorClass}`,
        sizeClasses[size],
        className
      )}
    >
      {rating.toFixed(1)}
    </div>
  );
}
```

**Time estimate:** 5 minutes

### 3.7 Create Restaurant Card Component

**Create `components/restaurant/restaurant-card.tsx`:**

```typescript
import { Restaurant } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { Avatar } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="beli-card cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              <p className="text-sm text-muted">
                {restaurant.cuisine.join(', ')} • {restaurant.priceRange}
              </p>
            </div>
            <RatingBubble rating={restaurant.rating} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-1 text-sm text-muted mb-3">
            <MapPin className="w-4 h-4" />
            <span>{restaurant.location.neighborhood}</span>
            {restaurant.distance && (
              <span className="ml-2">{restaurant.distance.toFixed(1)} mi</span>
            )}
          </div>

          {restaurant.friendAvatars && restaurant.friendAvatars.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {restaurant.friendAvatars.slice(0, 3).map((avatar, i) => (
                  <Avatar key={i} className="w-6 h-6 border-2 border-white">
                    <img src={avatar} alt="" />
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted">
                {restaurant.friendsWantToTryCount} friends want to try
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Time estimate:** 15 minutes

**Phase 3 Total Time: ~60 minutes**

---

## Phase 4: Screen Implementation

### 4.1 Create Root Layout

**Edit `app/layout.tsx`:**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beli - Discover Great Restaurants",
  description: "Your social restaurant discovery platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

**Create `app/providers.tsx`:**

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Time estimate:** 10 minutes

### 4.2 Create Header/Navigation

**Create `components/layout/header.tsx`:**

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, List, Search, Trophy, User } from 'lucide-react';

const navigation = [
  { name: 'Feed', href: '/feed', icon: Home },
  { name: 'Lists', href: '/lists', icon: List },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Profile', href: '/profile/current', icon: User },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Beli</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
            <div className="flex justify-around py-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2',
                      isActive ? 'text-primary' : 'text-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
```

**Time estimate:** 20 minutes

### 4.3 Implement Feed Screen

**Create `app/feed/page.tsx`:**

```typescript
import { MockDataService } from '@/lib/mockDataService';
import { ActivityCard } from '@/components/social/activity-card';

export default async function FeedPage() {
  // Server-side data fetching
  const feed = await MockDataService.getFeed();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

      <div className="space-y-4">
        {feed.map((item) => (
          <ActivityCard key={item.id} activity={item} />
        ))}
      </div>
    </div>
  );
}
```

**Create `components/social/activity-card.tsx`:**

```typescript
import { FeedItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { RatingBubble } from '@/components/rating/rating-bubble';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ActivityCardProps {
  activity: FeedItem;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="beli-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <img src={activity.user.avatar} alt={activity.user.displayName} />
            </Avatar>
            <div>
              <Link
                href={`/profile/${activity.user.username}`}
                className="font-semibold hover:underline"
              >
                {activity.user.displayName}
              </Link>
              <p className="text-sm text-muted">
                visited {activity.restaurant.name}
              </p>
              <p className="text-xs text-muted">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>

          <RatingBubble rating={activity.rating} size="sm" />
        </div>
      </CardHeader>

      <CardContent>
        <Link
          href={`/restaurant/${activity.restaurant.id}`}
          className="block mb-3"
        >
          <h3 className="font-semibold hover:underline">
            {activity.restaurant.name}
          </h3>
          <p className="text-sm text-muted">
            {activity.restaurant.cuisine.join(', ')} • {activity.restaurant.priceRange}
          </p>
        </Link>

        {activity.comment && (
          <p className="text-sm mb-3">{activity.comment}</p>
        )}

        {activity.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {activity.photos.slice(0, 4).map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="rounded-lg w-full aspect-square object-cover"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Time estimate:** 30 minutes

### 4.4 Implement Lists Screen

**Create `app/lists/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useLists } from '@/lib/hooks/use-lists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { ListScope } from '@/types';

export default function ListsPage() {
  const [activeTab, setActiveTab] = useState<ListScope>('been');
  const { data: lists, isLoading } = useLists();

  const filteredLists = lists?.filter(list => list.listType === activeTab) || [];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Lists</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ListScope)}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="been" className="flex-1">Been</TabsTrigger>
          <TabsTrigger value="want_to_try" className="flex-1">Want to Try</TabsTrigger>
          <TabsTrigger value="recs" className="flex-1">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-6">
              {filteredLists.map((list) => (
                <div key={list.id}>
                  <h2 className="font-semibold text-lg mb-3">{list.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Render restaurants from list */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Create `lib/hooks/use-lists.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useLists(userId?: string) {
  return useQuery({
    queryKey: ['lists', userId],
    queryFn: () => MockDataService.getUserLists(userId || 'user1'),
  });
}
```

**Time estimate:** 25 minutes

### 4.5 Implement Search Screen

**Create `app/search/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSearchRestaurants } from '@/lib/hooks/use-restaurants';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchRestaurants(query);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Search Restaurants</h1>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <Input
          type="search"
          placeholder="Search by name, cuisine, neighborhood..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && <div>Searching...</div>}

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {query && results?.length === 0 && (
        <div className="text-center py-12 text-muted">
          No restaurants found for "{query}"
        </div>
      )}
    </div>
  );
}
```

**Time estimate:** 20 minutes

### 4.6 Implement Restaurant Detail Screen

**Create `app/restaurant/[id]/page.tsx`:**

```typescript
import { MockDataService } from '@/lib/mockDataService';
import { notFound } from 'next/navigation';
import { RestaurantHeader } from '@/components/restaurant/restaurant-header';
import { RestaurantMetadata } from '@/components/restaurant/restaurant-metadata';
import { PopularDishes } from '@/components/restaurant/popular-dishes';
import { RatingBubble } from '@/components/rating/rating-bubble';

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = await MockDataService.getRestaurantById(params.id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <RestaurantHeader restaurant={restaurant} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          <RestaurantMetadata restaurant={restaurant} />
          <PopularDishes dishes={restaurant.popularDishes} />
        </div>

        <div>
          <div className="beli-card p-6">
            <h3 className="font-semibold mb-4">Overall Rating</h3>
            <div className="flex justify-center">
              <RatingBubble rating={restaurant.rating} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Time estimate:** 25 minutes

### 4.7 Implement Leaderboard & Profile Screens

**Create `app/leaderboard/page.tsx`:**

```typescript
import { MockDataService } from '@/lib/mockDataService';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const users = await MockDataService.getLeaderboard();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="space-y-2">
        {users.map((user, index) => (
          <Card key={user.id} className="beli-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="text-3xl font-bold text-primary w-12 text-center">
                #{index + 1}
              </div>

              <Avatar className="w-12 h-12">
                <img src={user.avatar} alt={user.displayName} />
              </Avatar>

              <div className="flex-1">
                <Link
                  href={`/profile/${user.username}`}
                  className="font-semibold hover:underline"
                >
                  {user.displayName}
                </Link>
                <p className="text-sm text-muted">
                  {user.stats.beenCount} restaurants visited
                </p>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold">{user.stats.currentStreak}</div>
                <div className="text-xs text-muted">day streak</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Create `app/profile/[username]/page.tsx`:**

```typescript
import { MockDataService } from '@/lib/mockDataService';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  // For now, just get current user
  const user = await MockDataService.getCurrentUser();

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <img src={user.avatar} alt={user.displayName} />
        </Avatar>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <p className="text-muted">@{user.username}</p>
          <p className="mt-2">{user.bio}</p>

          <div className="flex gap-6 mt-4">
            <div>
              <div className="text-xl font-bold">{user.stats.followers}</div>
              <div className="text-sm text-muted">Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold">{user.stats.following}</div>
              <div className="text-sm text-muted">Following</div>
            </div>
            <div>
              <div className="text-xl font-bold">{user.stats.beenCount}</div>
              <div className="text-sm text-muted">Been</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="beli-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">#{user.stats.rank}</div>
            <div className="text-sm text-muted mt-1">Rank</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-streak">{user.stats.currentStreak}</div>
            <div className="text-sm text-muted mt-1">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{user.stats.totalReviews || 0}</div>
            <div className="text-sm text-muted mt-1">Reviews</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Time estimate:** 30 minutes

**Phase 4 Total Time: ~2.5 hours**

---

## Phase 5: Data Layer Integration

### 5.1 Add React Query DevTools (Development)

```bash
npm install @tanstack/react-query-devtools
```

**Update `app/providers.tsx`:**

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to return:
<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Time estimate:** 5 minutes

### 5.2 Create Remaining Hooks

**Create `lib/hooks/use-leaderboard.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => MockDataService.getLeaderboard(),
  });
}
```

**Create `lib/hooks/index.ts`:**

```typescript
export * from './use-restaurants';
export * from './use-feed';
export * from './use-user';
export * from './use-lists';
export * from './use-leaderboard';
```

**Time estimate:** 5 minutes

### 5.3 Add Loading States

**Create `components/feedback/loading-spinner.tsx`:**

```typescript
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
}
```

**Create `components/feedback/empty-state.tsx`:**

```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-muted">{title}</h3>
      {description && (
        <p className="text-sm text-muted mt-2">{description}</p>
      )}
    </div>
  );
}
```

**Time estimate:** 10 minutes

### 5.4 Add Error Handling

**Create `components/feedback/error-message.tsx`:**

```typescript
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-error/10 border border-error/20 rounded-lg">
      <AlertCircle className="w-5 h-5 text-error" />
      <p className="text-sm text-error">{message}</p>
    </div>
  );
}
```

**Time estimate:** 5 minutes

**Phase 5 Total Time: ~25 minutes**

---

## Phase 6: Polish & Optimization

### 6.1 Add Responsive Design Improvements

**Update `components/layout/header.tsx`:**
- Add hamburger menu for mobile
- Ensure navigation is accessible on all screen sizes

**Time estimate:** 15 minutes

### 6.2 Add SEO Metadata

**Create `app/restaurant/[id]/layout.tsx`:**

```typescript
import { MockDataService } from '@/lib/mockDataService';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const restaurant = await MockDataService.getRestaurantById(params.id);

  if (!restaurant) {
    return {
      title: 'Restaurant Not Found',
    };
  }

  return {
    title: `${restaurant.name} - Beli`,
    description: `${restaurant.name} - ${restaurant.cuisine.join(', ')} restaurant in ${restaurant.location.neighborhood}. Rating: ${restaurant.rating}/10`,
  };
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**Time estimate:** 10 minutes

### 6.3 Add Skeleton Loading States

**Create skeletons for restaurant cards:**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function RestaurantCardSkeleton() {
  return (
    <div className="beli-card p-4">
      <div className="flex justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="w-11 h-11 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
```

**Time estimate:** 15 minutes

### 6.4 Add Animations

**Update global CSS with transitions:**

```css
@layer components {
  .page-transition {
    @apply transition-opacity duration-200;
  }

  .card-hover {
    @apply transition-all duration-200 hover:scale-[1.02];
  }
}
```

**Time estimate:** 10 minutes

### 6.5 Performance Optimization

**Add `next.config.ts` optimizations:**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'], // Add image domains
  },
  // Enable React Compiler (Next.js 15)
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
```

**Time estimate:** 5 minutes

### 6.6 Add Prettier Configuration

**Create `.prettierrc`:**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Time estimate:** 2 minutes

**Phase 6 Total Time: ~60 minutes**

---

## Phase 7: Deployment

### 7.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect to GitHub repository

**Time estimate:** 5 minutes

### 7.2 Prepare for Deployment

**Create `.env.example`:**

```
# No environment variables needed for MVP
# Future: Database URLs, API keys, etc.
```

**Update README:**

```markdown
# Beli Web

Restaurant discovery platform - Web version

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

## Deployment

Deployed on Vercel: [https://beli-web.vercel.app](https://beli-web.vercel.app)
```

**Time estimate:** 5 minutes

### 7.3 Deploy to Vercel

**Option 1: Via Vercel Dashboard (Recommended)**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import `beli-app` repository
4. Set Root Directory to `beli-web`
5. Framework Preset: Next.js (auto-detected)
6. Click "Deploy"

**Option 2: Via Vercel CLI**

```bash
cd beli-web
npm install -g vercel
vercel
```

Follow prompts:
- Set up and deploy? → Yes
- Which scope? → Your account
- Link to existing project? → No
- Project name? → beli-web
- Directory? → ./
- Override settings? → No

**Time estimate:** 10 minutes

### 7.4 Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Project Settings
2. Navigate to "Domains"
3. Add custom domain
4. Update DNS records as instructed

**Time estimate:** 15 minutes (if using custom domain)

### 7.5 Set Up Continuous Deployment

**Already configured automatically:**
- Push to `main` branch → auto-deploy to production
- Push to other branches → auto-deploy preview URLs
- Pull requests → preview deployments

**Verify:**
1. Make a small change
2. Push to GitHub
3. Check Vercel dashboard for deployment

**Time estimate:** 5 minutes

**Phase 7 Total Time: ~25 minutes (40 with custom domain)**

---

## Implementation Timeline

### Day 1: Foundation (4 hours)
- **Phase 1:** Initial Setup (15 min)
- **Phase 2:** Design System Migration (30 min)
- **Phase 3:** Core Components (60 min)
- **Phase 4:** Start Screen Implementation
  - Root Layout (10 min)
  - Header/Navigation (20 min)
  - Feed Screen (30 min)
  - Lists Screen (25 min)
  - **CHECKPOINT:** Working app with 2 screens

**End of Day 1 Deliverable:** Basic working web app with Feed and Lists

---

### Day 2: Complete Screens (4 hours)
- **Phase 4 (continued):** Screen Implementation
  - Search Screen (20 min)
  - Restaurant Detail (25 min)
  - Leaderboard (30 min)
  - Profile (30 min)
- **Phase 5:** Data Layer Integration (25 min)
- **CHECKPOINT:** All screens functional

**End of Day 2 Deliverable:** Feature-complete app

---

### Day 3: Polish & Deploy (3 hours)
- **Phase 6:** Polish & Optimization (60 min)
  - Responsive design
  - SEO metadata
  - Loading states
  - Animations
- **Phase 7:** Deployment (25 min)
- **Testing:** Manual QA on all screens (30 min)
- **Documentation:** Update README, create usage guide (15 min)

**End of Day 3 Deliverable:** Production-ready app deployed to Vercel

---

**Total Estimated Time: 11 hours** (spread over 2-3 days)

---

## Success Metrics

### Technical Metrics
- ✅ All 7 screens implemented and functional
- ✅ TypeScript strict mode with no errors
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Lighthouse score: 90+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO
- ✅ Fast page loads (< 2s FCP, < 3s LCP)
- ✅ No console errors in production

### Feature Parity
- ✅ Feed with activity cards
- ✅ Lists (Been/Want-to-try/Recommendations)
- ✅ Search with filters
- ✅ Leaderboard with rankings
- ✅ User profiles with stats
- ✅ Restaurant detail pages
- ✅ Rating bubbles with color system
- ✅ Design system matching mobile

### Deployment Success
- ✅ Deployed to Vercel
- ✅ Automatic deployments from GitHub
- ✅ Working public URL
- ✅ Preview deployments for PRs
- ✅ Error monitoring setup

---

## Future Enhancements (Post-MVP)

### Phase 8: Backend Integration
- Replace MockDataService with real API
- Add PostgreSQL database
- Implement authentication (NextAuth.js)
- User-generated content (reviews, photos)

### Phase 9: Advanced Features
- Real-time updates (WebSockets)
- Photo upload (Cloudinary/S3)
- Interactive maps (Mapbox)
- Social features (comments, likes)
- Notifications

### Phase 10: Optimization
- Image optimization
- Code splitting
- Service worker/PWA
- Analytics (Vercel Analytics, PostHog)
- Error tracking (Sentry)

---

## Appendix

### Required npm Packages (Full List)

```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.59.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.454.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "tailwindcss": "^4.0.0",
    "eslint": "^9",
    "eslint-config-next": "^15.1.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "@tanstack/react-query-devtools": "^5.59.0"
  }
}
```

### File Count Breakdown

- **Total files to create:** ~60 files
- **Files to copy from mobile:** ~10 files (types, mock data, service)
- **New React components:** ~30 files
- **Pages/routes:** 7 files
- **Config files:** ~10 files
- **Utility/helper files:** ~5 files

### Code Reuse from Mobile App

| Category | Reuse % | Notes |
|----------|---------|-------|
| TypeScript Types | 100% | Direct copy |
| Mock Data | 100% | Direct copy |
| MockDataService | 95% | Update import paths only |
| Business Logic | 80% | Adapt to web patterns |
| Component Logic | 70% | Same patterns, different UI |
| UI Components | 0% | Rebuilt with shadcn/ui |

---

## Questions & Considerations

### Before Starting
1. Do you want a homepage (landing page) or redirect `/` to `/feed`?
2. Should Profile route be `/profile` (current user) or `/profile/[username]`?
3. Do you want authentication placeholder or skip for now?
4. Should we add basic analytics from day 1?
5. Custom domain ready or use Vercel subdomain initially?

### Design Decisions
1. **Desktop layout:** Should navigation be sidebar or top header?
   - **Recommendation:** Top header for familiarity
2. **Max content width:** How wide should content be on large screens?
   - **Recommendation:** 1280px max, centered
3. **Mobile nav:** Bottom tabs (like mobile app) or hamburger menu?
   - **Recommendation:** Bottom tabs for consistency
4. **Images:** Use placeholder images or Unsplash API?
   - **Recommendation:** Placeholder images via Unsplash for MVP

---

## Risk Mitigation

### Potential Issues & Solutions

**Issue:** shadcn/ui components don't match Beli design exactly
**Solution:** All shadcn components are in your codebase - fully customizable

**Issue:** Mock data paths break after copying
**Solution:** Use TypeScript path aliases (`@/`) from the start

**Issue:** Vercel deployment fails
**Solution:** Test build locally first (`npm run build`)

**Issue:** Image loading slow on mobile
**Solution:** Use Next.js `<Image>` component for optimization

**Issue:** Different behavior between dev and production
**Solution:** Test production build locally (`npm run build && npm start`)

---

## Commands Cheatsheet

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npx tsc                  # TypeScript type check

# shadcn/ui
npx shadcn@latest add [component]    # Add component
npx shadcn@latest add --all          # Add all components

# Vercel
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View logs

# Git workflow
git add .
git commit -m "message"
git push                 # Triggers auto-deployment
```

---

**End of Implementation Plan**

This plan provides a complete roadmap to build and deploy the Beli web app. Each phase is designed to be completable in one sitting, with clear checkpoints and deliverables.
