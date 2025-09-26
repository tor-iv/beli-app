# Restaurant Info Screen - Detailed Specification

## Screen Overview
A full-screen view displaying comprehensive restaurant information with map integration, ratings, social proof, and actionable elements. The screen uses a scrollable layout with a fixed map header that creates visual depth through parallax scrolling.

## Component Breakdown

### 1. Map Header Section
**Dimensions & Position:**
- Height: 280px
- Width: 100% (full screen width)
- Position: Fixed at top, becomes scrollable with parallax effect

**MapView Component:**
```typescript
interface MapHeaderProps {
  restaurant: {
    latitude: number
    longitude: number
    name: string
    address: string
  }
  onBackPress: () => void
  onSharePress: () => void
  onNotificationPress: () => void
  onMorePress: () => void
}
```

**Sub-components:**
- **Map Display**
  - Provider: Apple Maps (iOS) / Google Maps (Android)
  - Initial zoom level: 15 (neighborhood view)
  - Center: Restaurant coordinates
  - Marker: Custom pin with restaurant icon
  - Interactive: Allow pinch-to-zoom, pan
  - Styling: Light mode with muted colors

- **Navigation Overlay Bar**
  - Position: Absolute, top: 0
  - Height: 88px (44px safe area + 44px bar)
  - Background: Linear gradient (transparent to rgba(255,255,255,0.9))
  - Padding: horizontal 16px
  - Items:
    - Back Button: Chevron left icon, 24x24px, hitSlop: 8px
    - Right Actions (flex-row, gap: 16px):
      - Notification Bell: 24x24px, badge indicator if active
      - Share Icon: iOS share symbol, 24x24px
      - More Menu: Three dots vertical, 24x24px

### 2. Restaurant Information Card
**Position & Layout:**
- Top margin: -40px (overlaps map bottom)
- Background: white
- Border radius: top-left: 20px, top-right: 20px
- Shadow: 0px -2px 10px rgba(0,0,0,0.1)
- Padding: 20px horizontal, 24px top

**Content Structure:**

#### Restaurant Header Row
```typescript
interface RestaurantHeaderProps {
  name: string
  overallScore: number
  totalRatings: number
  isSaved: boolean
  onAddPress: () => void
  onBookmarkPress: () => void
}
```

- **Restaurant Name**
  - Font: SF Pro Display Bold
  - Size: 32px
  - Line height: 38px
  - Color: #1C1C1E
  - Max lines: 2
  - Letter spacing: -0.5px

- **Score Badge**
  - Position: Below name, left aligned
  - Size: 60px width x 32px height
  - Background: Dynamic based on score
    - 8.0-10: #4CAF50 (green)
    - 6.0-7.9: #FF9800 (orange)
    - Below 6.0: #F44336 (red)
  - Score text: 24px bold, white
  - Rating count: 14px regular, opacity 0.8
  - Format: "8.0 (1,849 ratings)"

- **Action Buttons**
  - Position: Absolute right, top 24px
  - Layout: Horizontal, gap 12px
  - Add Button:
    - Size: 44x44px
    - Icon: Plus symbol, 24px
    - Background: white
    - Border: 1px solid #E5E5E7
    - Border radius: 22px
  - Bookmark Button:
    - Size: 44x44px
    - Icon: Bookmark (filled/outline based on state)
    - Background: white
    - Border: 1px solid #E5E5E7
    - Border radius: 22px

### 3. Tags Section
**Layout:**
- Margin top: 16px
- Height: 36px
- Horizontal ScrollView
- No scroll indicators
- Content inset: 20px left/right

**Individual Tag:**
```typescript
interface TagProps {
  label: string
  icon?: string
  type: 'feature' | 'cuisine' | 'dietary'
}
```

- Background: #F2F2F7
- Border radius: 18px
- Padding: 8px horizontal, 6px vertical
- Font: SF Pro Text Medium, 14px
- Color: #3C3C43
- Margin right: 8px
- Min width: fit-content
- Examples: "Date Night", "Gluten Free", "Atmosphere", "Sharing", "Beer"

### 4. Restaurant Meta Information
**Layout:**
- Margin top: 16px
- Line height: 22px

