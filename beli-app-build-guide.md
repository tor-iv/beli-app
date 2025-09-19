# Beli App React Native - Complete Build Guide

## Pre-Build Cleanup & Environment Setup

### Step 1: Clean NPM/Node Environment
```bash
# Clear npm cache
npm cache clean --force

# Remove any existing node_modules in current directory
rm -rf node_modules package-lock.json

# Check for global Expo CLI and remove old versions
npm list -g expo-cli
npm uninstall -g expo-cli  # Old CLI is deprecated

# Install latest Expo tools
npm install -g expo@latest eas-cli@latest

# Verify installations
node --version  # Should be 18.x or higher
npm --version   # Should be 8.x or higher
expo --version
```

### Step 2: System Dependencies Check
```bash
# For macOS - ensure Xcode and simulators are ready
xcode-select --version
xcrun simctl list devices

# For all platforms - check Java for Android
java --version  # Should be JDK 17 for React Native 0.73+

# Check if Watchman is installed (recommended for macOS)
watchman --version || brew install watchman
```

## Project Initialization

### Step 3: Create New Expo Project with TypeScript
```bash
# Navigate to parent directory (not inside beli-app)
cd ~/
mkdir beli-native && cd beli-native

# Create new Expo project with TypeScript template
npx create-expo-app . --template blank-typescript

# Initialize git repository
git init
git add .
git commit -m "Initial Expo TypeScript project setup"

# Verify project structure
ls -la
```

🔄 **COMMIT CHECKPOINT 1**: Initial project setup complete

### Step 4: Proper Expo/React Native File Structure
```
beli-native/
├── app.json                    # Expo configuration
├── App.tsx                      # Entry point
├── babel.config.js              # Babel configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── .gitignore
├── assets/                      # Images, fonts, etc.
│   ├── images/
│   │   ├── restaurants/         # Mock restaurant images
│   │   └── avatars/            # User avatars
│   ├── fonts/
│   └── icon.png                # App icon
├── src/                         # All source code
│   ├── navigation/              # Navigation structure
│   │   ├── index.tsx
│   │   ├── BottomTabNavigator.tsx
│   │   ├── types.tsx           # Navigation types
│   │   └── linking.ts          # Deep linking config
│   ├── screens/                 # Screen components
│   │   ├── Feed/
│   │   │   ├── FeedScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── FeedCard.tsx
│   │   │   │   └── StoriesBar.tsx
│   │   │   └── styles.ts
│   │   ├── Lists/
│   │   │   ├── ListsScreen.tsx
│   │   │   ├── BeenTab.tsx
│   │   │   ├── WantToTryTab.tsx
│   │   │   └── styles.ts
│   │   ├── Search/
│   │   │   ├── SearchScreen.tsx
│   │   │   ├── RestaurantSearch.tsx
│   │   │   ├── MemberSearch.tsx
│   │   │   └── styles.ts
│   │   ├── Leaderboard/
│   │   │   ├── LeaderboardScreen.tsx
│   │   │   └── styles.ts
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── components/
│   │   │   └── styles.ts
│   │   └── RestaurantDetail/
│   │       ├── RestaurantDetailScreen.tsx
│   │       └── styles.ts
│   ├── components/              # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── RatingBubble.tsx
│   │   ├── restaurant/
│   │   │   ├── RestaurantCard.tsx
│   │   │   ├── RestaurantListItem.tsx
│   │   │   └── FilterPills.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── SettingsMenu.tsx
│   ├── data/                   # Mock data
│   │   ├── mock/
│   │   │   ├── restaurants.ts
│   │   │   ├── users.ts
│   │   │   ├── reviews.ts
│   │   │   └── activity.ts
│   │   └── generators/         # Data generation utilities
│   │       └── index.ts
│   ├── services/               # API/Data services
│   │   ├── api.ts
│   │   └── storage.ts          # AsyncStorage wrapper
│   ├── store/                  # State management
│   │   ├── index.ts
│   │   ├── userSlice.ts
│   │   └── restaurantSlice.ts
│   ├── types/                  # TypeScript definitions
│   │   ├── index.ts
│   │   ├── restaurant.ts
│   │   ├── user.ts
│   │   └── activity.ts
│   ├── utils/                  # Helper functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── formatters.ts
│   └── theme/                  # Styling
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
└── __tests__/                  # Tests
    └── App.test.tsx
```

## Dependencies Installation

### Step 5: Install Core Navigation Dependencies
```bash
# React Navigation core
npm install @react-navigation/native@^6.1.0
npm install @react-navigation/bottom-tabs@^6.5.0
npm install @react-navigation/stack@^6.3.0
npm install @react-navigation/native-stack@^6.9.0

# Required peer dependencies for React Navigation
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

### Step 6: Install UI & Component Libraries
```bash
# UI Components (choose one approach)
# Option A: React Native Elements (simpler)
npm install react-native-elements@^3.4.3 react-native-vector-icons@^10.0.0
npx expo install react-native-safe-area-context

# Option B: Native Base (more components)
# npm install native-base@^3.4.0

