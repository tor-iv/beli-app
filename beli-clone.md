# Beli Clone - Restaurant Tracking App with Group Dining Features

Build a mobile-first web app that clones Beli's core functionality with enhanced group dining and date planning features.

## Core Architecture
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- Framer Motion for animations
- Mobile-first responsive design (max-width: 428px for mobile view)

## Navigation Structure

### Bottom Tab Bar (Fixed)
5 tabs at bottom, always visible:
1. **Feed** (document icon) - Friend activity and your recent activity
2. **Your Lists** (three lines icon) - Your restaurant lists
3. **Add** (+ icon, center, in circle) - Add new restaurant
4. **Search** (magnifying glass in diamond) - Discover restaurants  
5. **Leaderboard** (trophy icon) - Rankings and competitions
6. **Profile** (user avatar, circular) - Your profile and stats

### Top Bar Structure
- Left: User name (e.g., "Tor Cox")
- Right: Hamburger menu (three lines) with dropdown containing:
  - You have X invites left!
  - Add Your School
  - Settings
  - Your Reservations
  - Your 2025 Goal
  - FAQ
  - Home City: [City, State]
  - Dietary Restrictions
  - Disliked Cuisines
  - Import Existing List
  - Change Password
  - Privacy Policy
  - Log Out
  - **Group Dinner Planner** (new feature - add here)
  - **Date Night Mode** (new feature - add here)

## Screen Specifications

### 1. Feed Screen
**Top Section:**
- Search bar at very top
- Horizontal scrollable stories (circle avatars with gradient borders)
- "Your Story" as first item with + icon

**Main Feed:**
- Restaurant cards showing:
  - Large food image (16:9 ratio)
  - Restaurant name, cuisine type, price range ($$), distance
  - Friend's rating and comment
  - Action buttons: "Want to Try", bookmark, share
  - Friend who posted (small avatar + name)
  - Timestamp

**Data Structure:**
```typescript
interface FeedItem {
  id: string;
  restaurant: Restaurant;
  user: User;
  rating: number; // 0-10 scale
  comment: string;
  photos: string[];
  tags: string[];
  timestamp: Date;
}
```

### 2. Your Lists Screen
**Navigation Tabs at Top:**
- Been
- Want to Try  
- Recs
- Playlists
- More ▼

**Filter Pills (horizontal scroll):**
- Filter icon
- City ▼
- Reserve
- Open now
- Cuisine ▼

**Sort Toggle:**
- Score (with up/down arrow toggle)

**List View:**
- Numbered ranking (1, 2, 3...)
- Restaurant name
- Price range ($-$$) | Cuisine type(s)
- Full address with city, country
- Distance (X mi) • Status (Open/Closed) • Hours
- Score bubble on right (e.g., 10.0 in green)

**View Map Button:**
- Floating button at bottom right to switch to map view

### 3. Add Restaurant Flow
**Step 1: Search & Select**
- Search bar with autocomplete
- Recent restaurants
- Can't find? Add manually

**Step 2: Initial Rating**
- Three options: "I liked it!", "It was fine", "I didn't like it"

**Step 3: Details**
- Add tags (date night, business, casual, etc.)
- Tag friends who were there
- Add notes
- Add favorite dishes
- Upload photos

**Step 4: Ranking**
- Compare against 3-5 other restaurants
- "Which did you prefer?" binary choices
- Calculate score (0-10)

### 4. Search Screen
**Tab Toggle:**
- Restaurants (default)
- Members

**Search Bar:**
- "Search restaurant, cuisine, occasion"
- Location selector below (Current Location with X to clear)

**Quick Action Pills:**
- Reserve now (calendar icon)
- Recs (heart icon)
- Trending (chart icon)
- Leaderboard (people icon) - takes you to leaderboard view

**Recents Section:**
- Clock icon for each recent search
- Restaurant name
- Neighborhood, City
- X to remove from recents

**Suggestions:**
- "Places you may have been"
- Based on calendar integration
- Shows ranking if already rated (e.g., "Ranked 55 of 64")

### 5. Profile Screen
**Top Section:**
- Profile photo (circular)
- Username handle (@username) with verification badge if applicable
- Member since date
- Bio/status message
- Edit profile / Share profile buttons
- Instagram link button

