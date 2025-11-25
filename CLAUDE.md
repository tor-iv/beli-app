# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo containing frontend applications and backend services:

### beli-native/
React Native Expo app for iOS and Android mobile platforms.

### beli-web/
Next.js web application for browser-based access.

### beli-backend/
Django REST API backend connecting to Supabase PostgreSQL.

### supabase/
Supabase configuration with PostgreSQL migrations, Edge Functions, and seed data.

Both frontend apps share the same design system, data models, and core features but have independent codebases and deployments. The backend provides multiple data source options with automatic fallback.

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

### Django Backend Commands (beli-backend/)
Python Django REST API development happens in the `beli-backend/` directory:

```bash
cd beli-backend && source venv/bin/activate  # Activate virtual environment
cd beli-backend && python manage.py runserver  # Start Django API (localhost:8000)
./scripts/verify-django.sh  # Verify all Django API endpoints
```

**Development Notes:**
- Django connects to Supabase PostgreSQL using `managed=False` models
- API available at `http://localhost:8000/api/v1/`
- Requires `.env` file with `DATABASE_URL` (see `.env.example`)
- Uses domain-driven app structure: `apps/restaurants/`, `apps/users/`, `apps/feed/`, etc.

### Supabase Commands
Database and Edge Function management:

```bash
cd supabase && supabase start      # Start local Supabase (requires Docker)
cd supabase && supabase db reset   # Apply all migrations
cd supabase && supabase status     # Get API keys and URLs
supabase functions deploy          # Deploy Edge Functions
```

**Local Supabase URLs:**
- API: http://localhost:54321
- Studio: http://localhost:54323
- Database: postgresql://postgres:postgres@localhost:54322/postgres

---

## Architecture Overview

### Project Structure
This is a monorepo structure:
- `beli-native/` - React Native mobile application (iOS/Android)
- `beli-web/` - Next.js web application
- `beli-backend/` - Django REST API connecting to Supabase PostgreSQL
- `supabase/` - Database migrations, Edge Functions, and configuration
- `scripts/` - Verification and utility scripts
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
- **Data Layer**: Configurable provider with Django/Supabase/mock fallback (`lib/data-provider/`)
- **Search**: Elasticsearch with Supabase full-text fallback (`lib/search/`)
- **UI**: shadcn/ui component library + Tailwind CSS
- **Linting**: ESLint with Airbnb-style config + Prettier
- **Deployment**: Vercel with automatic CI/CD

**Backend (beli-backend/):**
- **Framework**: Django 5 with Django REST Framework
- **Database**: Supabase PostgreSQL (managed=False models)
- **Architecture**: Domain-driven apps (`apps/restaurants/`, `apps/users/`, `apps/feed/`, etc.)
- **Auth**: JWT-ready (connects to Supabase Auth)

**Database (supabase/):**
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **Security**: Row Level Security (RLS) policies
- **Functions**: PostgreSQL functions + Deno Edge Functions
- **Migrations**: Version-controlled schema in `migrations/`

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

**Web:** The data layer has been refactored into modular domain services organized in [beli-web/lib/services/](beli-web/lib/services/).

**Mobile:** Still uses monolithic [beli-native/src/data/mockDataService.ts](beli-native/src/data/mockDataService.ts).

#### Web Service Architecture (20 Domain Services)

Services are organized into 5 dependency phases:

**Phase 1 - Independent Services:**
- NotificationService, SearchHistoryService, LeaderboardService, ReviewService, ListService

**Phase 2 - Foundation Services:**
- UserService, SocialService, RestaurantService, RestaurantStatusService

**Phase 3 - Relationship & Feed:**
- UserRestaurantService, FeedService, FeedInteractionService

**Phase 4 - Tastemaker, Reservation & Menu:**
- TastemakerService, TastemakerPostService, ReservationService, MenuService

**Phase 5 - Complex Features:**
- TasteProfileService, RankingService, GroupDinnerService

Key characteristics:
- All services are static classes with async methods
- Network delay simulation: 50ms (configurable in BaseService)
- Mock data remains in `data/mock/` directory
- Services share common utilities via BaseService (caching, delay)
- Each service focuses on a single domain

**Importing services:**
```typescript
import { RestaurantService, UserService, ListService } from '@/lib/services';
```

**Web data patterns:**
React Query hooks wrap domain services for optimal caching:
```typescript
import { useRestaurants } from '@/lib/hooks/use-restaurants';

const { data: restaurants, isLoading, error } = useRestaurants();

// Or call services directly:
const restaurants = await RestaurantService.getAllRestaurants();
```

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

### Data Provider System

The web app supports multiple data backends with automatic fallback:

**Environment Variables (beli-web/.env.local):**
```env
NEXT_PUBLIC_DATA_PROVIDER=auto  # 'django' | 'supabase' | 'mock' | 'auto'
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Provider Modes:**
- `django` - Use Django REST API exclusively
- `supabase` - Use Supabase SDK exclusively
- `mock` - Use mock data (for demos without database)
- `auto` - Try Supabase → mock with automatic fallback

**Usage:**
```typescript
import { withFallback, resolveProvider } from '@/lib/data-provider';

// Wrap operations with automatic fallback
const { data, provider } = await withFallback(
  async () => supabaseQuery(),   // Try Supabase first
  () => mockData,                 // Fall back to mock
  { djangoOperation: async () => djangoClient.get('/restaurants/') }
);
```

### Search Provider System

Restaurant search supports Elasticsearch with Supabase fallback:

**Environment Variables:**
```env
SEARCH_PROVIDER=auto  # 'elasticsearch' | 'supabase' | 'auto'
ELASTICSEARCH_URL=https://your-cluster.bonsaisearch.net
```

**Usage:**
```typescript
import { searchRestaurants, autocomplete, geoSearch } from '@/lib/search';

// Automatically uses best available provider
const { results, provider } = await searchRestaurants({ query: 'pizza' });
const suggestions = await autocomplete('piz');
const nearby = await geoSearch(40.758, -73.985, '2km');
```

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

### Backend Status
- **Django API**: Implemented with domain-driven apps, connects to Supabase PostgreSQL
- **Supabase**: PostgreSQL + PostGIS schema with RLS policies and Edge Functions
- **Data Provider**: Automatic fallback between Django → Supabase → mock data
- **Search**: Elasticsearch (Bonsai.io) with Supabase full-text fallback

### Not Yet Implemented
- Authentication flow UI (backend supports it)
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

**Backend:**
- **Django** uses Python 3.12+ with Django 5.x
- **Supabase** requires Docker for local development (`supabase start`)
- **PostgreSQL** uses PostGIS extension for geospatial queries
- **Environment variables** required - see `.env.example` files in each project

**Both Platforms:**
- Web supports Django/Supabase/mock data via `NEXT_PUBLIC_DATA_PROVIDER`
- Mobile still uses MockDataService (backend integration in progress)
- No authentication UI implemented (backend supports it)

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