# Beli App - New Features Specification
**Lucky Spin | Restaurant Scavenger Hunt | Food Crawl | New Openings**

**Version:** 1.1
**Date:** October 27, 2024
**Status:** Planning / Pre-Implementation

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Lucky Spin - Spin the Wheel](#1-lucky-spin---spin-the-wheel)
3. [Restaurant Scavenger Hunt](#2-restaurant-scavenger-hunt)
4. [Food Crawl](#3-food-crawl)
5. [New Openings Discovery](#4-new-openings-discovery)
6. [Data Models](#data-models)
7. [Implementation Priorities](#implementation-priorities)
8. [Technical Considerations](#technical-considerations)

---

## Feature Overview

This document specifies four new features designed to enhance user engagement, drive discovery, and create competitive social dynamics within the Beli app:

| Feature | Purpose | User Type | Engagement Pattern |
|---------|---------|-----------|-------------------|
| **Lucky Spin** | Individual indecision breaker | All users | Daily/spontaneous |
| **Scavenger Hunt** | Competitive challenges with prizes | Power users | Weekly/monthly |
| **Food Crawl** | Multi-stop dining experiences | Social/explorers | Weekend/special |
| **New Openings** | Discover recently opened restaurants | Early adopters | Weekly/new openings |

### Key Design Principles
- **Leverage existing data**: Uses restaurant database, user preferences, ratings
- **Integrate with current features**: Extends leaderboard, achievements, social feed
- **Match design system**: Teal accents, clean UI, circular elements, shadows
- **No dark patterns**: Optional features that add value, not manipulation

---

## 1. Lucky Spin - Spin the Wheel

### Overview
A playful, slot machine-style random restaurant picker for users who can't decide where to eat. Provides controlled randomness with safety guardrails (filters, ratings, distance).

### Problem It Solves
- Decision paralysis when browsing restaurants
- "I don't care, you pick" moments
- Discovery outside usual patterns
- Solo dining spontaneity

### Key Differentiators vs Group Dinner Shuffle

| Aspect | Lucky Spin | Group Dinner Shuffle |
|--------|------------|---------------------|
| **Users** | Solo individual | Multiple people |
| **Purpose** | Fun randomness | Algorithmic optimization |
| **Stakes** | Low (just you) | High (group commitment) |
| **Input** | Your mood + constraints | Multiple preferences combined |
| **Output** | Random surprise | Best match for group |
| **Use case** | "Surprise me!" | "Find consensus" |

---

### User Flow

#### Entry Points
1. **Search Screen**: "Feeling Lucky?" button near search bar
2. **Feed**: Floating action button (FAB) with dice icon
3. **Lists Screen**: "Random Pick from Want-to-Try" option
4. **Profile**: Quick action in settings

#### Spin Flow

```
1. Tap "Lucky Spin" entry point
   ↓
2. See slot machine interface with 3 wheels
   ↓
3. (Optional) Set constraints:
   - Distance radius slider
   - Minimum rating (5.0+, 7.0+, 8.0+)
   - Price range checkboxes
   - Cuisine include/exclude
   - "Open now" toggle
   ↓
4. Tap "SPIN" button
   ↓
5. Animated wheel spin (2-3 seconds)
   ↓
6. Reveal restaurant card
   ↓
7. Options:
   - "Let's Go!" → Navigate/reserve
   - "Save for Later" → Add to want-to-try
   - "Spin Again" → New random pick
```

---

### UI Design Specification

#### Main Spin Screen

```
┌─────────────────────────────────────┐
│  Lucky Spin                         │
│  ─────────────────────────          │
│                                     │
│  Feeling adventurous?               │
│  Let fate decide your next meal!    │
│                                     │
│  ┌───────────────────────────┐     │
│  │   [SLOT MACHINE UI]        │     │
│  │                            │     │
│  │   Pizza | Ramen | Burger   │     │
│  │  ────  ────  ────          │     │
│  │  Italian | Asian | American │     │
│  │                            │     │
│  └───────────────────────────┘     │
│                                     │
│  Constraints (Optional)             │
│  Distance: [===●═══] 2.5mi         │
│  Min Rating: [7.0+]                │
│  Price: [$ $$ $$$ $$$$]            │
│  Dietary: [Your restrictions]      │
│  Open Now: [●]                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      SPIN THE WHEEL          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Lucky finds history: 12 saved     │
└─────────────────────────────────────┘
```

#### Result Card (Post-Spin)

```
┌─────────────────────────────────────┐
│  Your Lucky Pick!                   │
│  ─────────────────────────          │
│                                     │
│  [Restaurant Hero Image]            │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    Via Carota               │   │
│  │    Italian • $$ • 0.8mi     │   │
│  │    8.7 (456 reviews)        │   │
│  │                             │   │
│  │    Why this might be great: │   │
│  │    • 12 friends love it     │   │
│  │    • Perfect for date night │   │
│  │    • Open until 11pm        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ Let's Go!    │  │ Save        │ │
│  └──────────────┘  └─────────────┘ │
│                                     │
│  [Not Feeling It? Spin Again]       │
└─────────────────────────────────────┘
```

---

### Features & Mechanics

#### 1. **Constraint System**
Users can set optional filters to control randomness:

**Distance**
- Slider: 0.5mi → 10mi
- Default: 2 miles
- Uses user's current location

**Minimum Rating**
- Options: Any, 6.0+, 7.0+, 8.0+, 9.0+
- Default: 7.0+
- Filters by Beli rating or friend score

**Price Range**
- Checkboxes: $, $$, $$$, $$$$
- Default: All checked
- Can select multiple

**Cuisine Filters**
- Include: Only show selected cuisines
- Exclude: Never show these cuisines
- Respects user's dietary restrictions automatically

**Open Now**
- Toggle: On/Off
- Checks restaurant hours
- Default: Off

#### 2. **Spin Animation**
Three-wheel slot machine effect:

**Animation Sequence:**
1. User taps "SPIN THE WHEEL"
2. Three vertical wheels appear
3. Wheels spin rapidly (different speeds)
4. Wheels slow down sequentially (left → center → right)
5. Final wheel lands with haptic feedback
6. Card reveal animation from bottom

**Timing:**
- Total duration: 2.5 seconds
- Anticipation build with sound effects (optional)
- Satisfying mechanical "click" when stopping

#### 3. **Lucky Finds History**
Track restaurants discovered via Lucky Spin:

```typescript
interface LuckyFind {
  id: string;
  restaurant: Restaurant;
  spunAt: Date;
  constraints: SpinConstraints;
  visited: boolean;
  rating?: number; // If user visited and rated
  saved: boolean; // Added to want-to-try
}
```

**History Screen:**
- Accessible from Lucky Spin main screen
- Shows past 50 spins
- Filter by: Saved, Visited, Rating given
- "Spin again with same constraints" option
- Analytics: "You've found 23 great spots via Lucky Spin!"

#### 4. **Spin Limits (Anti-Spam)**
Prevent abuse while keeping it fun:

- **Unlimited spins per day** (no hard limit)
- **Soft encouragement**: "You've spun 10 times! Maybe it's time to pick one?"
- **Cooldown between spins**: 5 seconds (prevents spam)
- **Track conversion rate**: Spins → Saves → Visits

#### 5. **Social Sharing**
Share lucky finds:

```
"Lucky Spin just picked Via Carota for me!
8.7 • Italian • West Village
Should I go?"
```

- Share to feed (optional)
- Share to external (Instagram, Twitter)
- Challenge friends: "Spin for dinner tonight!"

---

### Data Models

```typescript
// Lucky Spin Configuration
interface SpinConstraints {
  maxDistance: number; // miles
  minRating: number; // 0-10
  priceRanges: ('$' | '$$' | '$$$' | '$$$$')[];
  includeCuisines?: string[]; // Empty = all
  excludeCuisines?: string[]; // User dislikes + manual
  openNow: boolean;
  mustHaveReservations?: boolean;
  friendsVisited?: boolean; // Only show places friends have been
}

// Lucky Spin Session
interface LuckySpinSession {
  id: string;
  userId: string;
  timestamp: Date;
  constraints: SpinConstraints;
  result: Restaurant;
  action: 'saved' | 'visited' | 'dismissed' | 'spun_again';
  spinCount: number; // How many spins before decision
}

// Lucky Spin Stats
interface LuckySpinStats {
  userId: string;
  totalSpins: number;
  restaurantsSaved: number;
  restaurantsVisited: number;
  averageRating: number; // Of visited lucky finds
  conversionRate: number; // % of spins that led to visits
  favoriteConstraints: SpinConstraints; // Most-used settings
}
```

---

### Success Metrics

**Engagement:**
- Daily active spinners
- Spins per user per week
- Time between spin and action (save/visit)

**Discovery:**
- % of spun restaurants not previously on user's radar
- Cuisine diversity increase
- New neighborhood exploration

**Conversion:**
- Spin → Save rate
- Spin → Visit rate
- Spin → High rating rate (did random picks work out?)

---

### Implementation Phases

**Phase 1: Core Spin (Week 1)**
- Basic slot machine UI
- Constraint filters (distance, rating, price)
- Single spin result
- Save to want-to-try integration

**Phase 2: Polish & History (Week 2)**
- Spin animation polish
- Lucky finds history screen
- Advanced filters (cuisine, open now)
- Social sharing

**Phase 3: Intelligence (Week 3)**
- Learn from user's successful spins
- Adjust randomness based on preferences
- "You seem to love Lucky Spin picks rated 8.5+" insights
- Personalized constraints suggestions

---

## 2. Restaurant Scavenger Hunt

### Overview
Competitive, time-limited challenges where users complete dining objectives to earn badges, prizes, and leaderboard glory. Designed for power users who want structured discovery goals.

### Problem It Solves
- Lack of long-term engagement goals
- "I've tried everything" power user fatigue
- Need for competitive social features
- Discovery motivation beyond personal lists

### Hunt Philosophy
- **One-time special events** (e.g., "Summer 2025 Taco Hunt")
- **Seasonal recurring hunts** (e.g., "Restaurant Week Explorer")
- **Always-on evergreen hunts** (e.g., "NYC Pizza Master")
- **Community competitions** with real prizes

---

### Hunt Types & Categories

#### 1. **Cuisine Master Hunts**
Complete restaurants in specific cuisine category:

**Examples:**
- **"Italian Connoisseur"**: Visit 10 different Italian restaurants rated 7.5+
- **"Taco Tour"**: Try 15 different taco spots across NYC
- **"Sushi Sensei"**: Experience 8 sushi restaurants (must include 1 omakase)
- **"BBQ Pitmaster"**: 12 BBQ joints in different neighborhoods

**Criteria:**
- Must rate each restaurant
- Minimum rating to count: 6.0+ (prevents gaming)
- Photo proof optional but encouraged
- Time limit: 30-90 days

#### 2. **Neighborhood Navigator Hunts**
Explore specific geographic areas:

**Examples:**
- **"West Village Wanderer"**: 10 restaurants in West Village
- **"Brooklyn Bridge to Table"**: 20 spots across 5 Brooklyn neighborhoods
- **"Chinatown Deep Dive"**: 8 different Chinatown restaurants
- **"Rooftop Royalty"**: Visit 6 rooftop bars/restaurants

**Criteria:**
- Geographic boundaries defined
- Mix of cuisine types encouraged
- Distance traveled tracked
- Bonus points for hidden gems

#### 3. **Price Point Challenges**
Complete tiers across budget spectrum:

**Examples:**
- **"Budget Gourmet"**: Find 15 amazing meals under $15
- **"Value Hunter"**: Best meals at each price tier ($/$$/$$$/$$$$)
- **"Splurge Worthy"**: 5 fine dining experiences ($$$$ only)

**Criteria:**
- Must hit specific price targets
- Rating matters (prove it's worth the price)
- Value-for-money judgment

#### 4. **Dietary Restriction Hunts**
Prove dietary options are amazing:

**Examples:**
- **"Vegan Victory"**: 20 fully plant-based spots rated 7.5+
- **"Gluten-Free Guru"**: 10 restaurants with excellent GF options
- **"Allergy-Friendly Hero"**: Document 12 allergy-safe experiences

**Criteria:**
- Must match restriction
- Rate quality of accommodation
- Help others with same restrictions

#### 5. **Time-Based Challenges**
Speed and consistency:

**Examples:**
- **"Weekend Warrior"**: 3 new restaurants every weekend for a month
- **"Week of Discovery"**: 7 different cuisines in 7 days
- **"Late Night Legend"**: 10 restaurants visited after 11pm
- **"Breakfast Club"**: 15 breakfast spots before 10am

**Criteria:**
- Timestamp verification
- No repeats within challenge
- Quality threshold maintained

#### 6. **Milestone Hunts**
Historical or special achievements:

**Examples:**
- **"Michelin Quest"**: Visit 5 Michelin-starred restaurants
- **"Old Guard"**: 10 restaurants operating 50+ years
- **"James Beard Journey"**: 8 James Beard Award winners
- **"Food Hall Hero"**: Try 12 different vendors across 3 food halls

**Criteria:**
- Verification of special status
- Detailed reviews required
- Historical/cultural appreciation

---

### User Flow

#### Hunt Discovery

```
1. User opens "Scavenger Hunt" tab
   ↓
2. Browse available hunts:
   - Active (you're participating)
   - Featured (recommended for you)
   - All Hunts (browse all)
   - Completed (your achievements)
   ↓
3. Select a hunt
   ↓
4. View hunt details:
   - Description & rules
   - Prize/reward
   - Leaderboard
   - Time remaining
   - Requirements
   ↓
5. Join hunt (or view progress if already joined)
   ↓
6. See checklist of objectives
```

#### Hunt Participation

```
1. User visits a restaurant that qualifies
   ↓
2. Marks visit as "been" with rating
   ↓
3. Hunt progress auto-updates
   ↓
4. Notification: "1 of 10 Italian restaurants complete!"
   ↓
5. Social feed post (optional): "[User] completed checkpoint 3/10 in Italian Connoisseur hunt!"
   ↓
6. Continue until hunt complete
   ↓
7. Achievement unlocked + reward
```

#### Hunt Completion

```
1. Complete final requirement
   ↓
2. Celebratory animation
   ↓
3. Badge awarded
   ↓
4. Leaderboard ranking updated
   ↓
5. Prize/reward claimed (if applicable)
   ↓
6. Share achievement to feed/social
   ↓
7. Unlock new hunts (if sequential)
```

---

### UI Design Specification

#### Hunt Discovery Screen

```
┌─────────────────────────────────────┐
│   Scavenger Hunts                 │
│  ─────────────────────────          │
│                                     │
│  Active Hunts (2)                   │
│  ┌─────────────────────────────┐   │
│  │  NYC Pizza Master          │   │
│  │ 7 of 15 completed            │   │
│  │ [▓▓▓▓▓░░░░░] 47%            │   │
│  │ 12 days remaining            │   │
│  │ Rank: #23 of 847             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Summer Taco Tour          │   │
│  │ 2 of 12 completed            │   │
│  │ [▓▓░░░░░░░░░] 17%            │   │
│  │ 45 days remaining            │   │
│  │ Prize: $50 gift card      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Featured Hunts                     │
│  ┌─────────────────────────────┐   │
│  │  Italian Connoisseur       │   │
│  │ For You: 98% Match           │   │
│  │ 10 Italian spots • 30 days   │   │
│  │ 234 participants             │   │
│  │ [Join Hunt →]                │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Browse All Hunts]                 │
│  [My Completed Hunts (8)]           │
└─────────────────────────────────────┘
```

#### Hunt Detail Screen

```
┌─────────────────────────────────────┐
│  ←  NYC Pizza Master              │
│  ─────────────────────────          │
│                                     │
│  [Hero Image: Pizza collage]        │
│                                     │
│  EVERGREEN HUNT                     │
│  Visit 15 legendary NYC pizza spots │
│                                     │
│  Your Progress: 7 of 15             │
│  [▓▓▓▓▓▓▓░░░░░░░░] 47%             │
│                                     │
│  Leaderboard:                       │
│   #1: @pizzalover (15/15) ✓      │
│   #2: @nycfoodie (14/15)         │
│   #3: @eatsnyc (13/15)           │
│  ...                                │
│   #23: You (7/15)                │
│                                     │
│  ──────────────────────             │
│  Checklist (7/15 complete):         │
│                                     │
│  ✅ Di Fara Pizza                   │
│     Rated 9.2 • Oct 15              │
│                                     │
│  ✅ Prince Street Pizza             │
│     Rated 8.8 • Oct 10              │
│                                     │
│  ✅ Joe's Pizza                     │
│     Rated 8.5 • Oct 5               │
│                                     │
│  ⬜ L'Industrie Pizzeria            │
│     [Add to Want-to-Try]            │
│                                     │
│  ⬜ John's of Bleecker Street       │
│     [Add to Want-to-Try]            │
│                                     │
│  [View All 15 Spots →]              │
│                                     │
│  Rules:                             │
│  • Visit and rate all 15 spots     │
│  • Minimum rating: 6.0              │
│  • Photo proof encouraged           │
│  • No time limit                    │
│                                     │
│  Reward:                            │
│   "Pizza Master" badge            │
│   +500 achievement points         │
│   Featured on leaderboard         │
└─────────────────────────────────────┘
```

#### Hunt Completion Celebration

```
┌─────────────────────────────────────┐
│                                     │
│                           │
│                                     │
│      HUNT COMPLETE!                 │
│                                     │
│      NYC Pizza Master              │
│                                     │
│  [Animated badge rotation]          │
│                                   │
│                                     │
│  You finished in 28 days!           │
│  Final ranking: #23 of 847          │
│                                     │
│  Rewards Unlocked:                  │
│  ✓ "Pizza Master" badge             │
│  ✓ +500 achievement points          │
│  ✓ Profile showcase badge           │
│                                     │
│  Your best pick:                    │
│  Di Fara Pizza (9.2/10)             │
│                                     │
│  [Share Achievement]                │
│  [View Completed Hunts]             │
│  [Start Next Hunt →]                │
│                                     │
└─────────────────────────────────────┘
```

---

### Prize & Reward System

#### 1. **Digital Rewards (All Hunts)**
- **Badges**: Unique visual badges on profile
- **Achievement Points**: Leaderboard ranking system
- **Titles**: "Pizza Master", "Taco Connoisseur", etc.
- **Profile Flair**: Special decorations for completed hunts

#### 2. **Physical Prizes (Sponsored Hunts)**
- **Gift Cards**: $25-$100 to restaurants/delivery apps
- **Merchandise**: Branded swag, cooking tools
- **Experiences**: Chef's table reservations, cooking classes
- **Grand Prizes**: Trip to food destination, year of free delivery

#### 3. **Tiered Rewards**
```
Complete 1 hunt:  Bronze Tier
Complete 5 hunts: Silver Tier  → Early access to new hunts
Complete 10 hunts: Gold Tier   → Custom hunt creation
Complete 25 hunts: Platinum    → Beli Pro features
Complete 50 hunts: Legend      → Physical trophy, featured profile
```

#### 4. **Community Recognition**
- Featured on "Hunt Hero" section of app
- Monthly hunter spotlight in feed
- Special profile badge visible to all users
- Hunt creator credits (for user-generated hunts)

---

### Data Models

```typescript
// Scavenger Hunt Definition
interface ScavengerHunt {
  id: string;
  name: string;
  description: string;
  category: 'cuisine' | 'neighborhood' | 'price' | 'dietary' | 'time' | 'milestone';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legend';
  type: 'one-time' | 'seasonal' | 'evergreen';

  // Requirements
  objectives: HuntObjective[];
  totalCheckpoints: number;
  minRating?: number; // Minimum rating to count
  timeLimit?: number; // Days, null = no limit

  // Status
  startDate?: Date; // For time-limited hunts
  endDate?: Date;
  isActive: boolean;
  participantCount: number;
  completionCount: number;

  // Rewards
  rewards: HuntReward[];
  badge: HuntBadge;

  // Meta
  createdBy?: string; // User ID if user-generated
  featured: boolean;
  sponsoredBy?: string; // Brand/restaurant partner
}

// Individual hunt checkpoint
interface HuntObjective {
  id: string;
  description: string;
  type: 'visit_restaurant' | 'visit_cuisine' | 'visit_neighborhood' | 'price_range' | 'time_constraint';

  // Criteria
  restaurantId?: string; // Specific restaurant
  cuisine?: string; // Any restaurant of this cuisine
  neighborhood?: string;
  priceRange?: string;
  timeConstraint?: {
    startTime: string; // "23:00"
    endTime: string; // "03:00"
  };

  // Verification
  requiresPhoto: boolean;
  minRating?: number;
  order?: number; // Must be done in order (null = any order)
}

// User's hunt progress
interface HuntProgress {
  huntId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;

  // Progress
  checkpointsCompleted: string[]; // Objective IDs
  progressPercentage: number;

  // Visits that count
  qualifyingVisits: {
    objectiveId: string;
    restaurantId: string;
    visitDate: Date;
    rating: number;
    photoUrl?: string;
  }[];

  // Leaderboard
  rank?: number;
  completionTime?: number; // Minutes from start to finish

  // Status
  status: 'in_progress' | 'completed' | 'abandoned';
}

// Hunt rewards
interface HuntReward {
  type: 'badge' | 'points' | 'gift_card' | 'physical_prize' | 'feature' | 'unlock';
  description: string;
  value?: number; // Dollar value or point value
  deliveryMethod?: 'digital' | 'email' | 'mail';
  expiresAt?: Date;
}

// Visual badge for profile
interface HuntBadge {
  id: string;
  name: string;
  icon: string; // Emoji or image URL
  color: string; // Hex color
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  displayOrder: number; // Where it shows in profile
}

// Leaderboard for hunt
interface HuntLeaderboard {
  huntId: string;
  entries: {
    userId: string;
    rank: number;
    checkpointsCompleted: number;
    completionTime?: number; // For completed hunts
    completedAt?: Date;
    score: number; // Calculated based on speed + quality
  }[];
  lastUpdated: Date;
}

// User's overall hunt stats
interface UserHuntStats {
  userId: string;
  huntsStarted: number;
  huntsCompleted: number;
  completionRate: number; // %
  totalCheckpoints: number;
  badgesEarned: HuntBadge[];
  achievementPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';
  favoriteCategory: string;
  averageCompletionTime: number; // days
  currentStreak: number; // consecutive days with hunt activity
}
```

---

### Hunt Examples (Detailed)

#### Example 1: Summer Taco Tour (Sponsored, One-Time)

```typescript
{
  id: 'hunt-summer-taco-2025',
  name: 'Summer Taco Tour 2025',
  description: 'Explore NYC\'s best taco spots this summer! Complete the tour and win a $50 gift card to any participating restaurant.',
  category: 'cuisine',
  difficulty: 'medium',
  type: 'one-time',

  objectives: [
    {
      id: 'obj-1',
      description: 'Visit Los Tacos No. 1 (Times Square or Chelsea)',
      type: 'visit_restaurant',
      restaurantId: 'rest-los-tacos-1',
      requiresPhoto: true,
      minRating: 6.0
    },
    {
      id: 'obj-2',
      description: 'Try any taco truck',
      type: 'visit_cuisine',
      cuisine: 'Mexican',
      tags: ['food_truck'],
      requiresPhoto: false,
      minRating: 6.0
    },
    // ... 10 more objectives
  ],

  totalCheckpoints: 12,
  minRating: 6.0,
  timeLimit: 60, // days
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-08-31'),
  isActive: true,
  participantCount: 1247,
  completionCount: 89,

  rewards: [
    {
      type: 'gift_card',
      description: '$50 gift card to any participating restaurant',
      value: 50,
      deliveryMethod: 'email'
    },
    {
      type: 'badge',
      description: 'Summer Taco Tour Champion badge'
    },
    {
      type: 'points',
      description: '1000 achievement points',
      value: 1000
    }
  ],

  badge: {
    id: 'badge-taco-tour-2025',
    name: 'Taco Tour Champion',
    icon: '',
    color: '#FAAD14',
    rarity: 'rare',
    displayOrder: 1
  },

  featured: true,
  sponsoredBy: 'NYC Tourism Board'
}
```

#### Example 2: NYC Pizza Master (Evergreen, Community)

```typescript
{
  id: 'hunt-nyc-pizza-master',
  name: 'NYC Pizza Master',
  description: 'A rite of passage for any NYC foodie. Visit 15 legendary pizza spots and prove your pizza expertise.',
  category: 'cuisine',
  difficulty: 'hard',
  type: 'evergreen',

  objectives: [
    { id: 'obj-1', restaurantId: 'rest-di-fara', description: 'Di Fara Pizza (Brooklyn)', type: 'visit_restaurant', requiresPhoto: true, minRating: 6.0 },
    { id: 'obj-2', restaurantId: 'rest-prince-street', description: 'Prince Street Pizza', type: 'visit_restaurant', requiresPhoto: false, minRating: 6.0 },
    { id: 'obj-3', restaurantId: 'rest-joes-pizza', description: 'Joe\'s Pizza', type: 'visit_restaurant', requiresPhoto: false, minRating: 6.0 },
    // ... 12 more legendary spots
  ],

  totalCheckpoints: 15,
  minRating: 6.0,
  timeLimit: null, // No time limit
  isActive: true,
  participantCount: 3421,
  completionCount: 847,

  rewards: [
    {
      type: 'badge',
      description: 'NYC Pizza Master badge - the ultimate pizza achievement'
    },
    {
      type: 'points',
      description: '500 achievement points',
      value: 500
    },
    {
      type: 'feature',
      description: 'Featured on Pizza Masters leaderboard'
    }
  ],

  badge: {
    id: 'badge-pizza-master',
    name: 'Pizza Master',
    icon: '',
    color: '#EF4444',
    rarity: 'epic',
    displayOrder: 1
  },

  featured: true
}
```

#### Example 3: Weekend Warrior (Time-Based, Recurring)

```typescript
{
  id: 'hunt-weekend-warrior-nov-2025',
  name: 'Weekend Warrior - November 2025',
  description: 'Visit 3 new restaurants every weekend this month. Speed and consistency matter!',
  category: 'time',
  difficulty: 'expert',
  type: 'seasonal',

  objectives: [
    {
      id: 'obj-weekend-1',
      description: 'Weekend 1: 3 new restaurants (Nov 1-3)',
      type: 'time_constraint',
      timeConstraint: {
        startTime: '2025-11-01T00:00:00',
        endTime: '2025-11-03T23:59:59'
      },
      minVisits: 3,
      requiresPhoto: false,
      minRating: 6.0
    },
    // ... 4 more weekends
  ],

  totalCheckpoints: 5, // 5 weekends
  minRating: 6.0,
  timeLimit: 30,
  startDate: new Date('2025-11-01'),
  endDate: new Date('2025-11-30'),
  isActive: true,
  participantCount: 234,
  completionCount: 12,

  rewards: [
    {
      type: 'badge',
      description: 'Weekend Warrior badge'
    },
    {
      type: 'points',
      description: '750 achievement points',
      value: 750
    }
  ],

  badge: {
    id: 'badge-weekend-warrior-nov-2025',
    name: 'Weekend Warrior',
    icon: '⚡',
    color: '#FF6B35',
    rarity: 'epic',
    displayOrder: 2
  },

  featured: false
}
```

---

### Leaderboard Integration

Scavenger Hunts extend the existing **LeaderboardScreen** with new tabs:

```
Current tabs:
- Been
- Influence
- Notes
- Photos

New tab:
-  Hunts
```

#### Hunt Leaderboard Tab

**Sorting options:**
- Most hunts completed (all-time)
- Hunt points earned (all-time)
- Fastest hunt completion (this month)
- Current active hunts

**Display:**
```
┌─────────────────────────────────────┐
│   Hunt Leaderboard                │
│  ─────────────────────────          │
│                                     │
│  [All Time ▼] [This Month] [Active] │
│                                     │
│  1. @huntmaster               847   │
│      Legend Tier • 47 completed   │
│                                     │
│  2. @foodexplorer             723   │
│      Legend Tier • 42 completed   │
│                                     │
│  3. @nycfoodie                651   │
│      Platinum • 38 completed      │
│  ...                                │
│  23. You                       89   │
│      Silver • 8 completed         │
│                                     │
│  [View Global Leaderboard →]        │
└─────────────────────────────────────┘
```

---

### Social Features

#### 1. **Feed Integration**
Hunt progress appears in social feed:

```
[User Avatar] @username
 Completed checkpoint 7/12 in Summer Taco Tour!
Just tried Los Tacos No. 1 - incredible al pastor! 
[Restaurant card preview]
[Comment] [Like] [Bookmark]
```

#### 2. **Challenge Friends**
Invite friends to join same hunt:

```
"@friend1 and @friend2, I challenge you to the
NYC Pizza Master hunt! Think you can beat my time? "
```

#### 3. **Hunt Groups**
Create private groups for hunts:

```
Group: "College Friends Taco Challenge"
Members: You, @sarah, @mike, @emma
Hunt: Summer Taco Tour
Progress:
- You: 8/12 (67%)
- Sarah: 10/12 (83%) 
- Mike: 5/12 (42%)
- Emma: 7/12 (58%)

[Group chat] [Share progress]
```

---

### Success Metrics

**Engagement:**
- Hunt participation rate (% of users who join at least 1 hunt)
- Average hunts completed per power user
- Time spent in hunt screens
- Hunt-driven restaurant discoveries

**Retention:**
- Day 7 return rate after starting hunt
- Day 30 return rate
- Abandoned hunt rate (started but never completed)

**Social:**
- Hunt-related feed posts
- Friend challenges sent
- Group hunt participation

**Business:**
- Sponsored hunt engagement
- Partner restaurant traffic increase
- Premium feature unlock rate (if hunts are premium)

---

### Implementation Phases

**Phase 1: Core Hunt System (Week 1-2)**
- Hunt data models
- Hunt discovery screen
- Hunt detail & progress tracking
- Basic checklist objectives
- Completion detection & rewards

**Phase 2: Leaderboards & Social (Week 3)**
- Hunt-specific leaderboards
- Global hunt leaderboard tab
- Feed integration (progress posts)
- Badge display in profiles

**Phase 3: Advanced Hunts (Week 4)**
- Time-based challenges
- Photo verification
- Sequential objectives (must do in order)
- Partner/sponsored hunts

**Phase 4: User-Generated Hunts (Week 5)**
- Hunt creation flow
- Hunt approval/moderation
- Community voting on hunts
- Hunt remixing (fork existing hunts)

---

## 3. Food Crawl

### Overview
Multi-restaurant sequential experiences where users follow curated routes to experience multiple spots in one outing. Think pub crawl, but for food. Can be self-guided or done with friends.

### Problem It Solves
- Planning multi-stop food adventures is tedious
- Hard to discover complementary restaurants nearby
- Group outings lack structure
- Solo exploration feels aimless
- Weekend activities need more planning

---

### Food Crawl Philosophy

**What makes a great crawl:**
- **Curated theme**: Pizza styles, neighborhood tour, dessert hop
- **Logical routing**: Walking distance between stops, efficient path
- **Variety within theme**: Different experiences at each stop
- **Timing guidance**: How long to spend at each stop
- **Shareable experience**: Fun to do with friends or document solo

**Crawl vs Hunt:**
- **Hunt**: Long-term challenge (days/weeks)
- **Crawl**: Single-session experience (hours)

---

### Crawl Types

#### 1. **Cuisine Deep Dives**
Explore variations within one food type:

**Examples:**
- **"Ultimate Pizza Crawl"**: 4 stops, 4 pizza styles (NY slice, Neapolitan, Detroit, Sicilian)
- **"Taco Trek"**: 5 taco spots with different proteins
- **"Burger Battle"**: 3 burger joints (classic, smash, gourmet)
- **"Ramen Route"**: 4 ramen shops (tonkotsu, shoyu, miso, tsukemen)

**Format:**
- 3-5 stops
- 2-4 hours total
- Taste comparison element
- Vote for favorite at end

#### 2. **Neighborhood Tours**
Explore culinary diversity in one area:

**Examples:**
- **"West Village Feast"**: Breakfast → Coffee → Lunch → Dessert → Dinner
- **"Chinatown Discovery"**: 6 different Chinese regional cuisines
- **"Brooklyn Food Hall Hop"**: 3 food halls, 8 vendors
- **"LES Late Night"**: 4 spots open past midnight

**Format:**
- All within 1-2 mile radius
- Mix of cuisines
- 3-6 hours
- Walking directions between stops

#### 3. **Price Point Crawls**
Budget-conscious or splurge experiences:

**Examples:**
- **"$25 Food Tour"**: 5 stops, $5 each max
- **"Dollar Slice Tour"**: 8 pizza shops with $1 slices
- **"Fine Dining Marathon"**: 3 tasting menus in one day
- **"Happy Hour Hop"**: 5 bars with best happy hour deals

**Format:**
- Strict budget constraints
- Value-for-money focus
- 2-5 hours
- Price tracking built-in

#### 4. **Themed Experiences**
Unique concepts and special events:

**Examples:**
- **"Dessert Paradise"**: Bakery → Ice cream → Cookies → Donuts
- **"Food Truck Friday"**: 6 food trucks in different parks
- **"Breakfast World Tour"**: French, Japanese, Mexican, American breakfasts
- **"Michelin 3-Star"**: All Michelin-starred, one day

**Format:**
- Creative themes
- Instagram-worthy
- 3-8 hours
- Photo documentation encouraged

#### 5. **Seasonal/Holiday Crawls**
Limited-time special crawls:

**Examples:**
- **"Summer Rooftop Crawl"**: 5 rooftop bars/restaurants
- **"Fall Harvest Menu Tour"**: Seasonal tasting menus
- **"Holiday Cookie Crawl"**: 10 bakeries with seasonal cookies
- **"Restaurant Week Maximizer"**: Hit 3 Restaurant Week spots

**Format:**
- Time-limited availability
- Seasonal ingredients/menus
- 2-6 hours
- Special pricing/offers

---

### User Flow

#### Crawl Discovery

```
1. User opens "Food Crawl" section
   ↓
2. Browse crawls:
   - Near Me (based on location)
   - Trending (most popular this week)
   - By Category (cuisine, neighborhood, etc.)
   - Your Saved Crawls
   ↓
3. Select a crawl to view details
   ↓
4. See:
   - Map with all stops
   - Stop details & order
   - Total time & distance
   - Creator & ratings
   - Photos from others
   ↓
5. Options:
   - Start Crawl Now
   - Save for Later
   - Invite Friends
   - Create Variation
```

#### Active Crawl Mode

```
1. User taps "Start Crawl"
   ↓
2. (Optional) Invite friends to join
   ↓
3. Active crawl mode activates:
   - Progress tracker at top
   - Current stop highlighted
   - Map shows route
   - Navigation to next stop
   ↓
4. At each stop:
   - Check in
   - Rate the experience
   - Take photos
   - See what to order (suggested)
   - Timer (optional, suggested time)
   ↓
5. Move to next stop:
   - Swipe to mark complete
   - Get directions to next
   - See time/distance
   ↓
6. Repeat until all stops complete
   ↓
7. Crawl complete:
   - Summary screen
   - Photo collage
   - Favorite stop poll
   - Share to feed
   - Rate overall crawl
```

#### Crawl Creation

```
1. User taps "Create Crawl"
   ↓
2. Set crawl basics:
   - Name
   - Description
   - Category/theme
   - Public or private
   ↓
3. Add stops:
   - Search restaurants
   - Set order (drag to reorder)
   - Add notes per stop
   - Suggest dishes
   - Set time estimate
   ↓
4. Preview map & route
   ↓
5. Publish or save as draft
   ↓
6. (If public) Submit for review
   ↓
7. Crawl goes live
   ↓
8. Track: views, starts, completions, ratings
```

---

### UI Design Specification

#### Crawl Discovery Screen

```
┌─────────────────────────────────────┐
│   Food Crawls                    │
│  ─────────────────────────          │
│                                     │
│  Near You This Weekend              │
│  ┌─────────────────────────────┐   │
│  │ [Preview map thumbnail]      │   │
│  │                             │   │
│  │ West Village Food Hop       │   │
│  │ 5 stops • 3 hours • 2.1mi   │   │
│  │  4.8 (234 crawlers)       │   │
│  │ By @foodie_nyc              │   │
│  │                             │   │
│  │ [Start Crawl] [Save]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Trending This Week                 │
│  ┌─────────────────────────────┐   │
│  │ Ultimate Taco Tour        │   │
│  │ 6 stops • 4 hrs • 3.5mi     │   │
│  │ 847 crawlers •  4.9       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Categories                         │
│  [ Cuisine] [ Neighborhood]   │
│  [ Budget] [ Themed]           │
│                                     │
│  [Create Your Own Crawl +]          │
│  [My Saved Crawls (8)]              │
│  [My Completed (3)]                 │
└─────────────────────────────────────┘
```

#### Crawl Detail Screen

```
┌─────────────────────────────────────┐
│  ← West Village Food Hop            │
│  ─────────────────────────          │
│                                     │
│  [Interactive map showing 5 stops]  │
│  ┌─────────────────────────────┐   │
│  │        •1                    │   │
│  │   •2      •4                │   │
│  │      •3       •5            │   │
│  │  [West Village area map]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Created by @foodie_nyc             │
│   4.8 (234 completions)           │
│                                     │
│  ⏱️ 3 hours •  2.1 miles          │
│   $40-60 total •  Great for 2-4 │
│                                     │
│  Description:                       │
│  "Experience the best of West       │
│  Village in one afternoon. From     │
│  classic Italian to trendy cafes."  │
│                                     │
│  ──────────────────────             │
│  Stops (5):                         │
│                                     │
│  1️⃣ Jack's Wife Freda              │
│     Breakfast • $$ • 0mi            │
│      "Get the green shakshuka"    │
│     ⏱️ 45 min suggested             │
│     [View Restaurant →]             │
│                                     │
│  2️⃣ Blue Bottle Coffee              │
│     Coffee • $ • 0.3mi walk         │
│      "Perfect cortado"            │
│     ⏱️ 15 min                       │
│                                     │
│  3️⃣ Via Carota                      │
│     Lunch • $$ • 0.5mi              │
│      "Don't skip the cacio"       │
│     ⏱️ 1 hour                       │
│                                     │
│  [View All Stops →]                 │
│                                     │
│  Recent Crawlers                    │
│  [Avatar] [Avatar] [Avatar] +231    │
│                                     │
│  "Amazing route!" - @sarah          │
│  "Perfect Saturday plan" - @mike    │
│                                     │
│  [Start Crawl] [Invite Friends]     │
│  [Save] [Share]                     │
└─────────────────────────────────────┘
```

#### Active Crawl Mode

```
┌─────────────────────────────────────┐
│  West Village Food Hop              │
│  [▓▓▓▓▓░░░░░] Stop 3 of 5           │
│  ─────────────────────────          │
│                                     │
│  Current Stop:                      │
│  ┌─────────────────────────────┐   │
│  │ Via Carota                   │   │
│  │ [Restaurant photo]           │   │
│  │                             │   │
│  │ Italian • $$ • Open now     │   │
│  │  8.7 rating               │   │
│  │                             │   │
│  │ Must Try:                   │   │
│  │ • Cacio e pepe              │   │
│  │ • Burrata                   │   │
│  │                             │   │
│  │ Suggested time: 1 hour      │   │
│  │ ⏱️ Started 23 min ago       │   │
│  │                             │   │
│  │ Quick Notes:                │   │
│  │ "Don't skip the cacio -     │   │
│  │  it's legendary!"           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Add Photo]                     │
│  [ Rate This Stop]                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   ✓ Done, Next Stop →       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Next Stop Preview:                 │
│  Magnolia Bakery (0.4mi, 8 min walk)│
│  [Get Directions →]                 │
│                                     │
│  Group Status (3 crawling):         │
│  • You (Stop 3)                     │
│  • Sarah (Stop 3) ✓                │
│  • Mike (Stop 2)                │
│                                     │
│  [End Crawl] [View Map] [Chat]      │
└─────────────────────────────────────┘
```

#### Crawl Completion

```
┌─────────────────────────────────────┐
│   Crawl Complete!                 │
│  ─────────────────────────          │
│                                     │
│  West Village Food Hop              │
│  Completed in 3h 24min              │
│                                     │
│  [Photo collage grid of all stops]  │
│  ┌───┬───┬───┬───┬───┐             │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │             │
│  └───┴───┴───┴───┴───┘             │
│                                     │
│  Your Experience:                   │
│  [Rate this crawl: ]       │
│                                     │
│  Which was your favorite?           │
│  ○ Jack's Wife Freda                │
│  ○ Blue Bottle                      │
│  ● Via Carota                       │
│  ○ Magnolia Bakery                  │
│  ○ I Sodi                           │
│                                     │
│  Journey Stats:                     │
│   2.3 miles walked                │
│  ⏱️ 3 hours 24 minutes              │
│   $48 total spent                 │
│   12 photos taken                 │
│   8.6 avg rating                  │
│                                     │
│  Achievement Unlocked!            │
│  "West Village Explorer"            │
│  Complete 3 more crawls to unlock   │
│  "Crawl Master" badge              │
│                                     │
│  [Share Journey] [Save Photos]      │
│  [Find Similar Crawls →]            │
└─────────────────────────────────────┘
```

#### Create Crawl Screen

```
┌─────────────────────────────────────┐
│  ← Create Food Crawl                │
│  ─────────────────────────          │
│                                     │
│  Crawl Name:                        │
│  [Brooklyn Pizza Paradise___]       │
│                                     │
│  Description:                       │
│  [Tour Brooklyn's best pizza spots] │
│  [from classic to modern styles___] │
│                                     │
│  Category:                          │
│  [Cuisine ▼]                        │
│                                     │
│  Visibility:                        │
│  ○ Public  ● Private  ○ Friends     │
│                                     │
│  ──────────────────────             │
│  Stops (4):                         │
│                                     │
│  1. [Drag handle ≡]                 │
│     Di Fara Pizza                   │
│     ⏱️ 30 min |  "Classic NY"    │
│     [Edit] [Remove]                 │
│                                     │
│  2. [Drag handle ≡]                 │
│     L'Industrie                     │
│     ⏱️ 30 min |  "Trendy spot"   │
│     [Edit] [Remove]                 │
│                                     │
│  3. [Drag handle ≡]                 │
│     Roberta's                       │
│     ⏱️ 1 hour |  "Full meal"     │
│     [Edit] [Remove]                 │
│                                     │
│  4. [Drag handle ≡]                 │
│     Winner                          │
│     ⏱️ 20 min |  "Grandma slice" │
│     [Edit] [Remove]                 │
│                                     │
│  [+ Add Stop]                       │
│                                     │
│  ──────────────────────             │
│  Preview:                           │
│  [Mini map showing route]           │
│  Total: 4 stops • 2.5hrs • 4.2mi    │
│                                     │
│  [Save Draft] [Publish Crawl]       │
└─────────────────────────────────────┘
```

---

### Features & Mechanics

#### 1. **Smart Routing**
Automatic route optimization:

- **Order stops by geography** to minimize backtracking
- **Consider opening hours** (don't route to closed spots)
- **Transit/walk options** with time estimates
- **Traffic/peak time warnings** ("Via Carota has 2hr wait at 7pm")
- **Alternative routing** if user skips a stop

#### 2. **Group Crawl Mode**
Coordinate with friends:

**Features:**
- Real-time location sharing (opt-in)
- Progress sync: see where everyone is
- Group chat built-in
- Split up and meet later functionality
- Group photo album auto-collects everyone's photos
- "Wait for group" option at each stop

**Group coordination:**
```
Group Crawl: "Saturday Pizza Tour"
Members: You, Sarah, Mike, Emma

Progress:
├─ You: Stop 3 (Via Carota)
├─ Sarah: Stop 3 (Via Carota) ✓ Ready
├─ Mike: Stop 2 (Blue Bottle)  Walking to Stop 3
└─ Emma: Stop 3 (Via Carota) ✓ Ready

[Notify when everyone's here]
[Message group]
```

#### 3. **Crawl Variations**
Remix existing crawls:

- **Fork crawl**: Copy and modify
- **Swap stops**: Replace restaurants while keeping theme
- **Add/remove stops**: Customize length
- **Budget version**: Replace with cheaper alternatives
- **Dietary version**: Make vegan/GF/etc.

**Example:**
```
Original: "Ultimate Pizza Crawl" ($60, 4 stops)
Your Version: "Budget Pizza Crawl" ($20, 4 stops)
- Swapped Di Fara → Dollar slice spot
- Kept same neighborhoods
- Maintained variety
```

#### 4. **Crawl Achievements**
Gamification layer:

**Badges:**
- **First Crawl**: Complete your first food crawl
- **Crawl Regular**: Complete 5 crawls
- **Crawl Master**: Complete 25 crawls
- **Creator**: Publish 3 crawls with 50+ completions each
- **Marathon**: Complete 8+ hour crawl
- **Speed Runner**: Complete 4-stop crawl in under 2 hours
- **Photographer**: Upload 50+ photos across crawls
- **Group Leader**: Organize 10 group crawls

**Stats tracking:**
- Total crawls completed
- Miles walked on crawls
- Average crawl rating
- Favorite crawl category
- Most-crawled neighborhood
- Total spent on crawls
- Photos taken

#### 5. **Crawl Discovery Algorithm**
Personalized recommendations:

**Factors:**
- **Location**: Crawls near you
- **Past behavior**: Similar to crawls you've done
- **Cuisine preferences**: Match your top cuisines
- **Friend activity**: What friends have done
- **Trending**: Popular this week in your city
- **Weather**: Outdoor crawls in good weather
- **Time available**: Short crawls on weekdays, long on weekends

**Recommendation types:**
- "Perfect for Saturday afternoon"
- "Your friends loved this"
- "Based on your love of Italian food"
- "New crawl in your neighborhood"

---

### Data Models

```typescript
// Food Crawl Definition
interface FoodCrawl {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creator: User;

  // Categorization
  category: 'cuisine' | 'neighborhood' | 'price' | 'themed' | 'seasonal';
  cuisines: string[]; // If cuisine-focused
  neighborhoods: string[]; // Primary areas covered
  tags: string[]; // 'budget', 'romantic', 'family', 'instagram'

  // Stops
  stops: CrawlStop[];
  totalStops: number;

  // Logistics
  totalDistance: number; // miles
  estimatedDuration: number; // minutes
  estimatedCost: {
    min: number;
    max: number;
  };
  difficulty: 'easy' | 'moderate' | 'challenging'; // Based on distance/time

  // Metadata
  visibility: 'public' | 'private' | 'friends';
  featured: boolean;
  sponsoredBy?: string;
  seasonality?: {
    startMonth: number; // 1-12
    endMonth: number;
  };

  // Engagement
  completionCount: number;
  rating: number; // Average from crawlers
  reviewCount: number;
  saveCount: number; // Bookmarked

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Individual stop within crawl
interface CrawlStop {
  id: string;
  order: number; // 1-indexed position
  restaurantId: string;
  restaurant: Restaurant;

  // Guidance
  suggestedDuration: number; // minutes
  notes?: string; // Creator's notes
  mustTryDishes?: string[]; // Recommended items

  // Logistics
  distanceFromPrevious?: number; // miles
  walkingTimeFromPrevious?: number; // minutes

  // Stop-specific overrides
  arrivalTimeGuidance?: string; // "Best before 7pm to avoid crowds"
  specialInstructions?: string; // "Ask for rooftop seating"
}

// User's crawl progress
interface CrawlProgress {
  id: string;
  crawlId: string;
  userId: string;

  // Status
  status: 'planning' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
  startedAt?: Date;
  completedAt?: Date;

  // Progress
  currentStopIndex: number; // 0-indexed
  completedStops: {
    stopId: string;
    restaurantId: string;
    checkInTime: Date;
    checkOutTime?: Date;
    rating?: number;
    photos?: string[];
    notes?: string;
    skipped: boolean;
  }[];

  // Stats
  totalDuration?: number; // Actual time taken
  totalDistance?: number; // Actual distance
  totalCost?: number; // Actual spend

  // Group
  isGroupCrawl: boolean;
  groupId?: string;
  groupMembers?: string[]; // User IDs

  // Final review
  overallRating?: number;
  favoriteStop?: string; // Stop ID
  wouldRecommend?: boolean;
  publicReview?: string;
}

// Group crawl coordination
interface GroupCrawl {
  id: string;
  crawlId: string;
  organizerId: string;
  members: {
    userId: string;
    status: 'invited' | 'accepted' | 'declined' | 'left';
    currentStopIndex: number;
    lastSeen: Date;
    location?: {
      lat: number;
      lng: number;
    };
  }[];

  // Chat
  messages: {
    userId: string;
    message: string;
    timestamp: Date;
  }[];

  // Coordination
  startTime?: Date;
  meetupLocation?: string;
  groupPhotos: string[];

  status: 'planning' | 'active' | 'completed';
  createdAt: Date;
}

// Crawl review
interface CrawlReview {
  id: string;
  crawlId: string;
  userId: string;
  rating: number; // 1-5 stars
  content: string;
  favoriteStop: string; // Stop ID
  wouldRecommend: boolean;
  tags: string[]; // 'fun', 'exhausting', 'great-value', 'too-long'
  helpfulVotes: number;
  photos: string[];
  createdAt: Date;
}

// User's crawl stats
interface UserCrawlStats {
  userId: string;
  crawlsCompleted: number;
  crawlsCreated: number;
  totalMilesWalked: number;
  totalTimeSpent: number; // minutes
  averageCrawlRating: number;
  badgesEarned: CrawlBadge[];
  favoriteCategory: string;
  mostVisitedNeighborhood: string;
  totalPhotosTaken: number;
  groupCrawlsOrganized: number;
}

// Crawl achievement badges
interface CrawlBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}
```

---

### Crawl Examples (Detailed)

#### Example 1: NYC Pizza Pilgrimage

```typescript
{
  id: 'crawl-nyc-pizza-pilgrimage',
  name: 'NYC Pizza Pilgrimage',
  description: 'Experience four distinct pizza styles in one epic afternoon. From classic NY slices to wood-fired Neapolitan, this crawl showcases why NYC is pizza capital of America.',
  creatorId: 'user-pizzalover',

  category: 'cuisine',
  cuisines: ['Italian', 'Pizza'],
  neighborhoods: ['Manhattan', 'Brooklyn'],
  tags: ['classic', 'walking-heavy', 'instagram'],

  stops: [
    {
      id: 'stop-1',
      order: 1,
      restaurantId: 'rest-joes-pizza',
      suggestedDuration: 20,
      notes: 'Classic NY slice. Fold it, walk with it, embrace the grease.',
      mustTryDishes: ['Classic cheese slice', 'Pepperoni'],
      arrivalTimeGuidance: 'Before noon to avoid lunch rush'
    },
    {
      id: 'stop-2',
      order: 2,
      restaurantId: 'rest-prince-street',
      suggestedDuration: 25,
      distanceFromPrevious: 0.8,
      walkingTimeFromPrevious: 15,
      notes: 'Famous for the pepperoni square. Worth the wait.',
      mustTryDishes: ['Pepperoni square'],
      specialInstructions: 'Expect 15-20min wait during peak'
    },
    {
      id: 'stop-3',
      order: 3,
      restaurantId: 'rest-robertas',
      suggestedDuration: 60,
      distanceFromPrevious: 3.2,
      walkingTimeFromPrevious: 45,
      notes: 'Full meal here. Wood-fired perfection in Bushwick.',
      mustTryDishes: ['Bee Sting pizza', 'Margherita'],
      specialInstructions: 'Make reservation ahead'
    },
    {
      id: 'stop-4',
      order: 4,
      restaurantId: 'rest-di-fara',
      suggestedDuration: 45,
      distanceFromPrevious: 2.5,
      walkingTimeFromPrevious: 35,
      notes: 'The finale. Dom\'s masterpiece. Cash only.',
      mustTryDishes: ['Classic pie'],
      arrivalTimeGuidance: 'Weekday afternoons have shortest wait'
    }
  ],

  totalStops: 4,
  totalDistance: 6.5,
  estimatedDuration: 240, // 4 hours
  estimatedCost: {
    min: 35,
    max: 60
  },
  difficulty: 'moderate',

  visibility: 'public',
  featured: true,
  completionCount: 456,
  rating: 4.9,
  reviewCount: 234,
  saveCount: 1203,

  createdAt: new Date('2025-03-15'),
  publishedAt: new Date('2025-03-16')
}
```

#### Example 2: West Village Weekend

```typescript
{
  id: 'crawl-west-village-weekend',
  name: 'West Village Perfect Saturday',
  description: 'Spend a perfect Saturday exploring West Village\'s best spots. Breakfast, coffee, lunch, dessert, and dinner at iconic neighborhood gems.',
  creatorId: 'user-westvillagelover',

  category: 'neighborhood',
  cuisines: ['Various'],
  neighborhoods: ['West Village'],
  tags: ['full-day', 'romantic', 'instagram', 'walkable'],

  stops: [
    {
      id: 'stop-1',
      order: 1,
      restaurantId: 'rest-jacks-wife-freda',
      suggestedDuration: 60,
      notes: 'Start your day with Israeli-inspired brunch.',
      mustTryDishes: ['Green shakshuka', 'Rosewater waffles'],
      arrivalTimeGuidance: '9-10am for no wait'
    },
    {
      id: 'stop-2',
      order: 2,
      restaurantId: 'rest-blue-bottle',
      suggestedDuration: 15,
      distanceFromPrevious: 0.3,
      walkingTimeFromPrevious: 5,
      notes: 'Perfect cortado to fuel your walk.',
      mustTryDishes: ['Cortado', 'Cold brew']
    },
    {
      id: 'stop-3',
      order: 3,
      restaurantId: 'rest-via-carota',
      suggestedDuration: 90,
      distanceFromPrevious: 0.4,
      walkingTimeFromPrevious: 8,
      notes: 'Legendary Italian. No reservations, worth the wait.',
      mustTryDishes: ['Cacio e pepe', 'Burrata'],
      specialInstructions: 'Arrive by 5:30pm or 9pm to minimize wait'
    },
    {
      id: 'stop-4',
      order: 4,
      restaurantId: 'rest-magnolia-bakery',
      suggestedDuration: 20,
      distanceFromPrevious: 0.5,
      walkingTimeFromPrevious: 10,
      notes: 'Classic cupcakes. Tourist trap but delicious.',
      mustTryDishes: ['Red velvet cupcake', 'Banana pudding']
    },
    {
      id: 'stop-5',
      order: 5,
      restaurantId: 'rest-i-sodi',
      suggestedDuration: 90,
      distanceFromPrevious: 0.3,
      walkingTimeFromPrevious: 6,
      notes: 'End with phenomenal Tuscan dinner.',
      mustTryDishes: ['Tagliatelle al ragu', 'Tiramisu'],
      specialInstructions: 'Reservations essential'
    }
  ],

  totalStops: 5,
  totalDistance: 1.5,
  estimatedDuration: 420, // 7 hours (spread across day)
  estimatedCost: {
    min: 80,
    max: 120
  },
  difficulty: 'easy',

  visibility: 'public',
  featured: true,
  seasonality: {
    startMonth: 4, // April
    endMonth: 10   // October (outdoor seating weather)
  },
  completionCount: 892,
  rating: 4.8,
  reviewCount: 456,
  saveCount: 2341
}
```

#### Example 3: $20 Budget Crawl

```typescript
{
  id: 'crawl-budget-20',
  name: '$20 Food Tour Challenge',
  description: 'Prove that great food doesn\'t need a big budget. Five stops, $4 each, incredible variety.',
  creatorId: 'user-budgeteats',

  category: 'price',
  cuisines: ['Various'],
  neighborhoods: ['Manhattan', 'Queens'],
  tags: ['budget', 'value', 'diverse', 'fun-challenge'],

  stops: [
    {
      order: 1,
      restaurantId: 'rest-halal-guys',
      suggestedDuration: 20,
      notes: 'Legendary halal cart. Get the combo platter.',
      mustTryDishes: ['Chicken and rice combo'],
      estimatedCost: 8
    },
    {
      order: 2,
      restaurantId: 'rest-xian-famous-foods',
      suggestedDuration: 25,
      distanceFromPrevious: 1.2,
      notes: 'Spicy cumin lamb noodles under $10.',
      mustTryDishes: ['Liang pi cold-skin noodles'],
      estimatedCost: 7
    },
    {
      order: 3,
      restaurantId: 'rest-levain-bakery',
      suggestedDuration: 10,
      distanceFromPrevious: 0.8,
      notes: 'Splurge on half a cookie to share.',
      mustTryDishes: ['Chocolate chip walnut cookie'],
      estimatedCost: 3
    },
    {
      order: 4,
      restaurantId: 'rest-dollar-slice',
      suggestedDuration: 15,
      distanceFromPrevious: 0.5,
      notes: 'Classic NYC dollar slice.',
      mustTryDishes: ['Two plain slices'],
      estimatedCost: 2
    }
  ],

  totalStops: 4,
  totalDistance: 2.5,
  estimatedDuration: 120,
  estimatedCost: {
    min: 18,
    max: 22
  },
  difficulty: 'easy',

  visibility: 'public',
  featured: false,
  completionCount: 234,
  rating: 4.7,
  reviewCount: 123
}
```

---

### Social Features

#### 1. **Feed Integration**
Crawl activities appear in social feed:

```
[User Avatar] @username
 Completed "West Village Perfect Saturday"!
5 stops • 7 hours • Amazing day 

Favorite: Via Carota - that cacio e pepe! 

[Photo carousel from all 5 stops]

[Comment] [Like] [Save Crawl] [Try This Crawl]
```

#### 2. **Live Crawl Sharing**
Real-time updates as you crawl:

```
@username is crawling "NYC Pizza Pilgrimage"
Currently at: Prince Street Pizza (Stop 2 of 4)

[Live photo from current stop]

"That pepperoni square though! "

[Follow Along] [Join Them]
```

#### 3. **Crawl Invitations**
Invite friends via:

- In-app notification
- Text message: "Join me for 'Taco Tour' this Saturday!"
- Calendar invite with all stops
- Group chat link

#### 4. **Comparative Reviews**
Compare experiences:

```
"NYC Pizza Pilgrimage"
Your rating: 
Sarah's rating: 

Your favorite: Di Fara
Sarah's favorite: Roberta's

Compare photos side-by-side →
```

---

### Success Metrics

**Engagement:**
- Crawls started per week
- Completion rate (started vs finished)
- Average crawl duration
- Repeat crawler rate

**Discovery:**
- New restaurants discovered via crawls
- Crawl-driven restaurant bookmarks
- Cross-neighborhood exploration increase

**Social:**
- Group crawls percentage
- Crawls shared to feed
- Friend invitations sent
- User-generated crawls published

**Creation:**
- Crawls created per user
- Published vs private crawls
- Average crawl rating
- Most popular crawl categories

---

### Implementation Phases

**Phase 1: Core Crawl Experience (Week 1-2)**
- Crawl data models
- Crawl discovery & detail screens
- Active crawl mode (solo)
- Stop check-ins & progress tracking
- Completion & sharing

**Phase 2: Crawl Creation (Week 3)**
- Create crawl flow
- Stop management (add, reorder, remove)
- Map preview & routing
- Publish/save draft
- Edit existing crawls

**Phase 3: Group Crawls (Week 4)**
- Group crawl invitations
- Real-time progress sync
- Group chat
- Shared photo albums
- Coordination features

**Phase 4: Advanced Features (Week 5)**
- Crawl variations (fork/remix)
- Smart routing optimization
- Seasonal/time-based crawls
- Sponsored crawls with perks
- Accessibility info per crawl

---

## Data Models

### Shared Type Extensions

The three features extend existing types:

```typescript
// Add to User type
interface User {
  // ... existing fields
  luckySpinStats?: LuckySpinStats;
  huntStats?: UserHuntStats;
  crawlStats?: UserCrawlStats;
}

// Add to UserStats type
interface UserStats {
  // ... existing fields
  luckySp insUsed?: number;
  huntsCompleted?: number;
  crawlsCompleted?: number;
  achievementPoints?: number; // From hunts
}

// Add to Restaurant type
interface Restaurant {
  // ... existing fields
  appearsInCrawls?: number; // How many crawls feature this
  huntEligible?: string[]; // Hunt IDs this qualifies for
}

// Add to FeedItem types
type FeedItem = {
  // ... existing types
  | { type: 'lucky_spin'; restaurant: Restaurant; }
  | { type: 'hunt_progress'; hunt: ScavengerHunt; checkpoint: number; }
  | { type: 'hunt_complete'; hunt: ScavengerHunt; }
  | { type: 'crawl_started'; crawl: FoodCrawl; }
  | { type: 'crawl_complete'; crawl: FoodCrawl; favoriteStop: Restaurant; }
}
```

---

## Integration Points

### 1. **Navigation Structure**

Add new screens to existing bottom tab navigation:

```typescript
// Current tabs: Feed, Lists, Search, Leaderboard, Profile

// Add to hamburger menu (SettingsHubScreen):
{
  icon: '',
  title: 'Lucky Spin',
  screen: 'LuckySpinScreen'
},
{
  icon: '',
  title: 'Scavenger Hunts',
  screen: 'ScavengerHuntsScreen',
  badge: activeHuntsCount
},
{
  icon: '',
  title: 'Food Crawls',
  screen: 'FoodCrawlsScreen',
  badge: savedCrawlsCount
}
```

### 2. **Leaderboard Integration**

Extend `LeaderboardScreen` with new tabs:

```typescript
type TabType = 'Been' | 'Influence' | 'Notes' | 'Photos' | 'Hunts' | 'Crawls';

// New leaderboard views:
// - Hunts: Sort by hunts completed, achievement points
// - Crawls: Sort by crawls completed, miles walked
```

### 3. **Profile Integration**

Add sections to `ProfileScreen`:

```
┌─────────────────────────────────────┐
│  [User Avatar & Stats]              │
│  ─────────────────────────          │
│  Achievements                       │
│   8 Hunt Badges                   │
│   12 Crawls Completed             │
│   23 Lucky Finds                  │
│  [View All →]                       │
│  ─────────────────────────          │
│  Recent Activity                    │
│  ...                                │
└─────────────────────────────────────┘
```

### 4. **Search Integration**

Add filters to `SearchScreen`:

```
Filters:
- [x] On my hunts
- [x] Part of crawls I saved
- [x] Lucky Spin eligible (matches constraints)
```

### 5. **Feed Integration**

New feed item types with custom cards:

- Lucky Spin result post
- Hunt checkpoint progress
- Hunt completion celebration
- Crawl start announcement
- Crawl completion summary

### 6. **Notification Integration**

New notification types:

```typescript
type NotificationType =
  | ... existing types
  | 'hunt_checkpoint'      // You completed a checkpoint
  | 'hunt_complete'        // You finished a hunt!
  | 'hunt_overtaken'       // Someone passed you on leaderboard
  | 'hunt_new'             // New hunt matching your interests
  | 'crawl_invitation'     // Friend invited you to crawl
  | 'crawl_member_arrived' // Group member arrived at stop
  | 'lucky_spin_reminder'  // "You have lucky finds you haven't visited"
```

---

## Implementation Priorities

### Recommended Build Order

Based on complexity, user value, and interdependencies:

#### **Phase 1: Lucky Spin (Week 1)**
**Why first:**
- Simplest feature (single screen + result)
- Quick win for engagement
- Tests random restaurant selection logic
- Low dependencies on other features

**Deliverables:**
- Lucky Spin main screen
- Constraint filters
- Spin animation
- Result card
- Save to want-to-try integration
- Lucky finds history

**Estimated effort:** 40 hours

---

#### **Phase 2: Food Crawl (Week 2-4)**
**Why second:**
- Medium complexity
- High user value (shareable experiences)
- Tests multi-stop navigation logic
- Requires mapping/routing features

**Deliverables:**
- Crawl discovery screen
- Crawl detail screen
- Active crawl mode
- Check-in functionality
- Completion & sharing
- Basic crawl creation
- Group crawl support

**Estimated effort:** 120 hours

---

#### **Phase 3: Scavenger Hunt (Week 5-8)**
**Why last:**
- Most complex feature
- Requires leaderboard integration
- Needs achievement/badge system
- Prize/reward infrastructure
- Benefits from crawl's multi-stop logic

**Deliverables:**
- Hunt discovery & detail
- Hunt progress tracking
- Checkpoint completion logic
- Leaderboard integration
- Badge system
- Hunt creation (admin)
- User-generated hunts (later)

**Estimated effort:** 160 hours

---

### Total Development Timeline

**12 weeks total for all three features:**

```
Week 1:     Lucky Spin (complete)
Week 2-4:   Food Crawl (core + group)
Week 5-8:   Scavenger Hunt (core + badges)
Week 9-10:  Polish & bug fixes
Week 11:    Integration testing
Week 12:    Beta testing & launch prep
```

---

## Technical Considerations

### 1. **Data Persistence**

Mock data structure for development:

```
/src/data/mock/
  luckySpins.ts        // Lucky spin sessions & stats
  scavengerHunts.ts    // Hunt definitions & user progress
  foodCrawls.ts        // Crawl definitions & user progress
  achievements.ts      // Badges, rewards, achievements
```

Production: Add to `MockDataService` methods:

```typescript
// Lucky Spin
static async spinForRestaurant(constraints: SpinConstraints): Promise<Restaurant>
static async getLuckySpinHistory(userId: string): Promise<LuckyFind[]>
static async getLuckySpinStats(userId: string): Promise<LuckySpinStats>

// Scavenger Hunt
static async getActiveHunts(): Promise<ScavengerHunt[]>
static async getHuntProgress(huntId: string, userId: string): Promise<HuntProgress>
static async completeHuntCheckpoint(huntId: string, userId: string, objectiveId: string): Promise<void>
static async getHuntLeaderboard(huntId: string): Promise<HuntLeaderboard>

// Food Crawl
static async getNearbyentCrawls(location: Coordinates): Promise<FoodCrawl[]>
static async startCrawl(crawlId: string, userId: string): Promise<CrawlProgress>
static async checkInToStop(progressId: string, stopId: string): Promise<void>
static async completeCrawl(progressId: string): Promise<CrawlReview>
```

### 2. **Performance Optimization**

**Lucky Spin:**
- Pre-filter eligible restaurants client-side
- Cache constraint presets
- Optimize animation (use `Animated.timing`)

**Scavenger Hunt:**
- Lazy load hunt details
- Paginate leaderboards (top 100 + user)
- Cache user's active hunts

**Food Crawl:**
- Lazy load crawl images
- Prefetch next stop data
- Cache map tiles
- Debounce location updates in group mode

### 3. **Offline Support**

**Lucky Spin:**
- Cache last 50 eligible restaurants
- Allow spin without network (from cache)
- Queue saves for when online

**Scavenger Hunt:**
- Download active hunt data
- Offline progress tracking
- Sync when online

**Food Crawl:**
- Download active crawl data & maps
- Offline check-ins
- Sync photos when online

### 4. **Analytics Events**

Track key user actions:

```typescript
// Lucky Spin
analytics.track('lucky_spin_executed', { constraints, result })
analytics.track('lucky_spin_saved', { restaurantId })
analytics.track('lucky_spin_visited', { restaurantId, rating })

// Scavenger Hunt
analytics.track('hunt_joined', { huntId })
analytics.track('hunt_checkpoint_completed', { huntId, checkpointIndex })
analytics.track('hunt_completed', { huntId, duration, rank })

// Food Crawl
analytics.track('crawl_started', { crawlId, isGroup })
analytics.track('crawl_stop_checked_in', { crawlId, stopIndex })
analytics.track('crawl_completed', { crawlId, duration, rating })
```

### 5. **Design System Consistency**

Use existing components where possible:

**Reusable from current codebase:**
- `RestaurantCard` - Spin results, hunt checkpoints, crawl stops
- `RatingBubble` - Ratings throughout
- `Avatar` - User profiles in hunts/crawls
- `Screen`, `Card`, `Button` - Layout primitives
- `LoadingSpinner` - Spin animation, loading states
- `Badge` - Achievement badges, hunt badges

**New components needed:**
- `SlotMachine` - Lucky Spin animation
- `ProgressBar` - Hunt/crawl progress
- `RouteMap` - Crawl route visualization
- `CheckpointList` - Hunt objectives
- `CrawlStopCard` - Individual stop in crawl
- `BadgeShowcase` - Achievement display

### 6. **Accessibility**

Ensure features are accessible:

**Lucky Spin:**
- Screen reader announcements for spin result
- Haptic feedback on spin
- High contrast mode for constraints

**Scavenger Hunt:**
- Progress announcements
- Badge descriptions
- Leaderboard screen reader support

**Food Crawl:**
- Turn-by-turn navigation descriptions
- Stop completion announcements
- Photo alt text support

---

## 4. New Openings Discovery

### Overview
A dedicated feature to discover, track, and be first to try newly opened restaurants. Appeals to early adopters, trendsetters, and users who want to stay ahead of the curve.

### Problem It Solves
- New restaurants are hard to discover before they get crowded
- Users miss openings in their neighborhoods
- No central place to track "opening soon" spots
- FOMO when friends visit new places first
- Hard to filter established vs brand new restaurants

### User Personas

**The Early Adopter**
- Wants to be first to try new spots
- Posts about new restaurants before they trend
- Enjoys discovering hidden gems early
- Values being "in the know"

**The Neighborhood Loyalist**
- Tracks new openings in their area
- Supports local businesses early
- Wants to welcome new restaurants
- Cares about neighborhood evolution

**The Foodie Influencer**
- Creates content around new openings
- Builds audience by being first to review
- Gets invited to soft openings/press events
- Wants exclusive access

**The Completionist**
- Tries to visit every new opening
- Tracks "opened this month" as a challenge
- Maintains comprehensive local knowledge
- Achieves "first reviewer" status

---

### Feature Components

#### 1. **New Openings Feed/Tab**

Primary discovery interface for new restaurants.

**Location Options:**
- **Dedicated Tab**: New bottom navigation tab (Feed | Lists | Search | **New** | Leaderboard | Profile)
- **Feed Section**: Prominent section at top of main Feed
- **Search Filter**: Filter in SearchScreen for "Opened in last 30 days"
- **Hybrid**: Section in Feed + filter in Search (recommended)

#### 2. **Opening Timeline Tracking**

Track restaurant lifecycle stages:

```typescript
type OpeningStatus =
  | 'coming_soon'      // Announced, not yet open
  | 'soft_opening'     // Invite-only/preview period
  | 'now_open'         // First 30 days
  | 'recently_opened'  // 30-90 days
  | 'established';     // 90+ days

interface RestaurantOpening {
  restaurantId: string;
  status: OpeningStatus;
  announcedDate?: Date;
  softOpeningDate?: Date;
  grandOpeningDate: Date;
  daysOpen: number;

  // Pre-opening info
  expectedOpening?: string; // "Late November 2025"
  acceptingReservations: boolean;
  pressCoverage?: PressArticle[];

  // Opening buzz
  anticipationScore: number; // How many users want to try
  firstReviewers: User[]; // First 10 to visit
  earlyReviewCount: number;
}
```

---

### User Flow

#### New Openings Discovery

```
1. User opens "New Openings" section
   ↓
2. See tabs:
   - Now Open (0-30 days)
   - Coming Soon (announced but not open)
   - Recently Opened (30-90 days)
   ↓
3. Filter by:
   - Distance from me
   - Neighborhood
   - Cuisine
   - Price range
   ↓
4. Browse cards with:
   - Restaurant info
   - "Opened X days ago"
   - Early reviews count
   - "Be the first to try!"
   ↓
5. Tap restaurant for details
   ↓
6. Options:
   - Add to Want-to-Try
   - Set "Opening Alert"
   - Mark as "Visited"
   - "Notify friends"
```

#### Coming Soon Tracking

```
1. User discovers "Coming Soon" restaurant
   ↓
2. Views details:
   - Expected opening date
   - Behind-the-scenes info
   - Chef/owners
   - Menu previews
   - Construction photos
   ↓
3. Set alert:
   - "Notify me when open"
   - Calendar reminder
   ↓
4. Opening day arrives
   ↓
5. Push notification:
   " [Restaurant] just opened!
   Be one of the first to visit."
   ↓
6. Direct link to reservation/details
```

---

### UI Design Specification

#### New Openings Screen (Main)

```
┌─────────────────────────────────────┐
│  ✨ New Openings                    │
│  ─────────────────────────          │
│                                     │
│  [Now Open] [Coming Soon] [Recent]  │
│                                     │
│  Filter by:                         │
│   Within [2 miles ▼]              │
│   All Cuisines ▼                 │
│                                     │
│  ──────────────────────             │
│  OPENED THIS WEEK                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Restaurant photo]           │   │
│  │                             │   │
│  │ Casa Luna                   │   │
│  │ Italian • $$ • West Village │   │
│  │                             │   │
│  │  Opened 3 days ago        │   │
│  │  12 people want to try    │   │
│  │  2 early reviews (8.5 avg)│   │
│  │                             │   │
│  │ "Modern Italian with house  │   │
│  │  pasta. Chef from Via Carota"│   │
│  │                             │   │
│  │ [First to Try!] [Add to List]│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ The Midnight Kitchen         │   │
│  │  Opened 5 days ago         │   │
│  │  7 reviews • Be #8!        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ──────────────────────             │
│  OPENING SOON                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Noodle Theory               │   │
│  │  Opening Dec 15, 2025     │   │
│  │ 156 watching                │   │
│  │ [Set Alert ]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [View All New Openings →]          │
└─────────────────────────────────────┘
```

#### New Opening Detail View

```
┌─────────────────────────────────────┐
│  ← Casa Luna                        │
│  ─────────────────────────          │
│                                     │
│  [Hero restaurant image]            │
│  ┌───────────────────┐              │
│  │  OPENED 3 DAYS AGO │           │
│  └───────────────────┘              │
│                                     │
│  Casa Luna                          │
│  Italian • $$ • West Village        │
│   0.8 miles away                  │
│                                     │
│  Opening Stats:                     │
│  🗓️ Opened: Oct 24, 2025           │
│   12 people on want-to-try        │
│   2 early reviews (8.5 avg)       │
│   Be among first 50 reviewers!    │
│                                     │
│  About:                             │
│  "Modern Italian restaurant from    │
│  former Via Carota chef. House-made │
│  pasta, wood-fired pizzas, natural  │
│  wine program."                     │
│                                     │
│  What We Know:                      │
│  ✓ Reservations on Resy             │
│  ✓ Walk-ins welcome                 │
│  ✓ Open Tue-Sun, 5-11pm             │
│  ✓ Full bar program                 │
│                                     │
│  Press Coverage:                    │
│   "Hotly anticipated opening"     │
│     - Eater NY, Oct 20              │
│   "Chef's new venture"            │
│     - Grub Street, Oct 15           │
│                                     │
│  First Reviewers:                   │
│  [Avatar] @sarah: "Amazing!" 9.0    │
│  [Avatar] @mike: "Solid start" 8.0  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Be a First Reviewer!      │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Add to Want-to-Try]               │
│  [Reserve on Resy →]                │
│  [Share with Friends]               │
└─────────────────────────────────────┘
```

#### Coming Soon Preview

```
┌─────────────────────────────────────┐
│  ← Noodle Theory                    │
│  ─────────────────────────          │
│                                     │
│  [Construction/concept photo]       │
│  ┌───────────────────────┐          │
│  │  OPENING DEC 15, 2025 │        │
│  │    22 days away         │        │
│  └───────────────────────┘          │
│                                     │
│  Noodle Theory                      │
│  Ramen • $$ • Lower East Side       │
│   1.2 miles from you              │
│                                     │
│  156 people watching                │
│  [Set Opening Alert ]             │
│                                     │
│  What We Know:                      │
│  "Modern ramen shop from Tokyo-     │
│  trained chef. Focus on regional    │
│  Japanese ramen styles."            │
│                                     │
│  Concept:                           │
│  ✓ 4 signature ramen styles         │
│  ✓ Counter seating (18 seats)       │
│  ✓ No reservations                  │
│  ✓ Lunch & dinner                   │
│                                     │
│  Behind the Scenes:                 │
│  [Progress photo gallery]           │
│  Oct 20: Interior construction      │
│  Oct 15: Equipment install          │
│  Oct 1: Build-out begins            │
│                                     │
│  Press Buzz:                        │
│   "Most anticipated winter opening"│
│     - Eater, Oct 10                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Add to Calendar            │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Get Notified] [Share]             │
└─────────────────────────────────────┘
```

---

### Features & Mechanics

#### 1. **Opening Alerts System**

Proactive notifications for new restaurants:

**Alert Types:**
- **Now Open**: " [Restaurant] just opened today!"
- **Coming Soon Reminder**: " [Restaurant] opens in 3 days"
- **Soft Opening Invite**: " [Restaurant] soft opening this weekend"
- **Friend Visited**: " Sarah just visited [New Restaurant]"
- **First 50 Opportunity**: " Only 12 reviews, be in first 50!"

**Alert Preferences:**
```typescript
interface OpeningAlertPreferences {
  userId: string;
  enabled: boolean;

  // What to alert about
  alertTypes: {
    newOpenings: boolean;           // Any new opening
    neighborhoodOpenings: boolean;  // In my neighborhoods
    cuisineOpenings: boolean;       // My favorite cuisines
    friendVisits: boolean;          // When friends visit new spots
    softOpenings: boolean;          // Invitation-only previews
  };

  // Where to look
  neighborhoods: string[];          // Alert for these areas
  cuisines: string[];               // Alert for these cuisines
  maxDistance: number;              // Miles from current location

  // Frequency
  frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
  quietHours: {
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}
```

#### 2. **First Reviewer Badges**

Gamification for being early:

**Badges:**
- **First!** - Very first review (legendary)
- **Top 10** - Among first 10 reviewers (epic)
- **Top 50** - Among first 50 reviewers (rare)
- **Opening Week** - Visited during opening week (common)
- **Early Adopter** - Visited 10+ restaurants in first month (epic)
- **Neighborhood Scout** - First to try 5+ in same neighborhood (rare)

**Badge Display:**
- Shows on review: " First reviewer!"
- Profile showcase section
- Leaderboard category
- Special profile flair

#### 3. **Anticipation Tracking**

Measure buzz before opening:

**Anticipation Score Factors:**
- Want-to-try adds
- "Set alert" count
- Social media mentions
- Press coverage
- Chef/restaurant pedigree
- Comments/discussions

**Visualizations:**
```
Noodle Theory
 Anticipation: 8.5/10
 156 watching
 23 comments
 4 press articles
```

#### 4. **Opening Timeline**

Visual timeline of restaurant lifecycle:

```
┌─────────────────────────────────────┐
│  Casa Luna Timeline                 │
│  ─────────────────────────          │
│                                     │
│   Aug 2025: Announced             │
│     "Chef announces new project"    │
│                                     │
│   Sep 2025: Build-out             │
│     Construction progress photos    │
│                                     │
│   Oct 15: Press preview           │
│     Reviews from media              │
│                                     │
│   Oct 20: Soft opening            │
│     Invite-only preview             │
│                                     │
│   Oct 24: Grand opening ← NOW     │
│     Open to public                  │
│     12 reviews (8.5 avg)            │
│                                     │
│  Future:                            │
│  Nov 24: Established (30 days)      │
└─────────────────────────────────────┘
```

#### 5. **Neighborhood Opening Heatmap**

Visualize where new restaurants are opening:

**Features:**
- Interactive map with pins
- Color-coded by opening date
- Filter by cuisine/price
- "Hot neighborhoods" ranking
- Cluster view vs individual pins

**Insights:**
```
Opening Hotspots (This Month):
1. West Village (8 new openings)
2. Williamsburg (6 new openings)
3. Lower East Side (5 new openings)

Trending Cuisines:
1. Italian (12 openings)
2. Japanese (8 openings)
3. Mexican (7 openings)
```

#### 6. **Opening Week Events**

Track special opening promotions:

```typescript
interface OpeningEvent {
  restaurantId: string;
  eventType: 'soft_opening' | 'grand_opening' | 'preview_night' | 'special_menu';
  date: Date;
  duration: number; // days

  // Special offers
  offer?: {
    type: 'free_dish' | 'discount' | 'complimentary' | 'gift';
    description: string;
    restrictions?: string;
  };

  // RSVP
  requiresRSVP: boolean;
  rsvpLink?: string;
  capacity?: number;
  attendees?: string[]; // User IDs
}
```

**Example Event Card:**
```
 SOFT OPENING EVENT

Casa Luna Preview Night
Oct 20, 2025 • 6-10pm

• Complimentary appetizer
• Meet the chef
• First look at menu
• RSVP required (50 spots)

[RSVP Now] [Add to Calendar]
```

#### 7. **Press & Media Integration**

Aggregate opening coverage:

**Sources:**
- Eater
- Grub Street
- Infatuation
- Local food blogs
- Instagram posts (tagged)
- TikTok videos

**Display:**
```
Press Coverage (4 articles):

 "The 10 Most Anticipated..."
    Eater NY • Oct 15
    [Read article →]

 "Chef's Long-Awaited Return"
    Grub Street • Oct 10
    [Read article →]

 Social Buzz:
    23 Instagram posts
    8 TikTok videos
    [View social →]
```

---

### Data Models

```typescript
// Restaurant opening information
interface RestaurantOpening {
  restaurantId: string;
  restaurant: Restaurant;

  // Opening status
  status: 'coming_soon' | 'soft_opening' | 'now_open' | 'recently_opened' | 'established';

  // Important dates
  announcedDate?: Date;
  softOpeningDate?: Date;
  grandOpeningDate: Date;
  establishedDate?: Date; // 90 days after grand opening

  // Timing
  daysUntilOpen?: number; // For coming soon
  daysOpen?: number; // For now open
  expectedOpeningMonth?: string; // "November 2025" for vague dates

  // Pre-opening info
  comingSoonDetails?: {
    description: string;
    chef: string;
    concept: string;
    menu: string[];
    constructionPhotos: string[];
    socialMedia: {
      instagram?: string;
      website?: string;
    };
  };

  // Buzz metrics
  anticipationScore: number; // 0-10
  watchingCount: number; // Users who set alerts
  wantToTryCount: number; // Added before opening
  pressCoverage: PressArticle[];
  socialMentions: number;

  // Early reviews
  firstReviewers: {
    userId: string;
    user: User;
    reviewDate: Date;
    rating: number;
    rank: number; // 1 = first, 2 = second, etc.
  }[];
  earlyReviewCount: number;
  earlyReviewAverage: number;

  // Events
  openingEvents?: OpeningEvent[];

  // Metadata
  createdBy?: string; // User who added to DB
  verified: boolean; // Admin verified opening info
  lastUpdated: Date;
}

// Press article reference
interface PressArticle {
  id: string;
  publication: string;
  title: string;
  url: string;
  publishedDate: Date;
  excerpt?: string;
}

// User's opening preferences
interface OpeningAlertPreferences {
  userId: string;
  enabled: boolean;

  alertTypes: {
    newOpenings: boolean;
    neighborhoodOpenings: boolean;
    cuisineOpenings: boolean;
    friendVisits: boolean;
    softOpenings: boolean;
  };

  neighborhoods: string[];
  cuisines: string[];
  maxDistance: number;

  frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
  quietHours: {
    start: string;
    end: string;
  };
}

// Opening event
interface OpeningEvent {
  id: string;
  restaurantId: string;
  eventType: 'soft_opening' | 'grand_opening' | 'preview_night' | 'special_menu' | 'chef_meet';
  name: string;
  description: string;
  date: Date;
  endDate?: Date;

  offer?: {
    type: 'free_dish' | 'discount' | 'complimentary' | 'gift';
    description: string;
    restrictions?: string;
  };

  requiresRSVP: boolean;
  rsvpLink?: string;
  capacity?: number;
  attendees: string[]; // User IDs who RSVP'd

  visibility: 'public' | 'invite_only' | 'friends';
}

// First reviewer badge
interface FirstReviewerBadge {
  id: string;
  userId: string;
  restaurantId: string;
  rank: number; // 1-50
  badgeType: 'first' | 'top_10' | 'top_50' | 'opening_week';
  earnedAt: Date;
  displayOnProfile: boolean;
}

// User's opening stats
interface UserOpeningStats {
  userId: string;

  // Visit stats
  newRestaurantsVisited: number; // Within 30 days of opening
  firstReviews: number; // Times they were #1
  top10Reviews: number; // Times in top 10
  top50Reviews: number; // Times in top 50

  // Discovery stats
  comingSoonTracked: number; // Restaurants they tracked before opening
  openingAlertsSet: number;
  alertConversionRate: number; // % of alerts that led to visits

  // Badges
  badges: FirstReviewerBadge[];

  // Preferences
  favoriteOpeningNeighborhood: string; // Where they try most new places
  averageVisitDelay: number; // Days after opening before visiting
}

// Opening digest (for weekly emails/notifications)
interface OpeningDigest {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };

  newlyOpened: RestaurantOpening[]; // Opened this week
  openingSoon: RestaurantOpening[]; // Opening next week
  trending: RestaurantOpening[]; // High anticipation
  friendVisited: {
    friend: User;
    restaurant: RestaurantOpening;
    rating: number;
  }[];

  neighborhoodActivity: {
    neighborhood: string;
    openingCount: number;
  }[];
}
```

---

### Integration Points

#### 1. **Feed Integration**

New opening cards in main feed:

```
Feed Items:
┌─────────────────────────────────────┐
│  NEW OPENING                      │
│ Casa Luna opened 3 days ago!        │
│ [Restaurant card]                   │
│ Be among first 50 reviewers         │
│ [First to Try] [Add to List]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  OPENING SOON                     │
│ Noodle Theory opens Dec 15          │
│ 156 people waiting                  │
│ [Set Alert]                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  @sarah was FIRST to review       │
│ Casa Luna (Opened Oct 24)           │
│ "Amazing pasta! 9.0"       │
│ [View Review]                       │
└─────────────────────────────────────┘
```

#### 2. **Search Filters**

Add to existing SearchScreen:

```
Filters:
☐ Open Now
☐ Accepts Reservations
☐ Outdoor Seating
☑ New Openings (Last 30 days)
☐ Opening Soon

Sort by:
○ Relevance
○ Distance
○ Rating
● Opening Date (Newest first)
```

#### 3. **Lists Integration**

New list type:

```
List Types:
- Been
- Want to Try
- Recommended
- [NEW] Trying This Month (Auto-populates with new openings you want to try)
```

#### 4. **Profile Badges**

Display opening achievements:

```
Profile → Achievements:

 Opening Pioneer
├─ First Reviewer: 3 times
├─ Top 10: 12 times
├─ Top 50: 23 times
└─ Early Adopter: 45 new restaurants
```

#### 5. **Leaderboard Tab**

New leaderboard category:

```
Leaderboard Tabs:
- Been
- Influence
- Notes
- Photos
- Hunts
- [NEW] Early Adopter

Early Adopter Leaderboard:
Ranked by:
- First reviews (3x weight)
- Top 10 reviews (2x weight)
- Top 50 reviews (1x weight)
- New restaurants visited this month
```

#### 6. **Notifications**

New notification types:

```typescript
type NotificationType =
  | ... existing types
  | 'restaurant_opened'      // Alert you set triggered
  | 'opening_tomorrow'       // Reminder
  | 'friend_first_review'    // Friend was first
  | 'soft_opening_invite'    // Exclusive preview
  | 'opening_milestone'      // "You've tried 10 new openings!"
```

---

### Success Metrics

**Engagement:**
- Alert conversion rate (alert → visit)
- Average time from opening to user visit
- New restaurant discovery rate
- Coming soon tracking participation

**Content:**
- First reviewer participation
- Early reviews (within 30 days)
- Photo uploads for new restaurants
- Opening event RSVPs

**Retention:**
- Weekly return for new opening checks
- Alert preference opt-in rate
- Badge collection engagement
- Opening digest open rate

**Discovery:**
- % of new restaurants discovered via this feature
- Cross-neighborhood exploration
- Cuisine diversity in new openings tried

---

### Implementation Phases

**Phase 1: Core Discovery (Week 1)**
- New openings data model
- Basic "New Openings" feed/filter
- Opening date tracking
- "Opened X days ago" badges
- Search filter for new restaurants

**Phase 2: Alerts & Tracking (Week 2)**
- Coming Soon restaurants
- Alert system (opening notifications)
- Want-to-try integration
- User preferences for alerts

**Phase 3: First Reviewer Gamification (Week 3)**
- First reviewer detection
- Badges (First, Top 10, Top 50)
- Profile badge showcase
- Leaderboard category

**Phase 4: Enhanced Discovery (Week 4)**
- Opening timeline view
- Press coverage integration
- Anticipation scoring
- Neighborhood heatmap
- Opening events

**Phase 5: Social & Advanced (Week 5)**
- Friend visit notifications
- Opening digest emails
- Soft opening invites
- User-submitted openings
- Admin verification tools

---

### Alternative: Filter-Only Approach

If a dedicated screen is too much, start with filters:

**Minimal Version:**

1. **Search Filter**
```
SearchScreen → Filters:
☑ New Openings (0-30 days)
☐ Opening Soon
```

2. **Feed Section**
```
FeedScreen → Top section:
" New This Week (3)"
[Horizontal scroll of new restaurants]
```

3. **Restaurant Badge**
```
RestaurantCard:
┌─────────────────────┐
│ Casa Luna           │
│ [ 3 days old]     │
│ Italian • $$        │
└─────────────────────┘
```

4. **Notification**
```
Push notification:
" 2 new restaurants opened near you this week!"
[View New Openings]
```

**Pros of filter-only:**
- Simpler implementation
- Less UI complexity
- Lower maintenance
- Still provides value

**Cons:**
- Less discoverable
- No anticipation tracking
- No gamification
- Misses "coming soon" value

**Recommendation:** Start with full feature if development resources allow. New openings are a major discovery driver and warrant dedicated attention. The gamification layer (first reviewer badges) creates sticky engagement.

---

## Future Enhancements

Ideas for v2.0 of these features:

### Lucky Spin
- **AI Learning**: Adjust randomness based on successful spins
- **Themed Spins**: "Date Night Spin", "Adventure Spin", "Comfort Food Spin"
- **Spin Challenges**: "Accept this random pick" weekly challenges
- **Spin Roulette**: Multiple friends spin, highest rating wins

### Scavenger Hunt
- **Team Hunts**: Groups compete for prizes
- **Location-Based Hunts**: AR check-ins at restaurants
- **Dynamic Hunts**: Objectives change based on season/availability
- **Hunt Marketplace**: Buy/sell rare badges
- **Corporate Hunts**: Company team-building events

### Food Crawl
- **Audio Tour Mode**: Guided audio at each stop
- **AR Navigation**: Augmented reality directions
- **Live Events**: Organized group crawls with guides
- **Crawl Challenges**: Speed runs, photography contests
- **Crawl Subscriptions**: Monthly curated crawls

### Smart Timing & Wait Intelligence
- **Predictive Wait Times**: Machine learning for more accurate predictions
- **Dynamic Pricing Alerts**: Notify when restaurants offer off-peak discounts
- **Weather Impact**: Adjust predictions based on weather conditions
- **Event-Based Intelligence**: Factor in local events, concerts, sports games
- **Personalized Timing**: Learn individual preferences for crowd levels

---

## Conclusion

These five features create a comprehensive engagement ecosystem:

- **Lucky Spin**: Daily spontaneous engagement
- **Scavenger Hunt**: Long-term competitive goals
- **Food Crawl**: Social weekend experiences
- **New Openings**: Early adopter discovery & FOMO prevention
- **Smart Timing**: Optimize visit timing & avoid waits

Together they address:
- ✅ Decision fatigue (Lucky Spin)
- ✅ Power user retention (Scavenger Hunt)
- ✅ Social experiences (Food Crawl)
- ✅ Discovery motivation (All five)
- ✅ Early adopter needs (New Openings)
- ✅ FOMO prevention (New Openings alerts)
- ✅ Content generation (All five create feed posts)
- ✅ Neighborhood exploration (New Openings + Food Crawl)
- ✅ Time optimization (Smart Timing)
- ✅ Wait avoidance (Smart Timing + all features)
- ✅ Experience quality (Smart Timing guides to best times)

**Recommended Build Order:**
1. **Lucky Spin** (Week 1) - Quick win, simple implementation
2. **Smart Timing (Basic)** (Week 2-3) - Wait time badges, basic patterns
3. **New Openings Filter** (Week 4) - High value, filter-only version first
4. **Food Crawl** (Week 5-7) - Complex but high social value with timing integration
5. **Smart Timing (Advanced)** (Week 8-10) - Alerts, reservation intelligence, full features
6. **Scavenger Hunt** (Week 11-14) - Most complex, builds on other features
7. **New Openings Full** (Week 15-17) - Complete with alerts, gamification

**Next Steps:**
1. Review and approve this specification
2. Create detailed UI mockups for priority features
3. Build Lucky Spin (Week 1 - quick win)
4. Add New Openings search filter (Week 2 - high impact, low effort)
5. Beta test with power users
6. Iterate based on feedback
7. Launch publicly

---

## 5. Smart Timing & Wait Intelligence

### Overview
Real-time and predictive intelligence about restaurant wait times, crowd levels, and optimal visit times. Helps users make smarter decisions about when to go, when to make reservations, and how to avoid waits while maintaining experience quality.

### Problem It Solves
- **Wait time uncertainty**: "Should I go now or will I wait 2 hours?"
- **Reservation difficulty**: "When should I try to book this popular spot?"
- **Suboptimal timing**: Missing best times to visit (quiet periods, happy hours, etc.)
- **Wasted trips**: Arriving at a restaurant with an unexpected long wait
- **Peak hour stress**: Overcrowded experiences when restaurants are slammed
- **Information gap**: No centralized source for real-time busyness data

### User Personas

**The Efficiency Optimizer**
- Hates waiting in lines
- Willing to adjust schedule for better experience
- Values their time highly
- Plans ahead to avoid crowds

**The Spontaneous Diner**
- Decides where to eat last-minute
- Needs real-time wait information
- Wants to know "can I go right now?"
- Flexible about location if wait is shorter elsewhere

**The Experience Seeker**
- Cares about optimal dining experience
- Knows some restaurants are better at certain times
- Willing to visit during off-peak for better service
- Researches before making reservations

**The Social Planner**
- Organizes group dinners
- Needs to coordinate timing
- Wants to avoid making friends wait
- Looks for times that work for everyone

---

### Feature Components

#### 1. **Real-Time Wait Intelligence**

Live wait time data and crowd levels for restaurants.

**Data Points:**
- Current estimated wait time (minutes)
- Live crowd level (0-100% capacity)
- Party size wait variations
- Trend direction (getting busier/quieter)
- Last updated timestamp

**Display Options:**
```typescript
interface LiveWaitData {
  restaurantId: string;
  timestamp: Date;

  // Current status
  waitTime: {
    estimate: number; // minutes
    confidence: 'high' | 'medium' | 'low';
    partySizeVariations: {
      size: number; // party size
      waitMinutes: number;
    }[];
  };

  crowdLevel: number; // 0-100, percentage of capacity
  crowdStatus: 'empty' | 'quiet' | 'moderate' | 'busy' | 'packed';

  // Trends
  trending: 'increasing' | 'stable' | 'decreasing';
  predictedPeakTime?: string; // "7:30pm"

  // Context
  isReservationRequired: boolean;
  acceptsWalkIns: boolean;
  lastUpdatedMinutesAgo: number;
}
```

**Visual Indicators:**
```
Restaurant Card Badges:
┌─────────────────────────┐
│ Via Carota              │
│ [🟢 No wait • Quiet]    │ ← Green when good
│ Italian • $$            │
└─────────────────────────┘

┌─────────────────────────┐
│ Carbone                 │
│ [🟡 45min wait • Busy]  │ ← Yellow when moderate
│ Italian • $$$$          │
└─────────────────────────┘

┌─────────────────────────┐
│ Peter Luger             │
│ [ 2hr wait • Packed]  │ ← Red when very busy
│ Steakhouse • $$$$       │
└─────────────────────────┘
```

#### 2. **Historical Busyness Patterns**

Predictive intelligence based on historical data.

**Busyness Heatmap:**
Visual calendar showing typical crowd levels by day and hour.

```
Via Carota - Typical Busyness
        Mon  Tue  Wed  Thu  Fri  Sat  Sun
5pm     ░░   ░░   ░░   ░░   ▓▓   ▓▓   ▓▓
6pm     ▓▓   ▓▓   ▓▓   ▓▓   ▓▓   ██   ██
7pm     ██   ██   ██   ██   ██   ██   ██  ← Peak
8pm     ██   ██   ██   ██   ██   ██   ██
9pm     ▓▓   ▓▓   ▓▓   ▓▓   ██   ██   ▓▓
10pm    ░░   ░░   ░░   ▓▓   ▓▓   ▓▓   ░░

Legend: ░░ Quiet  ▓▓ Moderate  ██ Busy
```

**Data Model:**
```typescript
interface BusynessPattern {
  restaurantId: string;

  // Weekly patterns
  weeklyPattern: {
    dayOfWeek: number; // 0-6 (Sun-Sat)
    hourlyBusyness: {
      hour: number; // 0-23
      crowdLevel: number; // 0-100
      avgWaitTime: number; // minutes
      confidence: number; // 0-1
    }[];
  }[];

  // Special patterns
  seasonalVariations?: {
    season: 'spring' | 'summer' | 'fall' | 'winter';
    adjustmentFactor: number; // 0.5-1.5
  }[];

  eventImpact?: {
    eventType: 'holiday' | 'local_event' | 'weather';
    adjustmentFactor: number;
  }[];

  // Insights
  quietestTimes: TimeWindow[];
  busiestTimes: TimeWindow[];
  bestTimesForGroups: TimeWindow[];

  lastUpdated: Date;
  dataQuality: 'high' | 'medium' | 'low'; // based on data volume
}

interface TimeWindow {
  dayOfWeek: number;
  startTime: string; // "14:00"
  endTime: string; // "17:00"
  avgCrowdLevel: number;
  avgWaitTime: number;
  description: string; // "Weekday afternoons"
}
```

#### 3. **Best Times to Visit**

Personalized recommendations for optimal visit timing.

**Recommendation Engine:**
```typescript
interface TimingRecommendation {
  restaurantId: string;
  userId: string;

  // Personalized suggestions
  bestTimes: {
    timeWindow: TimeWindow;
    score: number; // 0-100
    reasons: string[]; // Why this is good
    tradeoffs?: string[]; // Any downsides
  }[];

  // Current vs optimal comparison
  currentTime: {
    crowdLevel: number;
    waitTime: number;
    experienceScore: number; // Quality of experience
  };

  betterAlternatives?: {
    suggestedTime: Date;
    improvement: string; // "30min shorter wait"
    experienceImprovement: string; // "Better service, quieter"
  }[];

  // Context-aware
  userContext: {
    partySize: number;
    purpose: 'date' | 'business' | 'casual' | 'celebration';
    flexibility: 'rigid' | 'flexible' | 'very_flexible';
  };
}
```

**UI Examples:**
```
┌─────────────────────────────────────┐
│  Via Carota - Best Times to Visit   │
│  ─────────────────────────────      │
│                                     │
│   BEST FOR YOU                    │
│  Tuesday-Thursday, 5:30-6:30pm      │
│  • Minimal wait (0-15min)           │
│  • Better service (less crowded)    │
│  • Full menu available              │
│  • Easier to get a table            │
│                                     │
│  ✅ GOOD OPTIONS                    │
│  Weeknights after 9pm               │
│  • Short wait (10-20min)            │
│  • Romantic atmosphere              │
│  • May miss some menu items         │
│                                     │
│  ⚠️ AVOID IF POSSIBLE               │
│  Friday-Saturday, 7-9pm             │
│  • Long wait (60-120min)            │
│  • Very crowded                     │
│  • Rushed service                   │
│  • Loud dining room                 │
│                                     │
│   PRO TIP                         │
│  Arrive by 5:45pm on weeknights to  │
│  avoid the dinner rush. Kitchen is  │
│  at its best before 8pm.            │
└─────────────────────────────────────┘
```

#### 4. **Reservation Intelligence**

Smart insights about reservation availability and strategy.

**Reservation Difficulty Scoring:**
```typescript
interface ReservationIntelligence {
  restaurantId: string;

  // Difficulty metrics
  difficultyScore: number; // 0-100 (100 = impossible)
  difficultyRating: 'easy' | 'moderate' | 'hard' | 'very_hard' | 'near_impossible';

  // Timing insights
  typicalBookingWindow: number; // days in advance needed
  bestTimeToBook: {
    dayOfWeek: number;
    time: string;
    reason: string;
  };

  // Success rates
  successRatesByAdvance: {
    daysAhead: number;
    successRate: number; // 0-1
    timeOfDay: string;
  }[];

  // Availability patterns
  easiestDaysToBook: number[]; // day of week
  hardestDaysToBook: number[];

  // Cancellation patterns
  cancellationLikelihood: {
    dayOfWeek: number;
    hour: number;
    likelihood: number; // 0-1
    avgCancellationsPerDay: number;
  }[];

  // Alternative strategies
  strategies: {
    type: 'wait_for_cancellation' | 'book_far_advance' | 'walk_in' | 'bar_seating';
    successRate: number;
    description: string;
    tips: string[];
  }[];

  // Real-time availability
  currentAvailability?: {
    date: Date;
    availableSlots: string[]; // ["5:00pm", "5:15pm", "9:45pm"]
    lastChecked: Date;
  };
}
```

**Display:**
```
┌─────────────────────────────────────┐
│  Carbone - Reservation Guide        │
│  ─────────────────────────────      │
│                                     │
│  Difficulty: ⚠️ VERY HARD (92/100) │
│                                     │
│   Booking Window                  │
│  Typical: 28 days in advance        │
│  Recommended: Book exactly 30 days  │
│  out at 12am EST when reservations  │
│  open                               │
│                                     │
│   Success Rates by Timing         │
│  30 days ahead: 65% success         │
│  14 days ahead: 12% success         │
│  7 days ahead: 3% success           │
│  Day-of: <1% success                │
│                                     │
│   STRATEGIES                      │
│                                     │
│  1. **Midnight Release** (65% success)│
│     Set alarm for 12:00am exactly   │
│     30 days before your target date.│
│     Reservations open at midnight.  │
│                                     │
│  2. **Cancellation Watch** (25% success)│
│     Check at 11am, 3pm, 5pm for     │
│     cancellations. Most cancel      │
│     day-before.                     │
│                                     │
│  3. **Bar Seating** (90% success)   │
│     No reservations needed. Arrive  │
│     at 5:15pm or after 9pm. Full    │
│     menu available.                 │
│                                     │
│   Set Cancellation Alert          │
│  Notify me if a table opens up for: │
│  [Friday, Nov 15 • 7-8pm]           │
│  [Enable Alert →]                   │
└─────────────────────────────────────┘
```

#### 5. **Wait Time Notifications**

Real-time alerts about wait times and optimal windows.

**Notification Types:**
```typescript
type WaitTimeNotification =
  | {
      type: 'no_wait_now';
      message: 'Via Carota has no wait right now!';
      restaurantId: string;
      expiresIn: number; // minutes
    }
  | {
      type: 'better_time_available';
      message: 'Come 30min earlier to skip the wait';
      alternativeTime: Date;
      waitReduction: number; // minutes saved
    }
  | {
      type: 'cancellation_available';
      message: 'Table just opened for Friday 7pm!';
      reservationSlot: {
        date: Date;
        time: string;
        partySize: number;
      };
    }
  | {
      type: 'peak_approaching';
      message: 'Carbone gets busy in 45min';
      currentWait: number;
      predictedWait: number;
      suggestedAction: string;
    }
  | {
      type: 'quiet_period';
      message: "It's usually quiet now at [Restaurant]";
      recommendation: string;
    };
```

**Alert Settings:**
```
┌─────────────────────────────────────┐
│  Wait Time Alerts                   │
│  ─────────────────────────          │
│                                     │
│   Notify me when:                 │
│                                     │
│  ☑ Favorite spots have no wait     │
│     [Within 2 miles of me]          │
│                                     │
│  ☑ Better times available           │
│     [For my saved restaurants]      │
│                                     │
│  ☑ Reservations open up             │
│     [For dates I'm tracking]        │
│                                     │
│  ☑ Approaching peak times           │
│     [30min before rush]             │
│                                     │
│  ☐ Weekly optimal times digest      │
│     [Every Monday 9am]              │
│                                     │
│  Quiet Hours:                       │
│  No alerts between 10pm - 8am       │
│                                     │
│  [Save Preferences]                 │
└─────────────────────────────────────┘
```

#### 6. **Group Timing Coordinator**

Help coordinate timing for group dinners.

**Features:**
```typescript
interface GroupTimingCoordinator {
  groupId: string;
  restaurantId: string;

  // Group preferences
  members: {
    userId: string;
    availability: TimeWindow[];
    preferences: {
      maxWaitTime: number;
      preferQuiet: boolean;
      mustHaveReservation: boolean;
    };
  }[];

  // Recommendations
  optimalTimes: {
    timeSlot: Date;
    matchScore: number; // How well it fits group
    crowdLevel: number;
    waitTime: number;
    reservationAvailable: boolean;
    meetsAllConstraints: boolean;
    compromises: string[]; // "John prefers earlier"
  }[];

  // Coordination
  votingEnabled: boolean;
  selectedTime?: Date;
  confirmations: string[]; // User IDs who confirmed
}
```

**UI:**
```
┌─────────────────────────────────────┐
│  Group Dinner: Friday @ Via Carota  │
│  ─────────────────────────────      │
│                                     │
│   5 people (You, Sarah, Mike, +2) │
│                                     │
│   BEST TIME FOR YOUR GROUP        │
│  Friday, 6:00pm                     │
│  ✅ All available                   │
│  🟢 Moderate crowd (better than 7pm)│
│  ⏱️ 15-20min wait expected          │
│   30min earlier = no wait         │
│                                     │
│  ALTERNATIVE OPTIONS:               │
│                                     │
│  Friday, 5:30pm                     │
│  ✅ Fits 4/5 schedules              │
│  🟢 No wait expected                │
│  ⚠️ Mike unavailable until 6pm      │
│                                     │
│  Friday, 8:30pm                     │
│  ✅ All available                   │
│  🟡 Still busy, 30min wait          │
│  ✅ Reservation available on Resy   │
│                                     │
│  [Vote on Time] [Check Reservation] │
└─────────────────────────────────────┘
```

#### 7. **Experience Quality Scoring**

How busyness affects dining experience.

```typescript
interface ExperienceQualityMetrics {
  restaurantId: string;

  // Quality by crowd level
  qualityByCrowdLevel: {
    crowdLevel: number; // 0-100
    experienceScore: number; // 0-10
    factors: {
      serviceSpeed: number; // 0-10
      serviceAttentiveness: number;
      noiseLevel: number; // 0-10 (lower is better)
      foodQuality: number; // 0-10 (some kitchens suffer when slammed)
      tableSpacing: number; // 0-10
    };
    reviews: string[]; // "Food was cold" when too busy
  }[];

  // Sweet spots
  optimalCrowdRange: {
    min: number; // Too empty feels weird
    max: number; // Too busy hurts experience
    reasoning: string;
  };

  // Trade-offs
  tradeoffs: {
    timing: 'peak' | 'off_peak';
    pros: string[];
    cons: string[];
  }[];
}
```

**Display:**
```
┌─────────────────────────────────────┐
│  Via Carota - Experience Guide      │
│  ─────────────────────────────      │
│                                     │
│   EXPERIENCE QUALITY BY TIME      │
│                                     │
│  Tuesday 6pm (Moderate crowd)       │
│   9.2/10 Experience        │
│  • Attentive service                │
│  • Fresh, properly paced dishes     │
│  • Comfortable noise level          │
│  • Easy to have conversation        │
│  • Kitchen at their best            │
│                                     │
│  Saturday 8pm (Very busy)           │
│   6.8/10 Experience            │
│  • Service feels rushed             │
│  • Longer waits between courses     │
│  • Very loud dining room            │
│  • Cramped table spacing            │
│  • Food quality still excellent     │
│                                     │
│   OPTIMAL CROWD LEVEL             │
│  50-70% capacity                    │
│  "Lively but not overcrowded.       │
│  Great energy without sacrificing   │
│  service or comfort."               │
│                                     │
│  Based on 234 reviews               │
└─────────────────────────────────────┘
```

---

### User Flow

#### Checking Wait Times Before Visit

```
1. User is deciding when to go to Via Carota
   ↓
2. Opens restaurant detail page
   ↓
3. Sees "Smart Timing" section:
   - Current: 🟡 45min wait • Busy
   - Best time today: 🟢 Go at 9:30pm (no wait)
   - This week: 🟢 Tuesday 6pm (optimal)
   ↓
4. Taps "View Full Timing Guide"
   ↓
5. Sees comprehensive timing intelligence:
   - Busyness heatmap
   - Best times recommendations
   - Current vs optimal comparison
   ↓
6. Options:
   - "Go Now Anyway"
   - "Set Alert for Better Time"
   - "Change Plans to Tuesday"
   - "Try Similar Restaurant with No Wait"
```

#### Setting Up Wait Alerts

```
1. User adds restaurant to want-to-try
   ↓
2. Prompt: "Want alerts when it's not busy?"
   ↓
3. Customize alert:
   - Max acceptable wait time
   - Preferred days/times
   - How far in advance to notify
   ↓
4. Save alert preferences
   ↓
5. System monitors restaurant in real-time
   ↓
6. When conditions match:
   ↓
7. Push notification:
   "🟢 Via Carota has no wait right now!
   Usually 45min wait at this time."
   ↓
8. User can act immediately
```

#### Planning Optimal Visit

```
1. User planning Friday night dinner
   ↓
2. Views timing guide for target restaurant
   ↓
3. Sees Friday is peak night (2hr wait)
   ↓
4. System suggests alternatives:
   - Go Thursday instead (20min wait)
   - Go Friday at 5:30pm (before rush)
   - Try similar restaurant with better times
   ↓
5. User compares trade-offs
   ↓
6. Chooses Thursday 7pm (optimal)
   ↓
7. Sets calendar reminder
   ↓
8. Receives reminder with live wait update
```

---

### UI Design Specifications

#### Restaurant Card - Wait Time Badge

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │ [Restaurant Photo]           │   │
│  │ [🟢 No wait • Quiet]         │   │ ← Badge overlay
│  └─────────────────────────────┘   │
│                                     │
│  Via Carota                         │
│  Italian • $$ • 0.8mi               │
│   8.7 • Perfect for date night    │
│                                     │
│  Timing: 🟢 Great time to visit     │
│  Opens in 2 hours                   │
└─────────────────────────────────────┘
```

#### Smart Timing Section (Restaurant Detail)

```
┌─────────────────────────────────────┐
│  Via Carota                         │
│  [Restaurant info...]               │
│  ─────────────────────────          │
│                                     │
│  ⏰ Smart Timing                    │
│                                     │
│  Right Now:                         │
│  🟡 45min wait • Busy               │
│  Last updated: 5 min ago            │
│  [Refresh]                          │
│                                     │
│   Better Options:                 │
│  • Go at 9:30pm tonight (no wait)   │
│  • Try Tuesday 6pm (optimal)        │
│                                     │
│  [View Full Timing Guide →]         │
│  [Set Wait Alert ]                │
│                                     │
│  Reservation Status:                │
│  Hard to get (Book 2 weeks ahead)   │
│  [View Res Guide →] [Book Now →]    │
└─────────────────────────────────────┘
```

#### Full Timing Intelligence Screen

```
┌─────────────────────────────────────┐
│  ← Via Carota - Smart Timing        │
│  ─────────────────────────          │
│                                     │
│  [LIVE] [PATTERNS] [BEST TIMES]     │
│                                     │
│  ──────────── LIVE ────────────     │
│                                     │
│  Right Now: Tuesday, 6:15pm         │
│  🟢 No wait • Quiet                 │
│   Excellent time to visit          │
│                                     │
│  Crowd Level: 35% capacity          │
│  [░░░▓▓░░░░] Low                    │
│                                     │
│  Trending: Getting busier →         │
│  Expected 7pm: 70% capacity         │
│                                     │
│  [Go Now - It's Perfect!]           │
│  [Set Alert for Next Good Time]     │
│                                     │
│  ─────── BUSYNESS PATTERNS ──────   │
│                                     │
│  [Visual heatmap calendar]          │
│                                     │
│  Typical Tuesday:                   │
│  5pm  ░░ Quiet                      │
│  6pm  ▓▓ Picking up  ← You are here │
│  7pm  ██ Busy                       │
│  8pm  ██ Busy                       │
│  9pm  ▓▓ Winding down               │
│  10pm ░░ Quiet                      │
│                                     │
│  [View Other Days →]                │
│                                     │
│  ───────── BEST TIMES ──────────    │
│                                     │
│   OPTIMAL FOR YOU                 │
│  Tuesday-Thursday, 5:30-6:30pm      │
│  • No wait                          │
│  • Attentive service                │
│  • Perfect atmosphere               │
│  [Set Reminder]                     │
│                                     │
│  ✅ ALSO GOOD                       │
│  Weeknights after 9pm               │
│  Monday lunch                       │
│                                     │
│  ⚠️ EXPECT WAITS                    │
│  Fri-Sat, 7-9pm (60-120min)         │
│  Sunday brunch                      │
│                                     │
│   PRO TIPS                        │
│  • Arrive before 5:45pm to avoid rush│
│  • Bar seating = no wait, full menu  │
│  • Kitchen best before 8pm          │
│                                     │
│  Based on 2,847 data points         │
└─────────────────────────────────────┘
```

#### Wait Alert Setup Modal

```
┌─────────────────────────────────────┐
│  Set Wait Alert                     │
│  ─────────────────────────          │
│                                     │
│  Get notified when Via Carota has   │
│  a short wait or no wait.           │
│                                     │
│  Alert me when:                     │
│  ● Wait time under [15] minutes     │
│  ○ No wait (walk right in)          │
│  ○ Custom: [___] minutes            │
│                                     │
│  For times:                         │
│  ☑ Lunch (11am-2pm)                 │
│  ☑ Dinner (5pm-10pm)                │
│  ☐ Late night (10pm-close)          │
│                                     │
│  Days:                              │
│  ☐ M ☑ T ☑ W ☑ Th ☑ F ☐ Sa ☐ Su   │
│                                     │
│  How far in advance:                │
│  [30 minutes ▼]                     │
│                                     │
│  ☑ Only when I'm nearby (2 miles)   │
│  ☑ Stop alerting after I visit      │
│                                     │
│  [Cancel] [Set Alert]               │
└─────────────────────────────────────┘
```

#### Reservation Intelligence Screen

```
┌─────────────────────────────────────┐
│  ← Carbone - Reservation Guide      │
│  ─────────────────────────          │
│                                     │
│  Difficulty:  Very Hard           │
│  [████████░░] 92/100                │
│                                     │
│  ❗ HIGH DEMAND RESTAURANT           │
│  Reservations book out 28+ days     │
│  and fill within minutes.           │
│                                     │
│   Success Rates                   │
│  30 days ahead: 65% ✅              │
│  14 days ahead: 12% ⚠️              │
│  7 days ahead:   3%               │
│  Day-of:        <1%               │
│                                     │
│   BEST STRATEGY                   │
│  Book exactly 30 days in advance    │
│  at 12:00am when slots release.     │
│                                     │
│  Steps:                             │
│  1. Set alarm for 11:55pm           │
│  2. Be on Resy at midnight          │
│  3. Have your date selected         │
│  4. Book instantly when it opens    │
│                                     │
│  [Set Booking Reminder ]          │
│                                     │
│  ──────────────────────             │
│                                     │
│   ALTERNATIVE STRATEGIES          │
│                                     │
│  Cancellation Watch (25% success)   │
│  • Check 11am, 3pm, 5pm daily       │
│  • Most cancellations day-before    │
│  • [Track Cancellations →]          │
│                                     │
│  Bar Seating (90% success)          │
│  • No reservation needed            │
│  • Arrive 5:15pm or after 9pm       │
│  • Full menu available              │
│  • [View Bar Details →]             │
│                                     │
│  Lunch Reservations (80% success)   │
│  • Much easier to book              │
│  • Same great food                  │
│  • Better value                     │
│  • [Check Lunch →]                  │
│                                     │
│  ──────────────────────             │
│                                     │
│   CURRENT AVAILABILITY            │
│  No tables available next 30 days   │
│  Last checked: 12 min ago           │
│  [Refresh]                          │
│                                     │
│   Get notified when tables open   │
│  for your preferred dates.          │
│  [Set Cancellation Alert →]         │
└─────────────────────────────────────┘
```

---

### Integration with Existing Features

#### Lucky Spin Integration

Add wait time as a constraint:

```typescript
interface SpinConstraints {
  // ... existing fields
  maxWaitTime?: number; // minutes
  preferQuietTimes?: boolean;
  mustBeOpenNow?: boolean; // already exists
  optimalTimingOnly?: boolean; // only show restaurants at good times
}
```

**UI Addition:**
```
Lucky Spin Constraints:
   Distance: 2.5mi
   Min Rating: 7.0+
   Price: $$ $$$
   Open Now: ●
  ⏱️ Max Wait: [15 min ▼]  ← NEW
   Optimal Times Only: ○  ← NEW
```

**Spin Result Enhancement:**
```
 Your Lucky Pick!

Via Carota
Italian • $$ • 0.8mi
 8.7

🟢 GREAT TIMING!
No wait right now
Usually 45min at this time

[Let's Go!] [Save] [Spin Again]
```

#### Scavenger Hunt Integration

Add timing challenges and optimal route planning:

**Hunt Timing Challenges:**
```typescript
interface HuntObjective {
  // ... existing fields
  timingConstraint?: {
    type: 'off_peak' | 'no_wait' | 'specific_hours' | 'quiet_time';
    description: string;
    verificationRequired: boolean;
  };
}
```

**Example Hunt with Timing:**
```
"NYC Pizza Master - Speed Run"

Complete 15 pizza spots in optimal timing:
• Visit during off-peak hours
• Maximum 15min wait per stop
• Bonus points for no-wait visits

Timing Tips:
• Go weekday afternoons
• Avoid 7-9pm dinner rush
• Use real-time wait data

[View Optimal Schedule →]
```

**Hunt Route Optimizer:**
```
Your Hunt Route - Optimized for Timing

Stop 1: Joe's Pizza
  Best time: Today 2:30pm (no wait)
  Current: 🟢 Go now!

Stop 2: Prince Street Pizza
  Best time: Today 3:15pm (no wait)
  Wait until: 45 minutes

Stop 3: John's of Bleecker
  Best time: Today 4:00pm (short wait)
  Plan: 45 minutes

Total optimized time: 4.5 hours
Vs peak timing: 7+ hours

[Start Optimized Hunt →]
```

#### Food Crawl Integration

Route optimization based on real-time wait times:

**Active Crawl with Live Timing:**
```
West Village Food Hop
Stop 3 of 5

Current Stop: Via Carota
🟡 25min wait currently
 Come back at 9pm (no wait)

Options:
• Wait here (25min)
• Skip to Stop 4 now, return later
• Adjust crawl order

[Smart Reorder] keeps you moving
based on current wait times.

[Reorder Crawl] [Wait Here]
```

**Crawl Creation with Timing Intelligence:**
```
Creating Crawl: "Brooklyn Pizza Tour"

Stop 3: Roberta's
⚠️ TIMING CONFLICT
This stop gets very busy 7-9pm
(90min wait typical)

Suggestions:
• Visit before 6pm (no wait)
• Visit after 9pm (short wait)
• Swap order with other stops
• Choose alternative restaurant

[Optimize Timing] [Keep Anyway]
```

**Crawl Timing Optimization:**
```typescript
interface CrawlStop {
  // ... existing fields
  optimalArrivalTime?: Date;
  flexibilityWindow?: number; // minutes
  expectedWait?: number;
  crowdLevelAtTime?: number;
}

// Smart crawl ordering
function optimizeCrawlTiming(crawl: FoodCrawl): FoodCrawl {
  // Reorder stops to minimize total wait time
  // Consider walking distance + current/predicted waits
  // Balance against original creator's intent
}
```

#### New Openings Integration

Track how wait times evolve for new restaurants:

**New Opening Timeline:**
```
Casa Luna - Opening Week Patterns

Day 1 (Grand Opening)
 2-3 hour waits all day
Peak hype, expect long lines

Days 2-7 (Opening Week)
🟡 60-90min waits at peak
🟢 30min waits off-peak
Buzz still high

Days 8-14 (Settling In)
🟡 45min waits at peak
🟢 15min waits off-peak
Finding their rhythm

Days 15-30 (New Normal)
🟢 Normal patterns emerging
Best times: Weekday 6pm

 OPTIMAL STRATEGY
Wait 2-3 weeks after opening
to avoid worst waits while
still being an "early" visitor.

[Set Alert for Week 3]
```

**Opening Timing Intel:**
```
 Casa Luna (Opened 3 days ago)

Wait Intelligence:
Current:  90min wait
This is typical for new openings

Predictions:
Week 2: 45-60min waits
Week 3: 30min waits
Week 4: Normal patterns

Best time to visit:
• Week 3-4 (avoid worst crowds)
• Weekday lunch (always quieter)
• After 9pm (late crowd thins)

[Remind Me in 2 Weeks]
```

---

### Data Sources & Collection

#### Real-Time Data Collection

**User-Reported Data:**
```typescript
interface WaitTimeReport {
  userId: string;
  restaurantId: string;
  timestamp: Date;

  // Reported info
  reportedWaitTime: number; // minutes
  partySize: number;
  crowdLevel: 'empty' | 'quiet' | 'moderate' | 'busy' | 'packed';

  // Context
  gotSeated: boolean;
  actualWaitTime?: number; // if they waited and reported back
  reservationUsed: boolean;

  // Credibility
  reporterCredibility: number; // 0-1, based on history
  verified: boolean; // did they actually visit
}
```

**Automatic Detection:**
```typescript
interface AutoDetectedVisit {
  userId: string;
  restaurantId: string;
  timestamp: Date;

  // Inferred data
  arrivalTime: Date;
  seatedTime?: Date; // inferred from check-in
  departureTime?: Date;
  inferredWaitTime?: number;

  // Crowd indicators
  concurrentUsers: number; // other Beli users there
  checkInDensity: number; // check-ins per hour
}
```

**Third-Party Integration:**
```typescript
interface ExternalWaitData {
  source: 'google' | 'yelp' | 'reservation_system' | 'partner';
  restaurantId: string;
  timestamp: Date;

  popularTimes?: number[]; // hourly busyness 0-100
  liveVisitData?: {
    currentVisitors: number;
    usualVisitors: number;
    busynessPercent: number;
  };

  reservationAvailability?: {
    date: Date;
    availableSlots: string[];
  }[];
}
```

#### Data Aggregation & Accuracy

```typescript
interface WaitTimeAggregate {
  restaurantId: string;
  timestamp: Date;

  // Aggregated from multiple sources
  sources: {
    userReports: number;
    autoDetected: number;
    thirdParty: number;
  };

  // Calculated wait time
  waitTimeEstimate: {
    value: number; // minutes
    confidence: number; // 0-1
    range: {
      min: number;
      max: number;
    };
  };

  // Calculated crowd level
  crowdLevelEstimate: {
    value: number; // 0-100
    confidence: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };

  // Quality metrics
  dataQuality: 'high' | 'medium' | 'low';
  lastRealReport: Date;
  predictionBased: boolean; // true if using historical patterns
}
```

#### Privacy & Opt-In

```
Location Privacy Settings:

☑ Help improve wait time data
  Anonymous location data helps
  other users know when it's busy.

  What we collect:
  • When you visit restaurants
  • How long you stay
  • No personal identifying info

  ☑ Share when I check in
  ☐ Share automatically (background)
  ☐ Never share location data

Your data is aggregated and
anonymized. We never share
individual visit patterns.

[Learn More] [Save Settings]
```

---

### Success Metrics

**Engagement:**
- Wait alert conversion rate (alert → visit)
- Timing guide views per user
- Optimal time adoption rate
- Real-time data refresh rate

**User Value:**
- Average wait time saved
- User-reported satisfaction with timing
- "Perfect timing" visit rate
- Avoided waits (decided not to go)

**Data Quality:**
- Wait time prediction accuracy
- Real-time data freshness (minutes since update)
- User report volume
- Confidence scores over time

**Business Impact:**
- Restaurant discovery via timing (new restaurants tried)
- Off-peak visit rate increase
- Reduced abandoned visits (didn't go due to wait)
- Partner restaurant engagement

---

### Implementation Phases

**Phase 1: Core Wait Intelligence (Week 1-2)**
- Basic wait time data model
- Real-time wait display on restaurant cards
- User wait time reporting
- Simple "busy/quiet" indicators

**Phase 2: Historical Patterns (Week 3-4)**
- Busyness heatmap by day/hour
- Best times recommendations
- Historical data aggregation
- Pattern detection algorithms

**Phase 3: Smart Alerts (Week 5-6)**
- Wait time alert system
- Alert preferences
- Push notifications
- No-wait opportunities

**Phase 4: Reservation Intelligence (Week 7-8)**
- Reservation difficulty scoring
- Booking window analysis
- Cancellation pattern detection
- Strategy recommendations

**Phase 5: Advanced Features (Week 9-10)**
- Experience quality scoring
- Group timing coordinator
- Integration with Lucky Spin/Hunts/Crawls
- Optimal route planning

**Phase 6: Polish & Launch (Week 11-12)**
- Data quality improvements
- UI polish
- Beta testing
- Privacy controls
- Launch

---

### Technical Considerations

**Real-Time Data Challenges:**
- Need low-latency updates (< 5 min old)
- Handle sparse data for less popular restaurants
- Balance prediction vs real reports
- Graceful degradation when no data

**Prediction Accuracy:**
- Machine learning models for pattern detection
- Confidence intervals for estimates
- Handle special events (holidays, weather, local events)
- Continuous model improvement

**Scalability:**
- Efficient aggregation of user reports
- Caching strategies for historical patterns
- Real-time vs batch processing
- Database indexing for time-series queries

**Privacy:**
- Anonymous location data collection
- Aggregation thresholds (min N users)
- Opt-in for background location
- Clear privacy controls

---

## Comprehensive Feature Integration Summary

### Cross-Feature Synergies

**Lucky Spin + Smart Timing:**
- Filter spins by current wait times
- Show timing intelligence on spin results
- "Perfect timing!" badges on lucky picks
- Avoid suggesting restaurants with long waits

**Scavenger Hunt + Smart Timing:**
- Route optimization based on real-time waits
- Timing-based hunt challenges (off-peak visits)
- Speed run hunts minimize wait times
- Bonus points for optimal timing visits

**Food Crawl + Smart Timing:**
- Dynamic route reordering during active crawls
- Pre-crawl timing optimization
- Wait time warnings during crawl creation
- Group coordinator considers timing preferences

**New Openings + Smart Timing:**
- Opening week wait time patterns
- Alert when waits normalize (week 3-4)
- First reviewer timing strategy
- Soft opening vs grand opening wait differences

**All Features Together:**
- Unified timing intelligence layer
- Consistent wait time badges across all features
- Shared data collection benefits all features
- Cross-feature recommendations based on timing

### Unified Data Model Extensions

Add timing intelligence to core Restaurant type:

```typescript
interface Restaurant {
  // ... existing fields

  // Smart Timing additions
  currentWaitData?: LiveWaitData;
  busynessPatterns?: BusynessPattern;
  reservationIntelligence?: ReservationIntelligence;

  // Feature eligibility
  luckySpinEligible?: boolean;
  huntsParticipating?: string[]; // hunt IDs
  crawlsFeaturingThis?: string[]; // crawl IDs
  openingInfo?: RestaurantOpening;
}
```

### Implementation Priority Matrix

**High Value + Easy Implementation:**
- Lucky Spin core feature
- Wait time badges on restaurant cards
- New Openings filter in search
- Basic busyness patterns

**High Value + Medium Complexity:**
- Food Crawl core experience
- Reservation intelligence
- Wait time alerts
- Historical pattern detection

**High Value + High Complexity:**
- Scavenger Hunt system
- Real-time route optimization
- Group timing coordinator
- Machine learning predictions

**Medium Value + Easy Implementation:**
- Opening week patterns
- Timing tips and insights
- Experience quality scores
- Alert preferences

### Recommended Development Workflow

**Weeks 1-4: Foundation (MVP)**
1. Lucky Spin (Week 1)
2. Basic timing intelligence (Week 2-3)
   - Wait time data model
   - Simple busy/quiet indicators
   - Restaurant card badges
3. New Openings filter (Week 4)

**Weeks 5-10: Core Experiences**
4. Food Crawl (Week 5-7)
   - Core crawl features
   - Timing integration
   - Group coordination
5. Smart Timing advanced (Week 8-10)
   - Busyness heatmaps
   - Best times recommendations
   - Alert system
   - Reservation intelligence

**Weeks 11-17: Gamification & Polish**
6. Scavenger Hunt (Week 11-14)
   - Hunt system
   - Leaderboards
   - Badges
   - Timing challenges
7. New Openings full (Week 15-17)
   - Coming soon tracking
   - First reviewer badges
   - Opening alerts
8. Final integration & polish

### Success Metrics Dashboard

**Cross-Feature KPIs:**
- Daily active users (across all features)
- Feature adoption rates
- Cross-feature usage (users using 2+ features)
- Average session time
- Discovery rate (new restaurants found)
- User satisfaction scores

**Timing Intelligence Impact:**
- Average wait time saved per user
- Optimal timing adoption rate
- Alert conversion rates
- User reports submitted
- Prediction accuracy

**Social Engagement:**
- Feed posts from features
- Friend interactions
- Group activities
- Content creation rate

**Business Value:**
- Restaurant discovery increase
- Off-peak dining promotion
- Partner restaurant engagement
- Premium feature adoption (if applicable)

### Technical Architecture Overview

**Frontend (React Native + Next.js):**
```
/src/features/
├── lucky-spin/
│   ├── components/
│   ├── screens/
│   └── hooks/
├── scavenger-hunts/
│   ├── components/
│   ├── screens/
│   └── hooks/
├── food-crawls/
│   ├── components/
│   ├── screens/
│   └── hooks/
├── new-openings/
│   ├── components/
│   ├── screens/
│   └── hooks/
└── smart-timing/
    ├── components/
    ├── screens/
    ├── hooks/
    └── services/
        ├── waitTimeService.ts
        ├── busynessAnalyzer.ts
        ├── predictionEngine.ts
        └── alertManager.ts
```

**Backend/Services:**
```
/services/
├── mockDataService.ts (extended)
├── timingIntelligence/
│   ├── waitTimeAggregator.ts
│   ├── patternDetector.ts
│   ├── reservationAnalyzer.ts
│   └── alertScheduler.ts
├── gamification/
│   ├── badgeManager.ts
│   ├── leaderboardService.ts
│   └── achievementTracker.ts
└── notifications/
    ├── pushNotifications.ts
    └── alertEngine.ts
```

**Data Storage (Mock initially, real backend later):**
```
/data/mock/
├── restaurants.ts (extended)
├── luckySpins.ts
├── scavengerHunts.ts
├── foodCrawls.ts
├── openings.ts
├── waitTimes.ts
├── busynessPatterns.ts
└── reservationIntel.ts
```

### Launch Strategy

**Phase 1: Soft Launch (Friends & Family)**
- Lucky Spin + Basic Timing
- Gather initial data
- Test algorithms
- Collect feedback

**Phase 2: Beta (Power Users)**
- Add Food Crawl
- Expand timing intelligence
- Refine based on usage patterns
- Build data corpus

**Phase 3: Public Launch**
- Full feature set
- Marketing campaign
- Press coverage
- App store featuring

**Phase 4: Growth & Iteration**
- Monitor metrics
- A/B test features
- Add v2 enhancements
- Scale infrastructure

---

**Document Version:** 1.2
**Last Updated:** October 28, 2025
**Status:** Ready for Implementation
