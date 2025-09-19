# Beli App Development Plan

## Project Status
- ✅ Initial project setup complete
- ✅ React Native Expo app initialized in `beli-native` directory
- ✅ Basic navigation structure with 5 main screens
- ✅ Initial git commit completed

## Development Roadmap

### Phase 1: Mock Data Layer (Priority: High)
**Goal**: Create comprehensive mock data to simulate real app functionality

#### Tasks:
- [ ] Create mock restaurants dataset (50+ restaurants)
  - Various cuisines and price ranges
  - NYC-focused with multiple neighborhoods
  - Include images, ratings, popular dishes
- [ ] Generate mock users with realistic stats
  - User profiles with follower counts
  - Restaurant visit history
  - Achievement data
- [ ] Create sample reviews and ratings
  - User-generated content
  - Photos and detailed reviews
  - Rating distributions
- [ ] Set up mock activity feed data
  - Friend check-ins
  - New reviews
  - Trending restaurants

**Location**: `beli-native/src/data/mock/`

### Phase 2: Design System Implementation (Priority: High)
**Goal**: Build consistent, reusable UI components matching Beli's design

#### Tasks:
- [ ] Finalize theme constants
  - Colors (primary green #00A676, etc.)
  - Typography scales
  - Spacing system
  - Shadow styles
- [ ] Build base UI components
  - Button variants
  - Card components
  - Avatar with online status
  - Rating bubbles (1-10 scale)
- [ ] Create restaurant-specific components
  - RestaurantCard (for feed)
  - RestaurantListItem (for lists)
  - FilterPills
  - PriceRange indicator
- [ ] Implement layout components
  - Custom headers
  - Tab bars
  - Settings menu

**Location**: `beli-native/src/components/`

### Phase 3: Core Screen Development (Priority: High)
**Goal**: Build fully functional main screens with mock data

#### 3.1 Feed Screen
- [ ] Header with search bar and settings icon
- [ ] Action buttons row (Reserve now, Recs Nearby, Trending)
- [ ] Invite friends section
- [ ] Featured restaurant lists carousel
- [ ] Activity feed with infinite scroll
- [ ] Pull-to-refresh functionality

#### 3.2 Lists Screen
- [ ] Tab navigation (Been, Want to Try, Recs, Playlists, More)
- [ ] Filter options (City, Reserve, Open now, Cuisine)
- [ ] Sort functionality
- [ ] Restaurant list with ratings and distance
- [ ] Swipe actions for list management
- [ ] Add/Remove restaurant functionality

#### 3.3 Search Screen
- [ ] Search bar with real-time filtering
- [ ] Toggle between Restaurants and Members
- [ ] Recent searches section
- [ ] Location-based suggestions
- [ ] Quick action buttons
- [ ] Search results list

#### 3.4 Profile Screen
- [ ] User header with stats (followers, following, rank)
- [ ] Restaurant counts (Been, Want to Try)
- [ ] Achievement section (streak, monthly goal)
- [ ] Recent activity grid with photos
- [ ] Settings menu access

#### 3.5 Leaderboard Screen
- [ ] User rankings with match percentages
- [ ] Filter by "All Members" and "All Cities"
- [ ] Friend avatars and visit counts
- [ ] Tap to view user profiles

### Phase 4: Navigation Stack & Detail Screens (Priority: Medium)
**Goal**: Add depth to the app with detailed views and navigation

#### Tasks:
- [ ] Restaurant Detail Screen
  - Restaurant header with hero image
  - Info section (cuisine, price, hours)
  - Action buttons (Website, Call, Directions)
  - Scores display (Rec Score, Friend Score)
  - Popular dishes section
  - Reviews and ratings
  - Add to list functionality
- [ ] Settings/Menu Modal
  - All menu options from hamburger menu
  - Individual settings screens
  - Dietary restrictions
  - Goal setting
- [ ] User Profile Views (for other users)
  - Similar to profile but for viewing others
  - Follow/unfollow functionality
  - Compare restaurants feature

### Phase 5: State Management (Priority: Medium)
**Goal**: Implement proper state management with Zustand

#### Tasks:
- [ ] User store
  - Current user data
  - Authentication state (mock)
  - Preferences
- [ ] Restaurant store
  - Restaurant data cache
  - Search results
  - Filter states
- [ ] Lists store
  - User's restaurant lists
  - Been/Want to Try management
  - Custom playlists
- [ ] Activity store
  - Feed data
  - Notifications (mock)
  - Recent searches

**Location**: `beli-native/src/store/`

### Phase 6: Polish & Optimization (Priority: Low)
**Goal**: Enhance user experience with animations and performance

#### Tasks:
- [ ] Add loading states and skeletons
- [ ] Implement smooth transitions
- [ ] Add pull-to-refresh on all screens
- [ ] Optimize image loading with lazy loading
- [ ] Add haptic feedback for interactions
- [ ] Implement proper error states
- [ ] Add empty states for lists

### Phase 7: Testing & Documentation (Priority: Low)
**Goal**: Ensure app quality and maintainability

#### Tasks:
- [ ] Test on multiple iOS devices/simulators
- [ ] Test on multiple Android devices/emulators
- [ ] Document component API
- [ ] Create setup guide for new developers
- [ ] List known issues and limitations
- [ ] Performance profiling

## Technical Considerations

### Performance Targets
- 60 FPS scrolling performance
- < 2 second initial load time
- Smooth navigation transitions
- Efficient memory usage with image caching

### Key Libraries Already Installed
- `@react-navigation/*` - Navigation
- `@expo/vector-icons` - Icons
- `zustand` - State management
- `react-native-reanimated` - Animations
- `expo-image` - Optimized image component

### Development Guidelines
1. Follow existing code structure and patterns
2. Use TypeScript for all new code
3. Create reusable components where possible
4. Mock all API calls initially
5. Test on both platforms regularly
6. Commit after each completed phase

## Success Metrics for MVP
- [ ] All 5 main screens functional
- [ ] Restaurant detail view working
- [ ] Search and filtering operational
- [ ] Lists management working
- [ ] Smooth performance on both platforms
- [ ] No critical bugs or crashes

## Future Enhancements (Post-MVP)
- Real backend integration
- Push notifications
- Map view for restaurant discovery
- Social features (messaging, groups)
- Reservation integration
- Photo upload functionality
- Advanced filtering and recommendations
- Gamification elements (badges, achievements)