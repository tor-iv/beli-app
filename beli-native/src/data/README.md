# Mock Data Layer - Phase 1 Complete

## Overview
This comprehensive mock data layer provides realistic data for the Beli app clone, enabling full functionality testing without requiring a backend API.

## Data Structure

### 🏪 Restaurants (`mock/restaurants.ts`)
- **30 restaurants** across NYC neighborhoods
- Covers all major areas: SoHo, Greenwich Village, East Village, Midtown, etc.
- Diverse cuisines: Pizza, French, Italian, Chinese, Japanese, American, etc.
- Price ranges from $ to $$$$
- Complete restaurant data including:
  - Hours of operation
  - Phone numbers and websites
  - Popular dishes
  - Geographic coordinates
  - User ratings (1-10 scale)
  - Photos and tags

### 👥 Users (`mock/users.ts`)
- **20 diverse users** with unique personalities
- Realistic stats (followers, following, rank, streak)
- Varied dietary restrictions and preferences
- Authentic bios and avatars
- Different food expertise areas (pizza, fine dining, vegan, etc.)

### 🔗 User-Restaurant Relations (`mock/userRestaurantRelations.ts`)
- Maps users to restaurants they've **been** to, **want to try**, or **recommend**
- Includes ratings, visit dates, notes, and photos
- Companion tracking (who they went with)
- Realistic relationship patterns based on user personalities

### ⭐ Reviews (`mock/reviews.ts`)
- **15 detailed reviews** with authentic content
- Covers different restaurant types and user perspectives
- Includes photos, helpful counts, and verified visits
- Rich metadata (tags, order items, visit dates)

### 📱 Activity Feed (`mock/activities.ts`)
- **15 social activities** (visits, want-to-try, recommendations)
- Realistic timestamps and social interactions
- Likes, comments, and bookmarks
- Trending restaurants and recent check-ins

### 📋 Lists & Playlists (`mock/lists.ts`)
- **Featured lists** (Top 10 NYC Pizza, Michelin Stars, Date Night, etc.)
- **User-created lists** based on individual preferences
- Public and private list support
- Categorized by type (been, want to try, recs, playlists)

## API Service (`mockDataService.ts`)

The `MockDataService` class provides a complete API-like interface with:

### User Operations
- `getCurrentUser()` - Get current logged-in user
- `getUserById(id)` - Get user by ID
- `searchUsers(query)` - Search users by username/name
- `getUserStats(id)` - Get user statistics

### Restaurant Operations
- `getAllRestaurants()` - Get all restaurants
- `getRestaurantById(id)` - Get restaurant details
- `searchRestaurants(query, filters)` - Advanced restaurant search
- `getTrendingRestaurants()` - Get currently trending spots

### User-Restaurant Relations
- `getUserRestaurantsByStatus()` - Get user's been/want-to-try lists
- `addRestaurantToUserList()` - Add restaurant to user's list
- `removeRestaurantFromUserList()` - Remove from list

### Reviews & Ratings
- `getRestaurantReviews(id)` - Get reviews for a restaurant
- `getUserReviews(id)` - Get user's reviews
- `addReview()` - Add new review

### Activity Feed
- `getActivityFeed()` - Get social activity feed
- `addActivity()` - Add new activity
- `likeActivity()` / `unlikeActivity()` - Social interactions

### Lists & Playlists
- `getUserLists()` - Get user's lists
- `getFeaturedLists()` - Get curated featured lists
- `createList()` - Create new list
- `updateList()` / `deleteList()` - Manage lists

### Additional Features
- `getLeaderboard()` - User rankings
- `getRecentSearches()` - Search history
- `getRestaurantRecommendations()` - Personalized recommendations
- Network delay simulation for realistic UX

## Key Features

### 🎯 Realistic Data
- All restaurant data based on real NYC establishments
- Authentic user personalities and preferences
- Realistic social interactions and review patterns
- Geographic accuracy with real coordinates

### 🔍 Advanced Filtering
- Search by restaurant name, cuisine, neighborhood
- Filter by price range, distance, dietary restrictions
- Sort by rating, popularity, distance

### 👫 Social Features
- User relationships and interactions
- Activity feed with likes, comments, bookmarks
- Public and private lists
- Friend recommendations

### 📊 Rich Analytics
- User statistics and rankings
- Restaurant ratings and scores
- Trending analysis
- Activity tracking

## Usage Example

```typescript
import MockDataService from './mockDataService';

// Get activity feed
const feed = await MockDataService.getActivityFeed();

// Search restaurants
const pizzaPlaces = await MockDataService.searchRestaurants('pizza', {
  priceRange: ['$', '$$'],
  maxDistance: 2
});

// Get user's been-to list
const beenTo = await MockDataService.getUserRestaurantsByStatus('1', 'been');

// Add restaurant to want-to-try list
await MockDataService.addRestaurantToUserList('1', 'restaurant-id', 'want_to_try');
```

## Next Steps (Phase 2)

With this comprehensive mock data layer complete, the app is ready for:
1. Design system implementation
2. Core screen development
3. Navigation setup
4. UI component creation
5. State management integration

The mock data provides everything needed for a fully functional MVP without any backend dependencies.