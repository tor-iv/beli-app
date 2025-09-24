# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `cd beli-native && npm start` - Start Expo development server (clear cache with --clear flag)
- `cd beli-native && npm run ios` - Run on iOS simulator
- `cd beli-native && npm run android` - Run on Android simulator
- `cd beli-native && npm run web` - Run in web browser
- `cd beli-native && npx tsc` - Type check the TypeScript code

### Development Notes
- Always work from the `beli-native/` directory for React Native development
- Use `npx expo start --clear` to clear Metro cache when experiencing bundling issues
- The app uses Expo SDK 54 with React Native 0.81.4
- TypeScript is strictly enforced - run `npx tsc` to check for type errors
- No linting/formatting scripts are configured - rely on TypeScript checking

## Architecture Overview

### Project Structure
This is a React Native Expo app with a monorepo structure:
- `beli-native/` - Main React Native application
- `beli-images/` - Design assets and mockups
- Root contains documentation files (requirements, design system, build guide)

### App Architecture
- **Navigation**: Bottom tab navigator with 5 main screens (Feed, Lists, Search, Leaderboard, Profile)
- **State Management**: Zustand for client state
- **Data Layer**: MockDataService class provides comprehensive mock data API
- **UI System**: Custom component library organized by domain (base, typography, rating, restaurant, social, etc.)

### Component Organization
Components are organized into logical domains under `src/components/`:
- `base/` - Fundamental UI components (Button, Card, Avatar, etc.)
- `typography/` - Text components (Text, Heading, Caption)
- `rating/` - Rating and scoring components (RatingBubble, ScoreBadge, etc.)
- `restaurant/` - Restaurant-specific components
- `social/` - Social interaction components (ActivityCard, SocialActions)
- `lists/` - List management components
- `navigation/` - Navigation-related components
- `feedback/` - Loading states and feedback UI
- `layout/` - Layout and spacing components

### Theme System
The app uses a comprehensive theme system (`src/theme/`):
- `colors.ts` - Color tokens including semantic rating colors
- `typography.ts` - Font sizes, weights, and text styles
- `spacing.ts` - Spacing scale and border radius values
- `shadows.ts` - Shadow presets
- `animations.ts` - Animation timing and easing

Key theme usage:
- Import theme tokens: `import { colors, spacing, typography } from '../theme'`
- Use semantic colors for ratings: `colors.ratingExcellent`, `colors.ratingGood`, etc.
- Primary brand color: `colors.primary` (teal)

### Data Layer
The MockDataService (`src/data/mockDataService.ts`) provides a complete mock backend:
- User management (authentication, profiles, stats)
- Restaurant data (search, filtering, recommendations)
- Social features (activity feed, reviews, following)
- List management (been/want-to-try/recommendation lists)
- All methods return Promises with simulated network delay

Mock data is organized in `src/data/mock/`:
- `users.ts` - User profiles and stats
- `restaurants.ts` - Restaurant database
- `activities.ts` - Social feed activities
- `lists.ts` - User-generated lists
- `types.ts` - TypeScript interfaces

### Design System Guidelines
The app follows a "Modern Premium Casual" design aesthetic:
- Clean, content-first approach with high information density
- Primary color: Teal (#0B7B7F) for brand elements
- Rating colors: Green (excellent) → Orange (average) → Red (poor)
- Typography: SF Pro Display system font
- Generous white space with subtle shadows and borders

### Key Features
1. **Social Feed**: Activity cards showing restaurant visits, ratings, and social interactions
2. **Restaurant Lists**: Been/Want-to-try/Recommendations with filtering and sorting
3. **Search**: Restaurant and user search with advanced filtering
4. **Leaderboard**: Friend rankings and achievements
5. **Profile**: User stats, badges, and social connections

### TypeScript Usage
- Comprehensive type definitions in `src/types.ts` and `src/data/mock/types.ts`
- All components are fully typed with proper props interfaces
- Theme system is fully typed with string literal unions for consistency

### Navigation Structure
Bottom tab navigation with:
- Feed (custom header)
- Lists (native header: "Your Lists")
- Search (custom header)
- Leaderboard (native header)
- Profile (custom header)

Custom headers are implemented within screen components rather than navigation options.