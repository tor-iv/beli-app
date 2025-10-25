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
- Uses Next.js 15 with App Router
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
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 (bottom tabs + stack)
- **State Management**: Zustand (store directory exists but not yet implemented)
- **Data Layer**: MockDataService class (`src/data/mockDataService.ts`)
- **UI**: Custom component library with domain-based organization
- **Maps**: react-native-maps for location features

**Web (beli-web/):**
- **Framework**: Next.js 15 with App Router
- **Navigation**: Next.js file-based routing
- **State Management**: Zustand + React Query (TanStack Query)
- **Data Layer**: MockDataService (copied from mobile, adapted for web)
- **UI**: shadcn/ui component library + Tailwind CSS
- **Deployment**: Vercel with automatic CI/CD

### Component Organization

Components are organized by domain under `src/components/`:
```
components/
├── base/           # Button, Card, Avatar, TextInput, etc.
├── typography/     # Text, Heading, Caption
├── rating/         # RatingBubble, ScoreBadge, RatingScale
├── restaurant/     # RestaurantCard, RestaurantHeader, etc.
├── social/         # ActivityCard, SocialActions, UserPreview
├── lists/          # ListSection, ListTypeSelector
├── navigation/     # TabBar customizations
├── feedback/       # LoadingSpinner, EmptyState
├── layout/         # Screen, Container, Spacer
└── modals/         # AddRestaurantModal, etc.
```

### Theme System (`src/theme/`)

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

### Data Layer Architecture

**MockDataService** (`src/data/mockDataService.ts`) serves as the complete backend replacement:
- All methods return Promises with simulated network delay (150ms)
- Provides full CRUD operations for users, restaurants, reviews, lists
- Includes social features (activity feed, following, leaderboard)
- Mock data organized in `src/data/mock/` directory

**Important**: When adding features that need data:
1. Check if MockDataService already has the method
2. If not, add new mock data to `src/data/mock/`
3. Add new service method to MockDataService
4. Import and use the service method in components

**Web-specific data patterns:**
- Use React Query hooks from `lib/hooks/` (e.g., `useRestaurants`, `useUser`, `useFeed`)
- React Query handles caching, loading states, and error handling automatically
- Hooks wrap MockDataService methods for consistent API
- Example:
```typescript
import { useRestaurants } from '@/lib/hooks/use-restaurants';

const { data: restaurants, isLoading, error } = useRestaurants();
```

### Navigation Structure

Bottom tab navigation with 5 main screens:
1. **Feed** - Social activity feed with custom header
2. **Lists** - Been/Want-to-try/Recommendations with native header "Your Lists"
3. **Search** - Restaurant and user search with custom header
4. **Leaderboard** - Friend rankings with native header
5. **Profile** - User stats and social connections with custom header

Stack navigator handles detail screens (RestaurantInfoScreen, etc.)

### Type System

Comprehensive TypeScript types in `src/types.ts`:
- `User` - User profiles and stats
- `Restaurant` - Restaurant data with scores and metadata
- `UserRestaurantRelation` - Been/want-to-try/recommended status
- `Review` - User reviews and ratings
- `FeedItem` - Social feed activities
- `List` - User-created lists

All components and functions are fully typed.

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

### Completed Screens
- **FeedScreen** - Activity feed with restaurant discoveries
- **ListsScreen** - Extensive lists management with filters/sorting
- **SearchScreen** - Restaurant and user search
- **LeaderboardScreen** - User rankings
- **ProfileScreen** - User stats and social
- **RestaurantInfoScreen** - Detailed restaurant view

### Modified Files
- `AddRestaurantModal.tsx` - Currently being worked on

### Not Yet Implemented
- Zustand store (directory exists but empty)
- Authentication flow
- Real backend integration
- Push notifications
- Photo upload functionality

## Common Development Patterns

### Adding a New Screen
1. Create screen file in `src/screens/`
2. Add navigation type to `src/navigation/types.tsx`
3. Register in navigator (`src/navigation/RootNavigator.tsx`)
4. Use MockDataService for data
5. Import theme tokens for styling

### Using Mock Data
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

### Styling Components
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

## Important Constraints

- **No dark mode** - Light theme only
- **Portrait orientation only** - Not optimized for landscape
- **TypeScript strict mode** - All types must be properly defined
- **Expo SDK 54** - Use expo-compatible packages only
- **React Native 0.81.4** - Check compatibility for new dependencies

## Git Workflow

Current branch: `main`
Main branch for PRs: `main`

Recent work focused on:
- Restaurant discovery and display
- Adding restaurants flow
- Restaurant detail screen