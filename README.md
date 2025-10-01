# Beli App

A social restaurant discovery platform built with React Native and Expo that combines personal dining tracking, social networking, and gamified restaurant exploration.

## Why I Built This

This project started as a way to study building a front-end experience that I genuinely enjoyed using. As someone who uses restaurant discovery apps daily, I wanted to explore how I could enhance the features and interactions of an app that's part of my everyday routine—combining practical frontend development practice with thoughtful product improvements.

## Overview

Beli allows users to:
- Track restaurants they've visited
- Create want-to-try lists
- Share recommendations with friends
- Compete through rankings and achievements
- Discover new restaurants through social feeds

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State Management**: Zustand
- **UI Components**: Custom components with Expo Vector Icons

## Project Structure

```
beli-app/
├── beli-native/          # Main React Native application
│   ├── src/              # Source code
│   ├── assets/           # Images, fonts, and other assets
│   ├── App.tsx           # Main app component
│   └── package.json      # Dependencies and scripts
├── beli-images/          # Design assets and mockups
└── docs/                 # Project documentation
    ├── beli-app-requirements.md
    ├── beli-app-design-system.md
    └── beli-app-build-guide.md
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
git clone <repository-url>
cd beli-app
```

2. Navigate to the React Native app:
```bash
cd beli-native
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

## Available Scripts

In the `beli-native` directory:

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android simulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start on web browser

## Development

The app follows a bottom tab navigation structure with:
- **Feed**: Social feed and restaurant discoveries
- **Your Lists**: Personal restaurant collections
- **Search**: Restaurant and user search
- **Leaderboard**: Friend rankings and achievements
- **Profile**: User profile and settings

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Test thoroughly on both iOS and Android
4. Submit a pull request

## License

This project is private and proprietary.