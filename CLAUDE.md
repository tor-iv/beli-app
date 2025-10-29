# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo containing two applications:

### beli-native/
React Native Expo app for iOS and Android mobile platforms.

### beli-web/
Next.js web application for browser-based access.

Both apps share the same design system, data models, and core features but have independent codebases and deployments.

---

## Development Commands

### Mobile App Commands (beli-native/)
All React Native development happens in the `beli-native/` directory:

```bash
cd beli-native && npm start              # Start Expo dev server
cd beli-native && npm start -- --clear   # Start with cache cleared
cd beli-native && npm run ios            # Run on iOS simulator
cd beli-native && npm run android        # Run on Android simulator
cd beli-native && npm run web            # Run Expo web version
cd beli-native && npx tsc                # TypeScript type checking
```

**Development Notes:**
- Always run commands from `beli-native/` directory
- Use `npm start -- --clear` to clear Metro bundler cache when experiencing bundling issues
- App uses Expo SDK 54 with React Native 0.81.4
- TypeScript strict mode is enabled - run `npx tsc` before committing
- No linting/formatting scripts configured - rely on TypeScript checking

### Web App Commands (beli-web/)
All Next.js web development happens in the `beli-web/` directory:

```bash
cd beli-web && npm run dev               # Start Next.js dev server (localhost:3000)
cd beli-web && npm run build             # Build for production
cd beli-web && npm start                 # Start production server
cd beli-web && npm run lint              # Run ESLint
cd beli-web && npx tsc --noEmit          # TypeScript type checking
```

**Development Notes:**
- Always run commands from `beli-web/` directory
- Dev server runs on http://localhost:3000
- TypeScript strict mode is enabled
- Uses Next.js 16 with App Router
- Automatically deploys to Vercel on push to main

**Deployment:**
- Vercel automatically deploys when `beli-web/` changes are pushed to GitHub
- Preview deployments created for all pull requests
- Root directory configured as `beli-web/` in Vercel project settings
- Production URL: https://beli-web.vercel.app (after Vercel setup)

---

## Architecture Overview

### Project Structure
This is a monorepo structure:
- `beli-native/` - React Native mobile application (iOS/Android)
- `beli-web/` - Next.js web application
- `beli-images/` - Design assets and mockups
- Root contains documentation files (requirements, design system, build guide, web implementation plan)

### Tech Stack

**Mobile (beli-native/):**
- **Framework**: React Native 0.81.4 with Expo SDK 54
- **React Version**: 19.1.0
- **Navigation**: React Navigation 7 (bottom tabs + stack)
- **State Management**: Zustand (store directory exists but not yet implemented)
- **Data Layer**: MockDataService class (`src/data/mockDataService.ts`)
- **UI**: Custom component library with domain-based organization
- **Maps**: react-native-maps for location features

**Web (beli-web/):**
- **Framework**: Next.js 16 with App Router
- **Navigation**: Next.js file-based routing
- **State Management**: Zustand + React Query (TanStack Query)
- **Data Layer**: MockDataService (copied from mobile, adapted for web)
- **UI**: shadcn/ui component library + Tailwind CSS
- **Deployment**: Vercel with automatic CI/CD

### Component Organization

**Mobile (beli-native/src/components/):**
Components are organized by domain:
- `base/` - Button, Card, Avatar, TextInput, etc.
- `typography/` - Text, Heading, Caption
- `rating/` - RatingBubble, ScoreBadge, RatingScale
- `restaurant/` - RestaurantCard, RestaurantHeader, etc.
- `social/` - ActivityCard, SocialActions, UserPreview
- `lists/` - ListSection, ListTypeSelector
- `navigation/` - TabBar customizations
- `feedback/` - LoadingSpinner, EmptyState
- `layout/` - Screen, Container, Spacer
- `modals/` - AddRestaurantModal, WhatToOrderModal, etc.
- `group-dinner/` - Swiper, MatchBreakdown, ParticipantSelector
- `tastemakers/` - TastemakerCard, BadgeDisplay, etc.

**Web (beli-web/components/):**
Similar domain-based organization with platform-specific implementations:
- `ui/` - shadcn/ui components (button, card, dialog, etc.)
- `restaurant/` - Restaurant display components
- `lists/` - List management components (ListPickerModal, MobileTabs)
- `feed/` - Social feed components
- `modals/` - Modal components including WhatToOrderModal
- `tastemakers/` - Tastemaker feature components
- `navigation/` - Navigation and header components
- `profile/` - Profile display components

### Theme System

**Mobile (beli-native/src/theme/):**
All styling constants are centralized:
- `colors.ts` - Brand colors, semantic rating colors, UI colors
- `typography.ts` - Font sizes, weights, line heights
- `spacing.ts` - Spacing scale and border radius
- `shadows.ts` - Shadow presets for cards/elevation
- `animations.ts` - Animation timing and easing functions