**Stats Section:**
- Followers count
- Following count  
- Rank on Beli (#XXXX)

**Lists Overview:**
- Been (with count - e.g., 790)
- Want to Try (with count - e.g., 1203)
- Recs for You

**Achievement Cards:**
- Rank on Beli card (#XXXX)
- Current Streak card (X weeks)

**Goals Section:**
- 2025 Goal progress bar
- "Congrats! You reached your 2025 goal!"
- Days left counter
- "Set a new goal" link

**Activity Sections:**
- Recent Activity (shows recent bookmarks, ratings)
- Taste Profile (link to detailed preferences)

## Enhanced Features

### Group Dinner Planner (Accessed via top-right menu)

**Flow:**
1. **Create Session**
   - Name the dinner (e.g., "Friday Squad Dinner")
   - Set date/time
   - Add participants (2-10 people)

2. **Preference Aggregation**
   - Pull each participant's "Want to Try" lists
   - Show dietary restrictions
   - Set filters (distance, price, cuisine)

3. **Smart Shuffle**
   - Algorithm weights by:
     - Group taste compatibility score
     - Number of people who want to try it
     - Dietary accommodation
     - Distance from center point
   - Shows "Why this works" explanation

4. **Decision**
   - Shuffle for new suggestion
   - Vote yes/no
   - Lock in choice
   - Optional: Reserve via OpenTable/Resy integration

**UI Elements:**
- Participant avatars in grid
- Compatibility score badge (e.g., "92% Match")
- Animated shuffle with card flip effect
- Real-time voting indicators

### Date Night Mode (Accessed via top-right menu)

**Features:**
- Ambiance ratings (1-5 hearts):
  - Romantic atmosphere
  - Noise level
  - Privacy
  - View quality
- Special filters:
  - Candlelit
  - Rooftop
  - Live music
  - Private rooms
- Partner linking for shared lists
- "Surprise mode" - hides selection from partner

## Design System

### Colors
```css
--primary-green: #00A676;
--primary-dark: #005F46;
--accent-orange: #FF6B35;
--background: #FAFAFA;
--card-white: #FFFFFF;
--text-primary: #1A1A1A;
--text-secondary: #666666;
--border: #E5E5E5;
--success: #4CAF50;
--error: #F44336;
--rating-gold: #FFD700;
```

### Typography
- Headlines: SF Pro Display or system-ui
- Body: SF Pro Text or system-ui
- Sizes: 12px, 14px, 16px, 18px, 24px

### Components
- Cards: 8px radius, subtle shadow
- Buttons: 12px radius, 44px min height
- Inputs: 8px radius, 44px height
- Bottom sheet modals for actions
- Haptic feedback on interactions

## Animations
- Tab switch: Fade transition
- Card entrance: Slide up with fade
- Shuffle: 3D card flip
- Pull to refresh: Custom animation
- Story tap: Scale bounce
- Rating stars: Sequential fill

## Data Models

```typescript
interface User {
  id: string;
  username: string;
  avatar: string;
  tasteProfile: {
    cuisines: Map<string, number>;
    priceRange: number[];
    adventurousness: number;
  };
  stats: {
    restaurantCount: number;
    cityCount: number;
    streak: number;
    rank: number;
  };
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  location: {
    address: string;
    coordinates: [number, number];
  };
  photos: string[];
  aggregateRating: number;
  ambianceScores?: {
    romantic: number;
    quiet: boolean;
    view: boolean;
    outdoor: boolean;
  };
}

interface GroupDinner {
  id: string;
  name: string;
  date: Date;
  participants: User[];
  filters: DiningFilters;
  suggestions: Restaurant[];
  currentSuggestion: Restaurant | null;
  decision: Restaurant | null;
  compatibilityScore: number;
}
```

## State Management Structure

```typescript
interface AppState {
  user: User | null;
  feed: FeedItem[];
  restaurants: {
    beenTo: Restaurant[];
    wantToTry: Restaurant[];
  };
  groupDinners: GroupDinner[];
  activeGroupDinner: GroupDinner | null;
  ui: {
    activeTab: 'feed' | 'lists' | 'search' | 'profile';
    listView: 'list' | 'map';
    isAddingRestaurant: boolean;
  };
}
```

## Key Interactions
- Swipe right on restaurant card: Add to "Want to Try"
- Long press restaurant: Quick preview
- Double tap: Like/favorite
- Pull down: Refresh feed
- Horizontal swipe on stories: Navigate
- Pinch on map: Zoom
- Shake device: Random restaurant suggestion

## Performance Requirements
- First contentful paint: < 1.5s
- Time to interactive: < 3s
- Smooth 60fps animations
- Offline capability for lists
- Image lazy loading
- Virtual scrolling for long lists

## Accessibility
- WCAG 2.1 AA compliant
- Screen reader optimized
- Touch targets: minimum 44x44px
- Color contrast: 4.5:1 minimum
- Focus indicators on all interactive elements
- Reduced motion option

## Mock API Endpoints
```
GET /api/feed
GET /api/restaurants/search
POST /api/restaurants/add
POST /api/restaurants/rank
GET /api/users/:id/profile
GET /api/users/:id/restaurants
POST /api/groups/create
POST /api/groups/:id/shuffle
GET /api/recommendations
```

## Implementation Priority
1. Core navigation and screens
2. Restaurant adding and ranking
3. Feed functionality
4. Group dinner planner
5. Date night mode
6. Polish and animations

Focus on mobile experience first, ensure smooth interactions, and emphasize the social aspects that make Beli unique. The group dining feature should feel magical - like having a smart friend who knows everyone's tastes picking the perfect spot.