**Components:**

- **Price & Cuisine Line**
  - Font: SF Pro Text Regular, 16px
  - Color: #1C1C1E
  - Format: "$$ | Pizza, Japanese"
  - Price symbols: Bold
  - Separator: Light gray " | "

- **Location**
  - Font: SF Pro Text Regular, 15px
  - Color: #8E8E93
  - Format: "Ukrainian Village, New York, NY"
  - Tappable: Opens in maps

- **Social Proof Section**
  - Margin top: 12px
  - Layout: Horizontal flex
  - Avatar Stack:
    - Size: 28px per avatar
    - Overlap: -8px
    - Max shown: 4
    - Border: 2px white
    - Z-index: Reverse order
  - Text:
    - Font: SF Pro Text Medium, 15px
    - Color: #0B7B7F (primary teal)
    - Format: "4 friends want to try"

### 5. Quick Actions Row
**Layout:**
- Margin top: 20px
- Height: 48px
- Flex direction: row
- Gap: 12px
- Padding horizontal: 20px

**Button Specifications:**
```typescript
interface ActionButtonProps {
  icon: string
  label: string
  onPress: () => void
  type: 'website' | 'call' | 'directions'
}
```

- **Common Styles:**
  - Flex: 1 (equal width)
  - Height: 48px
  - Border: 1.5px solid #E5E5E7
  - Border radius: 12px
  - Background: white
  - Active state: Background #F2F2F7

- **Content:**
  - Icon size: 20px
  - Icon color: #0B7B7F
  - Label font: SF Pro Text Medium, 14px
  - Label color: #1C1C1E
  - Layout: Icon left, 8px gap, label

### 6. Scores Section
**Header:**
- Margin top: 32px
- Padding horizontal: 20px
- Flex row, justify-between
- Title:
  - Text: "Scores"
  - Font: SF Pro Display Semibold, 20px
  - Badge: "SC" in rounded rect, background #E8F5F5, color #0B7B7F
- Link:
  - Text: "See all scores"
  - Font: SF Pro Text Regular, 15px
  - Color: #0B7B7F

**Score Cards Container:**
- Margin top: 16px
- Horizontal ScrollView
- Padding horizontal: 20px
- Gap: 12px
- Show partial next card (peek)

**Individual Score Card:**
```typescript
interface ScoreCardProps {
  type: 'rec' | 'friend' | 'your'
  score: number
  count?: number
  description: string
}
```

- **Dimensions:**
  - Width: 160px
  - Height: 100px
  - Background: white
  - Border: 1px solid #E5E5E7
  - Border radius: 16px
  - Padding: 16px

- **Content Layout:**
  - Score Circle:
    - Size: 48px
    - Background: Dynamic color based on score
    - Text: 24px bold white
  - Count Badge (if applicable):
    - Position: Bottom right of circle
    - Background: #1C1C1E
    - Text: "2k" or "2" in white, 10px
    - Padding: 2px 6px
    - Border radius: 10px
  - Title:
    - Font: SF Pro Text Semibold, 16px
    - Margin top: 8px
  - Description:
    - Font: SF Pro Text Regular, 13px
    - Color: #8E8E93
    - Lines: 2 max

### 7. Popular Dishes Section
**Header:**
- Margin top: 32px
- Same style as Scores header
- Title: "Popular dishes"
- Link: "See all photos"

**Dishes Container:**
- Margin top: 16px
- Horizontal FlatList
- Content inset: 20px
- Item separator: 12px
- Snap to interval: Card width + gap

**Dish Card:**
```typescript
interface DishCardProps {
  image: string
  name?: string
  mentions?: number
  onPress: () => void
}
```

- **Dimensions:**
  - Width: 240px
  - Height: 180px
  - Border radius: 12px
  - Overflow: hidden

- **Image:**
  - Resize mode: cover
  - Loading: Skeleton shimmer
  - Error: Placeholder image

- **Optional Overlay:**
  - Position: Bottom
  - Background: Linear gradient (transparent to rgba(0,0,0,0.6))
  - Padding: 12px
  - Name: White, 14px medium
  - Mentions: White, 12px regular