# For better performance with images
npx expo install expo-image

# For icons (Expo compatible)
npm install @expo/vector-icons
```

### Step 7: Install Utility Libraries
```bash
# State Management
npm install zustand@^4.4.0

# Storage
npx expo install @react-native-async-storage/async-storage

# Date handling
npm install date-fns@^2.30.0

# Form handling (if needed)
npm install react-hook-form@^7.47.0

# Animation
npm install react-native-reanimated@~3.6.0
npx expo install react-native-gesture-handler
```

### Step 8: Install Development Dependencies
```bash
# TypeScript types
npm install --save-dev @types/react@~18.2.0 @types/react-native@~0.72.0

# Linting and formatting
npm install --save-dev eslint@^8.50.0 prettier@^3.0.0
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev eslint-config-expo
```

## Configuration Files

### Step 9: Update app.json for Expo
```json
{
  "expo": {
    "name": "Beli Clone",
    "slug": "beli-clone",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#00A676"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.beliclone"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#00A676"
      },
      "package": "com.yourname.beliclone"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### Step 10: Configure TypeScript (tsconfig.json)
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@navigation/*": ["src/navigation/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@data/*": ["src/data/*"],
      "@theme/*": ["src/theme/*"]
    }
  }
}
```

### Step 11: Configure Babel for Path Aliases (babel.config.js)
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
            '@types': './src/types',
            '@data': './src/data',
            '@theme': './src/theme'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
```

### Step 12: Install Module Resolver for Babel
```bash
npm install --save-dev babel-plugin-module-resolver

# Test that everything installs correctly
npm ls
git add .
git commit -m "Configure path aliases and babel module resolver"
```

🔄 **COMMIT CHECKPOINT 2**: All dependencies and configuration complete

## Verification Steps

### Step 13: Verify All Dependencies are Compatible
```bash
# Check for peer dependency warnings
npm ls

# Run Expo Doctor to check for issues
npx expo-doctor

# Check that all packages are Expo-compatible
npx expo install --check
```

### Step 14: Test Basic Setup
```bash
# Start Expo development server
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app on physical device

# Once verified working, commit the verification
git add .
git commit -m "Verify working Expo setup - app runs successfully"
```

🔄 **COMMIT CHECKPOINT 3**: Environment verified and working

## Mock Data Setup

### Step 15: Create Mock Data Structure
```typescript
// src/data/mock/restaurants.ts
export const mockRestaurants = [
  {
    id: '1',
    name: 'Carbone',
    cuisine: ['Italian'],
    priceRange: '$$$',
    location: {
      address: '181 Thompson St',
      city: 'New York',
      state: 'NY',
      neighborhood: 'Greenwich Village',
      coordinates: { lat: 40.7282, lng: -74.0012 }
    },
    rating: 9.2,
    images: [require('@/assets/images/restaurants/carbone.jpg')],
    distance: 0.8
  },
  // Add 50+ more restaurants...
];
```

## Implementation Order with Commit Checkpoints

### Step 16: Development Sequence

#### **Phase 1: Foundation & Navigation**
```bash
# Create basic navigation structure
# 1. Setup bottom tab navigator
# 2. Create placeholder screens
# 3. Test navigation flow

git add .
git commit -m "Add bottom tab navigation with placeholder screens"
```
🔄 **COMMIT CHECKPOINT 4**: Navigation foundation complete

#### **Phase 2: Core Data Architecture**
```bash
# Create TypeScript interfaces and mock data
# 1. Define all TypeScript types (User, Restaurant, etc.)
# 2. Create mock data generators
# 3. Setup Zustand store structure

git add .
git commit -m "Add TypeScript types and mock data architecture"
```
🔄 **COMMIT CHECKPOINT 5**: Data layer complete

#### **Phase 3: Theme & Design System**
```bash
# Implement design system
# 1. Create theme constants (colors, typography, spacing)
# 2. Build reusable components (Button, Card, Avatar, RatingBubble)
# 3. Test component library

git add .
git commit -m "Implement design system and reusable components"
```
🔄 **COMMIT CHECKPOINT 6**: Design system ready

#### **Phase 4: Feed Screen Implementation**
```bash
# Build complete Feed screen
# 1. Header with search bar
# 2. Action buttons (Reserve, Recs, Trending)
# 3. Featured lists carousel
# 4. Activity feed with restaurant cards

git add .
git commit -m "Complete Feed screen with activity cards and featured lists"
```
🔄 **COMMIT CHECKPOINT 7**: Feed screen functional

#### **Phase 5: Lists Screen Implementation**
```bash
# Build Your Lists screen
# 1. Tab navigation (Been, Want to Try, Recs, Playlists)
# 2. Filter pills and sorting
# 3. Restaurant list items with ratings
# 4. Add/remove functionality

git add .
git commit -m "Complete Lists screen with tabs, filters, and restaurant management"
```
🔄 **COMMIT CHECKPOINT 8**: Lists screen functional

#### **Phase 6: Search Implementation**
```bash
# Build Search functionality
# 1. Search bar with real-time filtering
# 2. Restaurant/Members toggle
# 3. Recent searches section
# 4. Location-based filtering

git add .
git commit -m "Add search functionality with filters and recent searches"
```
🔄 **COMMIT CHECKPOINT 9**: Search complete

#### **Phase 7: Profile & Leaderboard**
```bash
# Build Profile and Leaderboard screens
# 1. User profile with stats and achievements
# 2. Leaderboard with rankings and match percentages
# 3. Settings menu modal

git add .
git commit -m "Add Profile screen and Leaderboard with user rankings"
```
🔄 **COMMIT CHECKPOINT 10**: Social features complete

#### **Phase 8: Restaurant Detail**
```bash
# Build Restaurant Detail screen
# 1. Restaurant header with image and rating
# 2. Restaurant info and action buttons
# 3. Popular dishes section
# 4. Reviews and ratings display

git add .
git commit -m "Add detailed restaurant view with reviews and actions"
```
🔄 **COMMIT CHECKPOINT 11**: Restaurant details complete

#### **Phase 9: Settings & Menu**
```bash
# Build Settings and Menu system
# 1. Hamburger menu with all options
# 2. Individual settings screens
# 3. Navigation between settings

git add .
git commit -m "Add settings menu and configuration screens"
```
🔄 **COMMIT CHECKPOINT 12**: Settings complete

#### **Phase 10: Polish & Performance**
```bash
# Final optimizations
# 1. Smooth animations and transitions
# 2. Loading states and error handling
# 3. Performance optimizations
# 4. Final bug fixes

git add .
git commit -m "Final polish: animations, loading states, and performance optimizations"
```
🔄 **COMMIT CHECKPOINT 13**: Production ready

#### **Phase 11: Testing & Documentation**
```bash
# Final testing and documentation
# 1. Test on both iOS and Android
# 2. Update README with setup instructions
# 3. Document any known issues

git add .
git commit -m "Add testing documentation and final README"
```
🔄 **COMMIT CHECKPOINT 14**: Complete and documented

## Common Issues & Solutions

### Dependency Conflicts
```bash
# If you encounter version conflicts
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear
```

### iOS Simulator Issues
```bash
# Reset iOS Simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

### Android Emulator Issues
```bash
# Wipe Android emulator data
cd ~/Library/Android/sdk/emulator
./emulator -avd <AVD_NAME> -wipe-data
```

## Testing Checklist

### Before Starting Development
- [ ] Expo starts without errors
- [ ] Can run on iOS Simulator
- [ ] Can run on Android Emulator
- [ ] TypeScript compilation works
- [ ] Path aliases resolve correctly
- [ ] All packages are installed without peer dependency warnings

### After Each Major Component
- [ ] No TypeScript errors
- [ ] Component renders correctly
- [ ] Navigation works
- [ ] Data flows properly
- [ ] Performance is smooth (60 FPS)

## Performance Optimization Notes

1. **Use FlatList for long lists** - Built-in virtualization
2. **Implement lazy loading** - Use React.lazy() for screens
3. **Optimize images** - Use expo-image for better caching
4. **Minimize re-renders** - Use React.memo and useMemo
5. **Enable Hermes** - For Android performance

## Git Commit Strategy Summary

### 🔄 Complete Checkpoint List
1. **Initial project setup** - Expo + TypeScript + Git init
2. **Dependencies configured** - All packages and path aliases
3. **Environment verified** - App runs on simulators
4. **Navigation foundation** - Bottom tabs with placeholder screens
5. **Data layer complete** - Types, mock data, Zustand store
6. **Design system ready** - Theme constants and reusable components
7. **Feed screen functional** - Activity feed with restaurant cards
8. **Lists screen functional** - Tabs, filters, restaurant management
9. **Search complete** - Search with filters and recent searches
10. **Social features complete** - Profile and Leaderboard screens
11. **Restaurant details complete** - Full restaurant detail view
12. **Settings complete** - Menu system and configuration
13. **Production ready** - Polish, animations, performance
14. **Complete and documented** - Testing docs and README

### Commit Message Format
```bash
# Use clear, descriptive commit messages
git commit -m "Add [feature]: [specific functionality]"

# Examples:
git commit -m "Add navigation: bottom tab navigator with 5 screens"
git commit -m "Add components: rating bubble and restaurant card"
git commit -m "Add screen: complete Feed with activity cards"
```

### Rollback Strategy
```bash
# If a phase has issues, rollback to previous checkpoint
git log --oneline  # See commit history
git reset --hard <commit-hash>  # Rollback to specific checkpoint
git reset --hard HEAD~1  # Rollback to previous commit
```

## Next Steps After Setup

Once the environment is ready and verified:
1. **Follow commit checkpoints** - Commit after each major milestone
2. **Test frequently** - Run on both iOS and Android after each checkpoint
3. **Build incrementally** - Complete one full feature before moving to next
4. **Document issues** - Note any problems in commit messages
5. **Performance check** - Monitor app performance at each checkpoint