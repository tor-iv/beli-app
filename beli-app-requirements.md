# Beli App - React Native Clone Requirements

## App Overview
A social restaurant discovery platform that combines personal dining tracking, social networking, and gamified restaurant exploration. Users can track restaurants they've visited, create want-to-try lists, share recommendations, and compete with friends through rankings and achievements.

## Core User Flow

### 1. Authentication & Onboarding
**Missing Screens Needed:**
- [ ] Login/Registration screen
- [ ] Onboarding flow (location permissions, interests setup)
- [ ] Profile setup (photo, bio, dietary restrictions)

### 2. Main Navigation Flow
**Bottom Tab Navigation:**
- Feed (Home)
- Your Lists
- Search
- Leaderboard
- Profile

## Detailed Screen Requirements

### 📱 Feed Screen (Home)
**Current Features Shown:**
- Search bar at top
- Action buttons: "Reserve now", "Recs Nearby", "Trending"
- Invite friends section
- Featured restaurant lists with images
- Social activity feed with user reviews and ratings
- Filter options

**React Native Requirements:**
- `FlatList` for infinite scroll feed
- Image carousel for featured lists
- Pull-to-refresh functionality
- Real-time activity updates
- Navigation to restaurant details

### 📝 Your Lists Screen
**Current Features Shown:**
- Tab navigation: Been | Want to Try | Recs | Playlists | More
- Filter options: City, Reserve, Open now, Cuisine
- Sortable restaurant list with ratings
- Distance and status indicators

**Additional Screens Needed:**
- [ ] Individual playlist view
- [ ] Create/Edit playlist screen
- [ ] Bulk edit restaurants screen

**React Native Requirements:**
- Tab view component
- Filterable/sortable lists
- Swipe-to-delete functionality
- Drag-and-drop reordering for playlists

### 🔍 Search Screen
**Current Features Shown:**
- Restaurant and member search tabs
- Location-based search
- Recent searches
- Suggested restaurants based on calendar
- Quick action buttons (Reserve, Recs, Trending)

**Additional Screens Needed:**
- [ ] Advanced search filters screen
- [ ] Map view for restaurant locations
- [ ] Search results list view

**React Native Requirements:**
- Search with debounced API calls
- Location services integration
- Map component (react-native-maps)
- Search history storage

### 🏆 Leaderboard Screen
**Current Features Shown:**
- User rankings with match percentages
- Filter by "All Members" and "All Cities"
- User avatars and visit counts

**Additional Screens Needed:**
- [ ] Detailed user comparison screen
- [ ] Local/city-specific leaderboards
- [ ] Achievement details screen

**React Native Requirements:**
- Ranked list component
- User profile navigation
- Real-time ranking updates

### 👤 Profile Screen
**Current Features Shown:**
- User stats (followers, following, rank)
- Restaurant list counts
- Achievement tracking (streak, goals)
- Recent activity with photos and ratings

**Additional Screens Needed:**
- [ ] Edit profile screen
- [ ] Followers/Following lists
- [ ] Achievement gallery
- [ ] Statistics dashboard

**React Native Requirements:**
- Image picker for profile photos
- Statistics visualization
- Social connections management

### ⚙️ Settings & Menu
**Current Features Shown:**
- Invites management
- School affiliation
- Reservations
- Goal setting
- Dietary restrictions
- Privacy settings

**Additional Screens Needed:**
- [ ] Notification preferences
- [ ] Privacy policy viewer
- [ ] Help/FAQ screen
- [ ] About screen

### 🍕 Restaurant Detail Screen
**Current Features Shown:**
- Restaurant info (name, rating, location)
- Action buttons (Website, Call, Directions)
- Multiple scores (Rec Score, Friend Score)
- Popular dishes with photos
- User reviews and ratings

**Additional Screens Needed:**
- [ ] Full menu view
- [ ] All reviews screen
- [ ] Photo gallery
- [ ] Make reservation screen
- [ ] Add to list modal