### 8. Additional Sections (Below Fold)
**These sections follow similar patterns:**

#### Reviews Section
- Header with count and "See all"
- Vertical list of review cards
- Each card: User avatar, name, rating, date, text, helpful count

#### Menu Section
- Header with "View full menu" link
- Category tabs (horizontal scroll)
- Grid of menu items with prices

#### Hours & Location
- Expandable hours list
- Map thumbnail with address
- Get directions button

## Interaction Specifications

### Scroll Behavior
```typescript
interface ScrollHandlers {
  onScroll: (event: NativeScrollEvent) => void
  parallaxRate: number // 0.5 for map
  headerCollapseThreshold: number // 100px
}
```

- Map parallax: Moves at 50% scroll speed
- Header bar: Fades in background after 50px scroll
- Content card: Standard scroll
- Sticky section headers after 200px scroll

### Touch Interactions
- **Tap targets:** Minimum 44x44px
- **Press states:** Opacity 0.7 or background color change
- **Long press:** On restaurant name shows share menu
- **Swipe:** Horizontal on images/tags/scores
- **Pull to refresh:** Updates restaurant data

### Animation Timings
```typescript
const animations = {
  buttonPress: {
    duration: 150,
    easing: Easing.out(Easing.cubic)
  },
  cardAppear: {
    duration: 300,
    delay: index * 50,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1)
  },
  parallax: {
    inputRange: [0, 280],
    outputRange: [0, -140]
  }
}
```

## State Management

### Screen State
```typescript
interface RestaurantInfoScreenState {
  // Core data
  restaurant: Restaurant
  loading: boolean
  error: Error | null

  // User interaction
  isSaved: boolean
  userScore?: number
  hasVisited: boolean

  // Social
  friendsInterested: User[]
  friendsVisited: User[]

  // Content
  dishes: Dish[]
  reviews: Review[]
  menuCategories: MenuCategory[]

  // UI state
  activeSection: string
  mapExpanded: boolean
  showAllHours: boolean
  selectedDishIndex: number
}
```

### Data Fetching
```typescript
// Parallel fetch on mount
useEffect(() => {
  Promise.all([
    fetchRestaurantDetails(id),
    fetchUserContext(id),
    fetchSocialContext(id),
    fetchDishes(id),
    fetchReviews(id)
  ])
}, [id])
```

## Performance Optimizations

### Image Loading
- Lazy load images below fold
- Progressive JPEG for hero images
- Thumbnail placeholders (base64)
- Cache policy: 7 days

### List Virtualization
- FlatList for dishes (horizontal)
- VirtualizedList for reviews
- Window size: 10 items
- Initial render: 5 items

### Memoization
```typescript
const memoizedScores = useMemo(() =>
  calculateScores(restaurant, reviews, friends),
  [restaurant.id, reviews.length, friends.length]
)
```

## Accessibility

### Labels
```typescript
const a11y = {
  backButton: "Go back",
  shareButton: "Share restaurant",
  scoreLabel: `Rated ${score} out of 10`,
  addButton: isSaved ? "Remove from list" : "Add to list",
  mapRegion: `Map showing ${restaurant.name} location`
}
```

### Screen Reader
- Heading levels: H1 for name, H2 for sections
- Focus order: Top to bottom, left to right
- Announcements: State changes (saved, shared)
- Descriptions: All images have alt text

## Error States

### Loading
- Skeleton screens for each section
- Shimmer animation
- Staggered appearance

### Error
- Inline error messages
- Retry buttons
- Fallback to cached data

### Empty States
- "No reviews yet" with CTA
- "No photos available" placeholder
- "Hours not available" message

## Platform Differences

### iOS
- Safe area insets for notch
- Haptic feedback on interactions
- Native share sheet
- Apple Maps default

### Android
- Status bar theming
- Material ripple effects
- Native share dialog
- Google Maps default

## Theme Integration
```typescript
import { colors, typography, spacing, shadows } from '@/theme'

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  card: {
    ...shadows.medium,
    borderRadius: spacing.radius.large
  },
  title: {
    ...typography.heading.large,
    color: colors.text.primary
  }
}
```