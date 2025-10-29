# Beli Web App

Web application for Beli - a restaurant discovery and social dining platform.

## Overview

This is the web version of Beli, built with Next.js 16 and the App Router. It provides a responsive, browser-based experience for discovering restaurants, connecting with food enthusiasts, and exploring expert recommendations.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: 19.2.0
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand + React Query (TanStack Query)
- **Maps**: Leaflet (react-leaflet)
- **Deployment**: Vercel with automatic CI/CD

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Type Checking

```bash
# Run TypeScript type checker
npx tsc --noEmit
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
beli-web/
├── app/                    # Next.js App Router pages
│   ├── feed/              # Social activity feed
│   ├── lists/             # Restaurant lists
│   ├── search/            # Search functionality
│   ├── leaderboard/       # User rankings
│   ├── profile/           # User profiles
│   ├── restaurant/        # Restaurant details
│   ├── tastemakers/       # Food expert directory
│   ├── group-dinner/      # Group dining coordinator
│   └── settings/          # User settings
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── restaurant/       # Restaurant components
│   ├── lists/            # List management
│   ├── feed/             # Feed components
│   ├── modals/           # Modal dialogs
│   ├── tastemakers/      # Tastemaker features
│   └── navigation/       # Navigation components
├── lib/                  # Utilities and services
│   ├── hooks/            # React Query hooks
│   ├── mockDataService.ts # Mock backend service
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Key Features

### Implemented
- **Feed**: Social activity stream with restaurant discoveries
- **Lists**: Been/Want-to-try/Recommendations tracking
- **Search**: Restaurant and user search with filters
- **Leaderboard**: Friend rankings and achievements
- **Profile**: User stats and social connections
- **Tastemakers**: 13 NYC food expert profiles with articles
- **What to Order**: Smart menu recommendation engine
- **Group Dinner**: AI-powered group dining coordinator
- **Restaurant Details**: Comprehensive restaurant pages

## Data Layer

The app uses `MockDataService` ([lib/mockDataService.ts](lib/mockDataService.ts)) to simulate backend functionality. All data is mock data with simulated network delays.

React Query hooks in [lib/hooks/](lib/hooks/) provide caching and state management:
- `useRestaurants()` - Restaurant data
- `useUser()` - User profiles
- `useFeed()` - Activity feed
- `useLeaderboard()` - Rankings
- `useLists()` - User lists
- And many more...

## Styling

Uses Tailwind CSS with custom design tokens defined in:
- [tailwind.config.ts](tailwind.config.ts) - Tailwind configuration
- [app/globals.css](app/globals.css) - Global styles and CSS variables

shadcn/ui components in [components/ui/](components/ui/) provide the base UI layer.

## Deployment

The app is configured to deploy automatically to Vercel:
- Push to `main` branch triggers production deployment
- Pull requests create preview deployments
- Root directory is set to `beli-web/` in Vercel project settings

## Learn More

- See [../README.md](../README.md) for full project overview
- See [../CLAUDE.md](../CLAUDE.md) for development guide
- Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)

## License

This is a portfolio project by Victor Cox IV.