**Usage**:
```typescript
import { colors, spacing, typography } from '../theme';

// Semantic rating colors
colors.ratingExcellent  // 8.0+ (green)
colors.ratingGood       // 7.0-7.9 (light green)
colors.ratingAverage    // 5.0-6.9 (orange)
colors.ratingPoor       // <5.0 (red)

// Brand
colors.primary          // #0B7B7F (teal)
```

**Web (beli-web/):**
Uses Tailwind CSS with custom configuration in [tailwind.config.ts](beli-web/tailwind.config.ts):
- Brand colors defined as CSS variables in [app/globals.css](beli-web/app/globals.css)
- shadcn/ui components use the design tokens
- Responsive breakpoints configured for mobile-first design

### Data Layer Architecture

**MockDataService** serves as the complete backend replacement for both platforms:

**Mobile:** [beli-native/src/data/mockDataService.ts](beli-native/src/data/mockDataService.ts)
**Web:** [beli-web/lib/mockDataService.ts](beli-web/lib/mockDataService.ts)

Key characteristics:
- All methods return Promises with simulated network delay (150ms)
- Provides full CRUD operations for users, restaurants, reviews, lists
- Includes social features (activity feed, following, leaderboard)
- Mock data organized in `data/mock/` directory for each platform
- Includes Tastemaker data (experts, posts, badges)
- Group dinner matching and "What to Order" recommendation logic

**Important**: When adding features that need data:
1. Check if MockDataService already has the method
2. If not, add new mock data to `data/mock/` (mobile or web)
3. Add new service method to MockDataService
4. Import and use the service method in components

**Mobile data patterns:**
```typescript
import { MockDataService } from '../data/mockDataService';

// In component
useEffect(() => {
  const loadData = async () => {
    const restaurants = await MockDataService.getAllRestaurants();
    setRestaurants(restaurants);
  };
  loadData();
}, []);
```

**Web data patterns:**
React Query hooks from [lib/hooks/](beli-web/lib/hooks/) wrap MockDataService for better caching:
```typescript
import { useRestaurants } from '@/lib/hooks/use-restaurants';

const { data: restaurants, isLoading, error } = useRestaurants();
```

Available hooks:
- `useRestaurants()` - All restaurants or filtered by criteria
- `useUser(userId)` - User profile and stats
- `useFeed()` - Social activity feed
- `useLeaderboard()` - User rankings
- `useLists()` - User's lists (Been, Want-to-try, Recommendations)
- `useListCounts(userId)` - Count of restaurants in each list
- `useTastemakerPosts()` - Tastemaker articles
- `useRanking()` - User ranking data
- `useFeaturedLists()` - Curated restaurant lists
- `useListProgress()` - Track progress through lists
- `useTasteProfile()` - User taste preferences
- `useUsers()` - User search and discovery
- `useNotifications()` - User notifications
- `useMediaQuery()` - Responsive breakpoint detection

### Navigation Structure

**Mobile (React Navigation 7):**
Bottom tab navigation with 5 main screens:
1. **Feed** - Social activity feed with custom header
2. **Lists** - Been/Want-to-try/Recommendations with native header "Your Lists"
3. **Search** - Restaurant and user search with custom header
4. **Leaderboard** - Friend rankings with native header
5. **Profile** - User stats and social connections with custom header

Stack navigator handles detail screens (RestaurantInfoScreen, UserProfileScreen, TastemakerPostScreen, etc.)

Additional screens:
- **GroupDinnerScreen** - AI-powered group dining with swipe interface
- **TastemakersScreen** - Browse food experts and their content
- **SettingsHubScreen** - Settings and account management
- **FeaturedListsScreen** - Curated restaurant lists

**Web (Next.js App Router):**
File-based routing in [beli-web/app/](beli-web/app/):
- `/` - Home/landing page with demo experience
- `/feed` - Social activity feed
- `/lists` - User's restaurant lists
- `/search` - Restaurant and user search
- `/leaderboard` - User rankings
- `/profile/[username]` - User profiles
- `/restaurant/[id]` - Restaurant details
- `/tastemakers` - Food expert directory
- `/tastemakers/[id]` - Individual tastemaker profiles
- `/tastemakers/post/[postId]` - Tastemaker articles
- `/group-dinner` - Group dining coordinator
- `/tutorial` - Onboarding tutorial
- `/settings/*` - Settings pages (account, privacy, notifications, etc.)
- `/challenge` - Challenge tracking
- `/notifications` - Notifications center
- `/faq` - Frequently asked questions
- `/import` - Import data feature
- `/reservations` - Reservation management

Navigation components in [components/navigation/](beli-web/components/navigation/)

### Type System

Comprehensive TypeScript types defined in:
- **Mobile:** [beli-native/src/types.ts](beli-native/src/types.ts)
- **Web:** [beli-web/types/](beli-web/types/) (modular type definitions)

Core types:
- `User` - User profiles and stats
- `Restaurant` - Restaurant data with scores and metadata
- `UserRestaurantRelation` - Been/want-to-try/recommended status
- `Review` - User reviews and ratings
- `FeedItem` - Social feed activities
- `List` - User-created lists
- `Tastemaker` - Food expert profiles
- `TastemakerPost` - Expert articles and content
- `Badge` - Achievement badges for tastemakers/users
- `MenuItem` - Restaurant menu items with portions and dietary info

