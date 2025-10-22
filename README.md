# Beli App

A social restaurant discovery platform with native mobile and web applications that combines personal dining tracking, social networking, and gamified restaurant exploration.

## Why I Built This

This project started as a way to study building a front-end experience that I genuinely enjoyed using. As someone who uses restaurant discovery apps daily, I wanted to explore how I could enhance the features and interactions of an app that's part of my everyday routine—combining practical frontend development practice while improving the product.

## Overview

Beli allows users to:
- Track restaurants they've visited
- Create want-to-try lists
- Share recommendations with friends
- Compete through rankings and achievements
- Discover new restaurants through social feeds

## Tech Stack

### Mobile (beli-native/)
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State Management**: Zustand
- **UI Components**: Custom components with Expo Vector Icons

### Web (beli-web/)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand + React Query
- **Deployment**: Vercel

## Project Structure

This is a monorepo containing multiple applications:

```
beli-app/
├── beli-native/          # React Native mobile app (iOS/Android)
│   ├── src/              # Source code
│   ├── assets/           # Images, fonts, and other assets
│   ├── App.tsx           # Main app component
│   └── package.json      # Native dependencies
│
├── beli-web/             # Next.js web application
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and services
│   ├── types/            # TypeScript types
│   └── package.json      # Web dependencies
│
├── beli-images/          # Design assets and mockups
└── docs/                 # Project documentation
    ├── beli-app-requirements.md
    ├── beli-app-design-system.md
    ├── beli-app-build-guide.md
    └── beli-web-implementation-plan.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tor-iv/beli-app.git
cd beli-app
```

2a. **For Mobile App (React Native):**
```bash
cd beli-native
npm install
npm start
```

2b. **For Web App (Next.js):**
```bash
cd beli-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the web app in your browser.

## Available Scripts

### Mobile App (`beli-native/`)
- `npm start` - Start the Expo development server
- `npm run android` - Start on Android simulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start Expo web version

### Web App (`beli-web/`)
- `npm run dev` - Start Next.js development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Development

Both apps share the same core features and design system:
- **Feed**: Social feed and restaurant discoveries
- **Your Lists**: Personal restaurant collections
- **Search**: Restaurant and user search
- **Leaderboard**: Friend rankings and achievements
- **Profile**: User profile and settings

### Monorepo Workflow

Each app has independent dependencies:
```bash
# Install dependencies for native app
cd beli-native && npm install

# Install dependencies for web app
cd beli-web && npm install
```

Both apps share design tokens and data models but run independently.

## Deployments

- **Mobile:** Expo (iOS App Store, Google Play Store)
- **Web:** Vercel - Auto-deploys from `main` branch
  - Production: https://beli-web.vercel.app (after setup)
  - Preview deployments for all PRs

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Use commit prefixes: `mobile:`, `web:`, `shared:`, or `docs:`
4. Test thoroughly (native: iOS/Android, web: Chrome/Safari/Firefox)
5. Submit a pull request

## License

This project is private and proprietary.