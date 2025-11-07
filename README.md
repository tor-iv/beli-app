# Beli Portfolio Demo

> A full-stack restaurant discovery platform built to showcase my passion for food tech and demonstrate my ability to contribute from day one.

**Built by Victor Cox IV**
vcox484@gmail.com | (651) 955-9920 | New York, NY
[LinkedIn](https://www.linkedin.com/in/tor-iv/) • [GitHub](https://github.com/tor-iv) • [Portfolio](https://tor-iv.com)

---

## The Demo Experience

This repository showcases three major features I built for Beli, demonstrating full-stack proficiency across mobile and web platforms. Each feature solves real user pain points in restaurant discovery and group dining coordination.

## Features I Built

### 1. Tastemakers
**Status**: Fully Implemented (Web)
**What it does**: Curated food expert profiles with specialized content and engagement tracking

**Key Highlights**:
- 13 NYC food expert profiles with diverse specialties (Pizza, Fine Dining, Vegan, Ramen, etc.)
- Comprehensive badge system (11 types) with dynamic coloring
- 12 featured articles with rich content
- Magazine-style layout with hero posts
- Full Next.js App Router implementation with dynamic routes
- Engagement metrics (followers, likes, bookmarks, views)

**Tech Stack**: Next.js 16, TypeScript, App Router, shadcn/ui, Tailwind CSS

**Files**: [`beli-web/app/tastemakers/`](beli-web/app/tastemakers/)

---

### 2. Group Dinner / Eat Now
**Status**: Fully Implemented (Mobile)
**What it does**: AI-powered group dining recommendations with swipe interface and intelligent matching

**Key Highlights**:
- Tinder-style restaurant swiper with gesture controls
- 6-factor match algorithm weighing cuisine, price, ratings, distance, dietary needs, party size
- Participant search and selection
- Save up to 3 restaurants, then choose final selection
- Match breakdown showing why restaurants work for your group
- 750+ line implementation with complex state management
- Comprehensive documentation (750-line spec with algorithm details)

**Tech Stack**: React Native, Expo, TypeScript, React Navigation, Custom Animations

**Algorithm Factors**:
1. Cuisine preference compatibility
2. Price range alignment
3. Restaurant ratings
4. Distance optimization
5. Dietary restriction accommodation
6. Party size support

**Files**: [`beli-native/src/screens/GroupDinnerScreen.tsx`](beli-native/src/screens/GroupDinnerScreen.tsx), [`beli-native/src/components/group-dinner/`](beli-native/src/components/group-dinner/)

---

### 3. What to Order
**Status**: Fully Implemented (Mobile & Web)
**What it does**: Smart menu recommendation engine based on party size and hunger level

**Key Highlights**:
- Hunger-based algorithm with point system
- Multi-step flow: Party size selection → Hunger level → AI-generated suggestions
- Smart portion sizing (Small/Medium/Large/Shareable)
- Intelligent item selection avoiding duplicates
- Share functionality with platform-specific APIs (Native Share vs Web Clipboard)
- 750+ line implementation on mobile with full modal UI
- Comprehensive 350-line feature documentation
- Animated shuffle button with smooth transitions

**Algorithm Design**:
```
Base Hunger Points = Party Size × 10 × Hunger Multiplier

Hunger Levels:
• Light: 0.8x multiplier
• Moderate: 1.2x multiplier
• Very Hungry: 1.8x multiplier

Portion Points: Small (5) | Medium (10) | Large (15) | Shareable (12)

Selection Strategy:
1. Calculate total points needed
2. Prioritize shareable items for groups
3. Mix portion sizes intelligently
4. Increase quantities instead of duplicates
5. Respect dietary restrictions
6. Balance price points
```

**Tech Stack**: React Native, Next.js, TypeScript, Platform APIs (Share/Clipboard)

**Files**:
- Mobile: [`beli-native/src/components/modals/WhatToOrderModal.tsx`](beli-native/src/components/modals/WhatToOrderModal.tsx)
- Web: [`beli-web/components/modals/what-to-order-modal.tsx`](beli-web/components/modals/what-to-order-modal.tsx)

**Documentation**: [docs/what-to-order-feature.md](docs/what-to-order-feature.md)

---

## Why I Built This

As someone who uses restaurant discovery apps daily and genuinely loves food culture, I wanted to demonstrate three things:

1. **Initiative**: I built features without being asked because I saw opportunities to enhance the user experience
2. **Product Thinking**: Each feature solves a real pain point I've experienced (finding credible recommendations, coordinating group dinners, menu decision paralysis)
3. **Technical Execution**: Production-quality code with comprehensive TypeScript types, error handling, documentation, and thoughtful UX

This wasn't just a coding exercise—it was about deeply understanding your product, tech stack, and users.

## What I Learned

- **Full-Stack Mobile Development**: Expo SDK 54, React Navigation 7, complex modal flows, gesture handling
- **Modern Web Architecture**: Next.js 15 App Router, server/client components, dynamic routing
- **Algorithm Design**: Weighted scoring systems, hunger-based recommendation logic, match algorithms
- **Design System Implementation**: Consistent theming, component libraries (shadcn/ui), responsive design
- **Platform-Specific APIs**: Native Share, Clipboard, Animation libraries
- **Documentation Culture**: Writing comprehensive specs and technical guides

## Additional Features Designed

Beyond the three implemented features, I've created comprehensive specifications for **four additional major features** (see [new-features-spec.md](new-features-spec.md)):

### Lucky Spin
**Playful random restaurant picker** - Slot machine-style UI with smart constraint system (distance, rating, price, cuisine, open now). Solves decision paralysis with fun randomness. 40 hours estimated.

### Food Crawl
**Multi-restaurant adventures** - Curated routes like "NYC Pizza Pilgrimage" (4 stops) or "West Village Perfect Saturday" (5 stops). Group coordination, real-time navigation, crawl creation tools. 120 hours estimated.

### Scavenger Hunt
**Competitive dining challenges** - Time-limited hunts like "Summer Taco Tour" (12 objectives) or "NYC Pizza Master" (15 legendary spots). Badge system, leaderboards, sponsored prizes. 160 hours estimated.

### New Openings
**Recently opened restaurant discovery** - Time-based filtering, early adopter badges, notification system. 40 hours estimated.

**Total Specs Written**: 2,500+ lines covering data models, UI designs, user flows, algorithms, and implementation phases for ~360 hours of additional development work.

---

## By The Numbers

### Implemented Features
- **~2,500+ lines** of feature code written
- **3 major features** implemented end-to-end
- **13 tastemaker profiles** with full data modeling
- **12 featured articles** with content structure
- **750+ lines** for What to Order modal
- **750+ lines** for Group Dinner screen
- **11 badge types** in tastemaker system
- **6-factor algorithm** for group matching

### Documentation & Planning
- **1,100+ lines** of implementation documentation
- **2,500+ lines** of additional feature specs
- **4 major features** fully designed and ready to build
- **~360 hours** of spec'd development work

## Project Structure

This is a monorepo containing native mobile and web applications that share design systems and data models:

```
beli-app/
├── beli-native/          # React Native mobile app (iOS/Android)
│   ├── src/
│   │   ├── screens/      # GroupDinnerScreen and others
│   │   ├── components/   # Including group-dinner/, WhatToOrderModal
│   │   ├── data/mock/    # Mock data including tastemakers
│   │   └── types.ts      # Shared TypeScript types
│   └── package.json
│
├── beli-web/             # Next.js web application
│   ├── app/
│   │   ├── tastemakers/  # Tastemaker feature pages
│   │   ├── feed/         # Social feed
│   │   └── ...           # Other routes
│   ├── components/
│   │   ├── modals/       # WhatToOrderModal
│   │   ├── tastemakers/  # Tastemaker components
│   │   └── ...
│   ├── data/mock/        # Mock data services
│   └── package.json
│
├── docs/                 # Comprehensive documentation
│   ├── what-to-order-feature.md
│   └── ...
│
├── DEMO-PLAN.md         # Complete demo implementation plan
├── group-dinner.md      # Group dinner feature spec
└── README.md            # This file
```

## Core Platform Features

Beyond the three custom features above, the platform includes:
- **Feed**: Social feed with restaurant discoveries and friend activity
- **Your Lists**: Been/Want-to-try/Recommendations tracking
- **Search**: Restaurant and user search with filters
- **Leaderboard**: Friend rankings and achievements
- **Profile**: User stats and social connections

All built with a consistent modern premium casual design system.

## Tech Stack

### Mobile (beli-native/)
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State Management**: Zustand
- **UI Components**: Custom components with Expo Vector Icons

### Web (beli-web/)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand + React Query (TanStack Query)
- **Deployment**: Vercel (auto-deploys from main branch)

## Getting Started

Want to explore the code and run it locally? Here's how:

### Prerequisites

- Node.js v18+
- npm or yarn
- Expo CLI (for mobile)
- iOS Simulator or Android Studio (for mobile testing)

### Quick Start

**Clone the repository**:
```bash
git clone https://github.com/tor-iv/beli-app.git
cd beli-app
```

**Option 1: Run Web App** (See Tastemakers & What to Order features)
```bash
cd beli-web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser

**Option 2: Run Mobile App** (See all three features)
```bash
cd beli-native
npm install
npm start
```
Press `i` for iOS simulator or `a` for Android emulator

### Feature Navigation Guide

**To see Tastemakers** (Web):
```bash
cd beli-web && npm run dev
# Navigate to: http://localhost:3000/tastemakers
```

**To see Group Dinner** (Mobile only):
```bash
cd beli-native && npm start
# In the app: Navigate to "Eat Now" tab
```

**To see What to Order** (Both platforms):
```bash
# Web: http://localhost:3000/restaurant/[any-restaurant] → Click "What to Order"
# Mobile: Open any restaurant → Tap "What to Order" button
```

## Documentation

Each feature has comprehensive documentation showing my planning and technical thinking:

### Implemented Features
- **[docs/what-to-order-feature.md](docs/what-to-order-feature.md)** - 350-line What to Order comprehensive guide
- **[CLAUDE.md](CLAUDE.md)** - Development guide and architecture overview

### Planned Features
- **[new-features-spec.md](new-features-spec.md)** - 2,500-line specification for 4 additional features:
  - Lucky Spin (playful randomizer)
  - Food Crawl (multi-stop experiences)
  - Scavenger Hunt (competitive challenges)
  - New Openings (discovery feature)
  - Complete with data models, UI mockups, user flows, and implementation phases

## What's Next?

Potential enhancements include:
- Backend integration with real API
- Authentication and user management
- Push notifications and real-time updates
- Photo upload functionality
- Payment and reservation integration

## Let's Connect

I'd love to discuss how these features could evolve and what else I could build for Beli:

**Victor Cox IV**
- Email: vcox484@gmail.com
- Phone: (651) 955-9920
- LinkedIn: [linkedin.com/in/tor-iv](https://linkedin.com/in/tor-iv)
- GitHub: [github.com/tor-iv](https://github.com/tor-iv)
- Portfolio: [tor-iv.com](https://tor-iv.com)
- beli username: **tor_iv**

## Development Commands Reference

### Mobile App (`beli-native/`)
```bash
npm start              # Start Expo dev server
npm run ios            # iOS simulator
npm run android        # Android emulator
npx tsc                # TypeScript type checking
```

### Web App (`beli-web/`)
```bash
npm run dev            # Development server (http://localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript type checking
```

---

**Built with passion for food tech and attention to detail**