All components and functions are fully typed with TypeScript strict mode enabled.

### Design System Principles

**Modern Premium Casual aesthetic**:
- Primary color: Teal (#0B7B7F) for brand elements
- Rating colors: Green (excellent) → Orange (average) → Red (poor)
- Clean, content-first with high information density
- Generous white space, subtle shadows, no borders
- System fonts (SF Pro Display on iOS)

**Key visual elements**:
- Circular rating bubbles (44x44px)
- Match percentage scores
- Streak counters and badges
- Multi-tier list organization

## Current Implementation Status

### Completed Features (Both Platforms)

**Core Screens:**
- **Feed** - Social activity feed with restaurant discoveries
- **Lists** - Extensive lists management with filters/sorting (mobile has 86KB ListsScreen implementation)
- **Search** - Restaurant and user search
- **Leaderboard** - User rankings and competition
- **Profile** - User stats and social connections
- **Restaurant Details** - Detailed restaurant view with "What to Order" feature

**Major Features:**
- **Tastemakers** (Web fully implemented, Mobile has screens) - 13 NYC food expert profiles with badges, articles, and engagement tracking
- **Group Dinner/Eat Now** (Mobile fully implemented) - AI-powered group dining with 6-factor match algorithm and Tinder-style swiper
- **What to Order** (Both platforms) - Smart menu recommendation engine based on party size and hunger level

**Additional Screens:**
- Settings hub with account, privacy, and notification settings
- Featured lists and list detail views
- User profile views
- Tastemaker post detail views
- Challenge/goal tracking screens

### In Progress
- Additional web features for full parity with mobile
- List picker modal and mobile tabs (new files in beli-web/components/lists/)

### Not Yet Implemented
- Real backend integration (currently using MockDataService)
- Authentication flow
- Push notifications
- Photo upload functionality
- Real-time features (live updates, notifications)
- Payment/reservation integration

## Common Development Patterns

### Adding a New Mobile Screen
1. Create screen file in [beli-native/src/screens/](beli-native/src/screens/)
2. Add navigation type to [src/navigation/types.tsx](beli-native/src/navigation/types.tsx)
3. Register in navigator ([src/navigation/RootNavigator.tsx](beli-native/src/navigation/RootNavigator.tsx))
4. Use MockDataService for data
5. Import theme tokens for styling

### Adding a New Web Page
1. Create page file in [beli-web/app/](beli-web/app/) directory (follows Next.js App Router conventions)
2. Use `page.tsx` for routes, `layout.tsx` for shared layouts
3. Use React Query hooks from [lib/hooks/](beli-web/lib/hooks/) for data fetching
4. Import shadcn/ui components from [components/ui/](beli-web/components/ui/)
5. Use Tailwind CSS classes for styling

### Styling Mobile Components
```typescript
import { StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
});
```

### Styling Web Components
```typescript
// Use Tailwind CSS classes
<div className="bg-white rounded-lg p-4 shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
</div>

// For dynamic styles, use cn() utility
import { cn } from '@/lib/utils';

<div className={cn(
  "rounded-lg p-4",
  isActive && "bg-teal-50",
  isDisabled && "opacity-50"
)}>
```

## Important Constraints

**Mobile:**
- **Expo SDK 54** with React Native 0.81.4 - Use expo-compatible packages only
- **React 19.1.0** - Latest stable React version
- **TypeScript strict mode** - All types must be properly defined
- **No dark mode** - Light theme only
- **Portrait orientation only** - Not optimized for landscape
- **iOS Simulator recommended** - Primary development target

**Web:**
- **Next.js 16** with App Router - Use server/client components appropriately
- **React 19.2.0** - Latest stable React version
- **TypeScript strict mode** - All types must be properly defined
- **Path alias** - Use `@/*` for imports (configured in [tsconfig.json](beli-web/tsconfig.json))
- **Image optimization** - Configured for Unsplash and Pravatar in [next.config.ts](beli-web/next.config.ts)
- **Mobile-first responsive** - Design for mobile, then tablet, then desktop

**Both Platforms:**
- Mock data only - No real API integration yet
- No authentication/authorization implemented
- Data is ephemeral (resets on app restart)

## Project Context

This is a portfolio project showcasing three major features:

1. **Tastemakers** - Curated food expert profiles with badges and articles
2. **Group Dinner/Eat Now** - AI-powered group dining with match algorithm
3. **What to Order** - Smart menu recommendations based on party size/hunger

See [README.md](README.md) for full feature descriptions and implementation details.

Additional planned features documented in [new-features-spec.md](new-features-spec.md):
- Lucky Spin (random restaurant picker)
- Food Crawl (multi-restaurant adventures)
- Scavenger Hunt (competitive dining challenges)
- New Openings (recently opened discovery)