**React Native Requirements:**
- Image gallery component
- External links (maps, website, phone)
- Rating/review submission
- Social sharing

## Data Models

### User
```javascript
{
  id: string,
  username: string,
  displayName: string,
  profileImage: string,
  bio: string,
  stats: {
    followers: number,
    following: number,
    rank: number,
    beenCount: number,
    wantToTryCount: number,
    currentStreak: number
  },
  location: {
    city: string,
    state: string
  },
  dietaryRestrictions: string[],
  dislikedCuisines: string[],
  memberSince: Date
}
```

### Restaurant
```javascript
{
  id: string,
  name: string,
  cuisine: string[],
  location: {
    address: string,
    city: string,
    state: string,
    coordinates: { lat: number, lng: number }
  },
  rating: number,
  priceLevel: number, // 1-4 ($-$$$$)
  images: string[],
  hours: Object,
  phone: string,
  website: string,
  popularDishes: string[],
  tags: string[]
}
```

### UserRestaurantRelation
```javascript
{
  userId: string,
  restaurantId: string,
  status: 'been' | 'want_to_try' | 'recommended',
  rating?: number,
  notes?: string,
  photos?: string[],
  visitDate?: Date,
  createdAt: Date
}
```

### List/Playlist
```javascript
{
  id: string,
  userId: string,
  name: string,
  description: string,
  restaurants: string[], // restaurant IDs
  isPublic: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Technical Requirements

### React Native Libraries Needed
- **Navigation:** `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`
- **UI Components:** `react-native-elements` or `native-base`
- **Maps:** `react-native-maps`
- **Image Handling:** `react-native-image-picker`, `react-native-fast-image`
- **Location:** `@react-native-community/geolocation`
- **Storage:** `@react-native-async-storage/async-storage`
- **HTTP Client:** `axios`
- **State Management:** `@reduxjs/toolkit` or `zustand`
- **Social Features:** `react-native-share`

### API Endpoints Structure
```
POST /auth/login
POST /auth/register
GET /users/profile
GET /users/:id/stats
GET /restaurants/search
GET /restaurants/:id
POST /restaurants/:id/visit
GET /users/:id/lists
POST /lists
GET /leaderboard
GET /feed
POST /reviews
```

### Mock Data Requirements
- 100+ restaurants across multiple cities
- 20+ users with realistic stats
- Various cuisine types and price levels
- Sample reviews and ratings
- Restaurant photos and popular dishes
- Featured lists (Top 10 NYC Spanish, etc.)

## Missing Screens to Design

### High Priority
1. **Authentication Flow** - Login/Register/Onboarding
2. **Restaurant Detail** - Full restaurant profile with all info
3. **Map View** - Location-based restaurant discovery
4. **Make Reservation** - Integration with reservation systems
5. **Add Review** - Rating and review submission flow

### Medium Priority
6. **User Profile (Other Users)** - View other user profiles
7. **Advanced Search** - Detailed search filters
8. **Notifications** - Activity and recommendation notifications
9. **Photo Upload** - Add photos to restaurants/reviews
10. **Settings Detail** - Individual setting screens

### Nice to Have
11. **Social Feed** - Follow friends and see their activity
12. **Messaging** - Direct messages between users
13. **Group Lists** - Collaborative restaurant lists
14. **Check-in** - Real-time location check-ins
15. **Achievement System** - Detailed badges and rewards

## Development Phases

### Phase 1: Core Functionality
- Authentication
- Restaurant browsing and search
- Personal lists (Been, Want to Try)
- Basic profile

### Phase 2: Social Features
- User following/followers
- Reviews and ratings
- Leaderboard
- Activity feed

### Phase 3: Advanced Features
- Reservations
- Advanced search and filters
- Achievements and gamification
- Social sharing

### Phase 4: Polish
- Push notifications
- Offline support
- Performance optimization
- Advanced UI animations