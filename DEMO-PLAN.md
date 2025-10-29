# Beli Portfolio Demo - Implementation Plan

## Overview

This document outlines the comprehensive plan for creating an impressive demo experience that showcases my work on the Beli platform. The demo flow starts with my resume and seamlessly transitions into interactive showcases of three major features I've built:

1. **Tastemakers** - Curated food expert profiles and content
2. **Group Dinner / Eat Now** - AI-powered group dining recommendations
3. **What to Order** - Smart menu ordering assistant

---

## Current Implementation Status

### Feature 1: Tastemakers
**Status**: ✅ **Fully Implemented (Web)**

**Files**:
- `/beli-web/data/mock/tastemakers.ts` - 13 tastemaker profiles
- `/beli-web/data/mock/tastemakerPosts.ts` - 12 curated articles
- `/beli-web/components/tastemakers/tastemaker-card.tsx`
- `/beli-web/components/tastemakers/tastemaker-post-card.tsx`
- `/beli-web/components/feed/tastemaker-picks-widget.tsx`
- `/beli-web/app/tastemakers/page.tsx` - Main listing page
- `/beli-web/app/tastemakers/[username]/page.tsx` - Profile pages
- `/beli-web/app/tastemakers/posts/[id]/page.tsx` - Article pages

**Key Features**:
- 13 NYC food expert profiles with specialties (Pizza, Fine Dining, Street Food, Vegan, Ramen, etc.)
- Comprehensive badge system (11 badge types with colors and icons)
- 12 featured articles covering various dining topics
- Engagement tracking (likes, bookmarks, views)
- Rich profile data (followers, engagement rates, social links)
- Magazine-style layout with hero posts
- Category navigation
- Full routing with dynamic pages

**Technical Highlights**:
- TypeScript interfaces for type safety
- Next.js App Router with dynamic routes
- Responsive grid layouts
- shadcn/ui components with Tailwind CSS

**Mobile Status**: Mock data exists but no UI implementation

---

### Feature 2: Group Dinner / Eat Now
**Status**: ✅ **Fully Implemented (Mobile)** | ⚠️ **Minimal Web Implementation**

**Mobile Files** (`beli-native/`):
- `/src/screens/GroupDinnerScreen.tsx` - Main screen (750+ lines)
- `/src/components/group-dinner/ParticipantSearchModal.tsx`
- `/src/components/group-dinner/RestaurantSwiper.tsx`
- `/src/components/group-dinner/SelectionScreen.tsx`
- `/src/components/group-dinner/ConfirmationModal.tsx`
- `/src/components/group-dinner/GroupDinnerCard.tsx`
- `/src/components/group-dinner/ParticipantSelector.tsx`
- `/src/components/group-dinner/index.ts`

**Web Files** (`beli-web/`):
- `/components/group-dinner/group-dinner-card.tsx` - Basic card only

**Core Functionality**:
1. **Participant Selection**
   - Search modal to find and add dining companions
   - Shows user avatars and names
   - Supports multiple participants

2. **Restaurant Swiper Interface**
   - Tinder-style card swiping
   - Swipe right to save (max 3)
   - Swipe left to pass
   - Match indicators showing compatibility
   - Restaurant details: image, name, cuisine, price, distance, rating

3. **Intelligent Matching Algorithm**
   - Analyzes group preferences
   - Shows match breakdown with reasons
   - "Match reasons" explain why restaurant works for the group
   - Considers: cuisine preferences, ratings, price range, dietary restrictions

4. **Selection & Confirmation**
   - Auto-opens selection screen after saving 3 restaurants
   - Choose final restaurant from saved options
   - Confirmation modal with participant list
   - Shuffle button for new suggestions

**Technical Highlights**:
- Complex state management (participants, saved restaurants, current card)
- Animation library for card swiping
- Modal navigation flows
- Real-time filtering based on group preferences
- Custom hooks for swipe gestures

**Documentation**:
- `/group-dinner.md` - 750-line comprehensive spec
- Weighted algorithm design (6-factor scoring)
- Date Night Mode with ambiance scoring
- Voting system architecture
- Partner integration plans

---

### Feature 3: What to Order
**Status**: ✅ **Fully Implemented (Both Platforms)**

**Mobile Files** (`beli-native/`):
- `/src/components/modals/WhatToOrderModal.tsx` - Full modal (750+ lines)
- `/src/data/mock/menuItems.ts` - Menu data

**Web Files** (`beli-web/`):
- `/components/modals/what-to-order-modal.tsx` - Dialog modal
- `/components/restaurant/what-to-order-button.tsx` - Trigger button
- `/data/mock/menuItems.ts` - Menu data

**User Flow**:

**Step 1: Setup**
- Party size selector (1-12 people)
- Hunger level picker:
  - 🥗 Light (0.8x multiplier)
  - 🍽️ Moderate (1.2x multiplier)
  - 🍕 Very Hungry (1.8x multiplier)

**Step 2: Suggestions**
- AI-generated order with smart menu items
- Each item shows:
  - Food photo
  - Name and description
  - Price
  - Quantity badge
  - Portion size (Small/Medium/Large/Shareable)
  - Dietary badges (Vegetarian, Vegan, Gluten-Free, Spicy)
- Summary card with:
  - Total price
  - Price per person
  - Reasoning chips explaining selections
  - Sharability score

**Core Algorithm**:
```
Base Hunger Points = Party Size × 10 × Hunger Multiplier

Portion Points:
- Small: 5 points
- Medium: 10 points
- Large: 15 points
- Shareable: 12 points

Selection Strategy:
1. Calculate total points needed
2. Prioritize shareable items for groups (party size > 2)
3. Mix portion sizes intelligently
4. Avoid duplicates (increase quantity instead)
5. Respect dietary restrictions
6. Balance price point
```

**Interactive Features**:
- Shuffle button with rotation animation
- "Looks Good!" confirmation
- Share functionality (native Share API on mobile, clipboard on web)
- Share format: "Our order at [Restaurant]:\n[items with quantities]\nTotal: $XX.XX ($X.XX/person)"
- Loading states with spinners
- Smooth transitions between steps

**Technical Highlights**:
- Complex recommendation algorithm
- TypeScript types: `MenuItem`, `OrderSuggestion`, `HungerLevel`, `MealTime`
- State machine for multi-step flow
- Platform-specific sharing (Native Share vs Web Share/Clipboard API)
- Animated shuffle icon with CSS keyframes
- Responsive layout adapting to screen size

**Documentation**:
- `/docs/what-to-order-feature.md` - 350-line comprehensive guide
- Algorithm details and hunger points system
- Portion sizing logic
- Item selection strategy
- Reasoning generation
- UI/UX specifications
- Performance considerations
- Future enhancement ideas

---

## Additional Features Designed (See new-features-spec.md)

Beyond the three implemented features above, I've created comprehensive specifications for four additional major features that could be built next:

### Feature Summary Table

| Feature | Purpose | Complexity | Est. Development | Documentation Status |
|---------|---------|------------|------------------|---------------------|
| **🎰 Lucky Spin** | Random restaurant picker with smart constraints | Low | 40 hours | ✅ Complete Spec (2,500+ lines) |
| **🗺️ Food Crawl** | Multi-stop dining experiences | Medium | 120 hours | ✅ Complete Spec |
| **🏆 Scavenger Hunt** | Competitive dining challenges with prizes | High | 160 hours | ✅ Complete Spec |
| **🆕 New Openings** | Recently opened restaurant discovery | Low | 40 hours | ✅ Complete Spec |

**Total Additional Work Documented**: ~360 hours of spec'd features ready for implementation

### 🎰 Lucky Spin - Playful Restaurant Randomizer

**Overview**: Slot machine-style random restaurant picker for decision paralysis moments

**Key Features**:
- Constraint system (distance slider, min rating, price range, cuisine filters, "open now" toggle)
- Animated 3-wheel slot machine interface
- Lucky finds history tracking (past 50 spins)
- Soft anti-spam encouragement (unlimited spins, but gentle nudges)
- Integration with want-to-try lists
- Social sharing: "Lucky Spin just picked [Restaurant] for me!"

**Differentiator vs Group Dinner**: Solo fun randomness vs. algorithmic group optimization

**Technical Highlights**:
- TypeScript interfaces: `SpinConstraints`, `LuckySpinSession`, `LuckySpinStats`
- 2.5-second spin animation with haptic feedback
- Constraint persistence (remembers your usual filters)
- Conversion tracking: spins → saves → visits

---

### 🗺️ Food Crawl - Multi-Restaurant Adventures

**Overview**: Curated multi-stop dining experiences (think pub crawl, but for food)

**Crawl Types**:
1. **Cuisine Deep Dives**: 4 pizza styles, 5 taco variations, ramen route
2. **Neighborhood Tours**: West Village feast (breakfast→coffee→lunch→dessert→dinner)
3. **Price Point Crawls**: $20 food tour, dollar slice marathon
4. **Themed Experiences**: Dessert paradise, food truck Friday, breakfast world tour
5. **Seasonal/Holiday**: Summer rooftops, fall harvest menus, holiday cookie crawl

**Key Features**:
- Active crawl mode with real-time navigation between stops
- Group crawl coordination (see where everyone is, group chat, shared photos)
- Crawl creation tools (search restaurants, set order, add notes, preview route)
- Smart routing optimization (minimize backtracking, consider hours, traffic warnings)
- Crawl variations (fork/remix existing crawls, swap stops, budget versions)
- Achievements & stats (total crawls, miles walked, favorite category)

**Data Models**:
- `FoodCrawl`: Name, stops, total distance/duration/cost, visibility, rating
- `CrawlStop`: Restaurant, suggested duration, must-try dishes, walking time from previous
- `CrawlProgress`: Current stop, completed stops with check-ins, photos, ratings
- `GroupCrawl`: Members, real-time locations, group chat, coordination status

**User Journey**:
```
Discover Crawl → View Details & Map → Start Crawl
  → Check in at Stop 1 → Rate & Photo → Navigate to Stop 2
  → Repeat for all stops → Completion Summary → Share Journey
```

**Completion Screen Shows**:
- Photo collage from all stops
- Journey stats (2.3 miles walked, 3h 24min, $48 spent, 8.6 avg rating)
- "Which was your favorite?" poll
- Achievement unlocked badge
- Share to feed & find similar crawls

---

### 🏆 Scavenger Hunt - Competitive Dining Challenges

**Overview**: Time-limited challenges where users complete dining objectives for badges, prizes, and leaderboard glory

**Hunt Types**:
1. **Cuisine Master**: Italian Connoisseur (10 Italian spots), Taco Tour (15 tacos), Sushi Sensei (8 sushi including omakase)
2. **Neighborhood Navigator**: West Village Wanderer, Brooklyn Bridge to Table, Chinatown Deep Dive
3. **Price Point Challenges**: Budget Gourmet ($15 meals), Value Hunter (all price tiers), Splurge Worthy (fine dining)
4. **Dietary Restriction**: Vegan Victory (20 plant-based), Gluten-Free Guru, Allergy-Friendly Hero
5. **Time-Based**: Weekend Warrior (3 new restaurants every weekend), Week of Discovery (7 cuisines in 7 days)
6. **Milestone**: Michelin Quest, Old Guard (50+ year restaurants), James Beard Journey

**Hunt Philosophy**:
- One-time special events ("Summer 2025 Taco Hunt")
- Seasonal recurring hunts ("Restaurant Week Explorer")
- Always-on evergreen hunts ("NYC Pizza Master")
- Community competitions with real prizes

**Prize & Reward System**:
- **Digital**: Badges, achievement points, titles, profile flair
- **Physical (Sponsored)**: $25-$100 gift cards, merchandise, chef's table experiences
- **Tiered Progression**: Bronze (1 hunt) → Silver (5) → Gold (10) → Platinum (25) → Legend (50)

**Example Hunt: Summer Taco Tour 2025**
- 12 specific taco objectives across NYC
- 60-day time limit
- Min rating 6.0 required
- Photo proof encouraged
- Rewards: $50 gift card, "Taco Tour Champion" badge, 1000 achievement points
- Sponsored by NYC Tourism Board
- 1,247 participants, 89 completions

**Data Models**:
- `ScavengerHunt`: Name, objectives, time limit, rewards, leaderboard, participant count
- `HuntObjective`: Description, type (visit restaurant/cuisine/neighborhood), criteria, verification requirements
- `HuntProgress`: User's checkpoints completed, qualifying visits with ratings/photos, rank, status
- `HuntLeaderboard`: Rankings, completion times, scores
- `UserHuntStats`: Hunts completed, badges earned, achievement points, tier level

**Leaderboard Integration**:
- New "Hunts" tab in LeaderboardScreen
- Sort by: hunts completed, achievement points, fastest completion
- Tier badges visible on profiles

---

### 🆕 New Openings Discovery

**Overview**: Discover and track recently opened restaurants

**Key Features**:
- Time-based filtering (last 7/30/90 days)
- "Opening soon" preview alerts
- Early adopter badges ("First 100 to try")
- Integration with existing lists (add to want-to-try)
- Notification system for new openings matching preferences

**Lower Complexity**: Extends existing restaurant data model with `openedDate` field

---

## Implementation Priority Recommendation

**If building these next, recommended order**:
1. **Lucky Spin** (Week 1) - Quick win, 40 hours
2. **Food Crawl** (Weeks 2-4) - High user value, 120 hours
3. **Scavenger Hunt** (Weeks 5-8) - Most complex, benefits from Food Crawl's multi-stop logic, 160 hours
4. **New Openings** (Week 9) - Polish feature, 40 hours

**Total**: 12 weeks for all four additional features

---

## Demo Experience Flow

### Phase 1: Landing Page - Resume First Impression

**Route**: `/` (root homepage)

**Current State**: Redirects to `/feed`

**New Implementation**:

**Visual Design**:
- Full-screen resume presentation
- Uses Beli design system (teal #0B7B7F, rating colors, typography)
- Maintains professional card-based layout from `resume.html`
- Animated fade-in on load
- Smooth scroll behavior

**Content Sections** (from existing resume.html):
1. **Header Card**
   - Name: Victor Cox IV
   - Contact: email, phone, location
   - Links: LinkedIn, GitHub, Portfolio, beli username
   - Styled with rating bubble aesthetic

2. **Professional Journey**
   - Bloomberg LP (9.2 rating) - Software Engineer
     - Data pipeline migrations (Airflow 1→2)
     - Streaming architecture (Kafka)
     - MCP server integration with GitHub Copilot
   - Capital One (8.5 rating) - TIP Fullstack Intern
     - Database recommendation system
     - Slack chatbot integration
   - Notre Dame HCI Lab (8.0 rating) - Researcher
     - Gig worker platform research
     - Published CHI paper

3. **Education**
   - Notre Dame CS + Studio Arts (GPA 3.8)

4. **Technical Skills** (Grid of rating bubbles)
   - Python (9.5), JavaScript (9.0), React (8.5)
   - Airflow (9.0), Kafka (9.0), AWS (9.0)
   - C/C++ (8.5), PostgreSQL (8.0), Docker (8.0)

5. **Featured Projects**
   - Hanzi a day (95% Match)
   - Keeper's Heart AR Platform (98% Match)
   - tors-studio (92% Match)

6. **Beyond Code**
   - Hobbies: Ceramics, Cooking, Chinese language, etc.

**Call-to-Action**:
- Large teal button at bottom: "Continue to Demo" or "See What I Built"
- Smooth transition animation to demo hub
- Optional: Sticky header with "Skip to Demo" link

**Technical Implementation**:
```tsx
// app/page.tsx
export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background">
      <ResumeHeader />
      <ExperienceSection />
      <EducationSection />
      <SkillsGrid />
      <ProjectsSection />
      <HobbiesSection />
      <CTAButton href="/demo">Continue to Demo</CTAButton>
    </div>
  );
}
```

---

### Phase 2: Demo Hub - Feature Overview

**Route**: `/demo`

**Visual Design**:
- Hero section: "Three Features I Built for Beli"
- Subtitle: "From tastemaker profiles to AI-powered dining recommendations"
- Three prominent feature cards in grid layout

**Feature Cards**:

**Card 1: Tastemakers**
```
┌─────────────────────────────────────┐
│ 🎭 Tastemakers                      │
│                                      │
│ Curated food expert profiles with    │
│ specialized content and engagement   │
│                                      │
│ ✅ Fully Implemented (Web)          │
│                                      │
│ Tech: Next.js App Router, TypeScript│
│ • 13 expert profiles                │
│ • 12 featured articles              │
│ • Badge system (11 types)           │
│ • Dynamic routing                   │
│                                      │
│ [View Live Feature →]               │
└─────────────────────────────────────┘
```

**Card 2: Group Dinner / Eat Now**
```
┌─────────────────────────────────────┐
│ 🍽️ Group Dinner                    │
│                                      │
│ AI-powered group dining with swipe  │
│ interface and match algorithm        │
│                                      │
│ ✅ Fully Implemented (Mobile)       │
│                                      │
│ Tech: React Native, Animations      │
│ • Participant selection             │
│ • Restaurant swiper                 │
│ • Match algorithm (6 factors)       │
│ • 750+ line component               │
│                                      │
│ [See Demo →]                        │
└─────────────────────────────────────┘
```

**Card 3: What to Order**
```
┌─────────────────────────────────────┐
│ 📋 What to Order                    │
│                                      │
│ Smart menu recommendations based on │
│ party size and hunger level          │
│                                      │
│ ✅ Fully Implemented (Both)         │
│                                      │
│ Tech: React, TypeScript, Algorithm  │
│ • Hunger-based algorithm            │
│ • 750+ line implementation          │
│ • Share functionality               │
│ • Comprehensive documentation       │
│                                      │
│ [Try It Now →]                      │
└─────────────────────────────────────┘
```

**Navigation**:
- Each card links to feature experience
- "Back to Resume" link in header
- Progress indicator showing which feature you're viewing

**Technical Implementation**:
```tsx
// app/demo/page.tsx
export default function DemoHubPage() {
  const features = [
    {
      id: 'tastemakers',
      title: 'Tastemakers',
      description: 'Curated food expert profiles...',
      status: 'Fully Implemented (Web)',
      stats: ['13 profiles', '12 articles', '11 badge types'],
      href: '/tastemakers',
      tech: ['Next.js App Router', 'TypeScript', 'shadcn/ui']
    },
    // ... other features
  ];

  return (
    <div className="container py-8">
      <DemoHero />
      <div className="grid md:grid-cols-3 gap-6">
        {features.map(feature => (
          <FeatureCard key={feature.id} {...feature} />
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 3: Individual Feature Experiences

#### Experience 3A: Tastemakers (Live Feature)

**Route**: `/tastemakers` (existing)

**Enhancement**: Add demo banner at top
```tsx
<DemoBanner>
  <div className="bg-primary/10 border-l-4 border-primary p-4">
    <p className="text-sm">
      📍 Demo Feature: This is a fully functional tastemakers directory
      I built from scratch
    </p>
    <Link href="/demo">← Back to Demo Hub</Link>
  </div>
</DemoBanner>
```

**User Journey**:
1. Land on tastemakers directory
2. See grid of 13 expert profiles
3. Click on a profile (e.g., "Michael Chen - Pizza Expert")
4. View detailed profile page with featured lists and engagement
5. Click on an article to see full content
6. Navigate back to demo hub

**What to Highlight**:
- Clean, magazine-style UI
- Dynamic routing working seamlessly
- Badge system displaying correctly
- Engagement metrics
- Responsive design

---

#### Experience 3B: Group Dinner (Interactive Demo)

**Route**: `/demo/group-dinner`

**Implementation Strategy**: Port mobile components to web or create standalone demo

**Option A: Full Web Port** (Recommended for impressive demo)
- Port all mobile components to web using shadcn/ui
- Adapt swipe gestures for mouse/touch
- Maintain full functionality

**Option B: Video/Screenshots Demo** (Faster implementation)
- Show mobile screenshots/video
- Walkthrough of key screens
- Code snippets highlighting algorithm

**Full Implementation Outline** (Option A):

```tsx
// app/demo/group-dinner/page.tsx

export default function GroupDinnerDemo() {
  const [step, setStep] = useState<'intro' | 'select' | 'swipe' | 'results'>('intro');

  return (
    <div className="container max-w-4xl py-8">
      <DemoHeader
        title="Group Dinner / Eat Now"
        subtitle="AI-powered group dining recommendations"
      />

      {step === 'intro' && <IntroScreen onStart={() => setStep('select')} />}
      {step === 'select' && <ParticipantSelector onNext={() => setStep('swipe')} />}
      {step === 'swipe' && <RestaurantSwiper onComplete={() => setStep('results')} />}
      {step === 'results' && <ResultsScreen />}
    </div>
  );
}
```

**Components to Create**:

1. **IntroScreen**:
   - Feature description
   - "How it works" steps
   - Start button
   - Tech stack showcase
   - Link to mobile implementation screenshots

2. **ParticipantSelector** (simplified):
   - Search input
   - Mock user results
   - Selected participants display
   - Continue button

3. **RestaurantSwiper** (web-adapted):
   - Card stack display
   - Left/Right buttons (or drag)
   - Match percentage indicator
   - "Why this works" breakdown
   - Save counter (X/3 saved)
   - Shuffle button

4. **ResultsScreen**:
   - Show 3 saved restaurants
   - Selection interface
   - Confirmation
   - Algorithm explanation sidebar

**Technical Highlights to Show**:
```tsx
// Display algorithm visualization
<AlgorithmBreakdown>
  <h3>Match Algorithm Factors</h3>
  <ul>
    <li>Cuisine Preference Match: 85%</li>
    <li>Price Range Compatibility: 100%</li>
    <li>Average Rating: 8.5/10</li>
    <li>Distance Score: 92%</li>
    <li>Dietary Accommodations: ✓</li>
    <li>Party Size Support: ✓</li>
  </ul>
  <p className="text-sm text-muted-foreground">
    Overall Match: 94%
  </p>
</AlgorithmBreakdown>
```

**Fallback Screenshots** (if time limited):
- Participant selection screen
- Restaurant card with match reasons
- Selection screen with 3 options
- Confirmation modal

---

#### Experience 3C: What to Order (Interactive Demo)

**Route**: `/demo/what-to-order`

**Implementation**: Create standalone demo page with pre-populated restaurant

```tsx
// app/demo/what-to-order/page.tsx

export default function WhatToOrderDemo() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container max-w-4xl py-8">
      <DemoHeader
        title="What to Order"
        subtitle="Smart menu recommendations based on your hunger"
      />

      {/* Feature explanation */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <FeatureOverview>
          <h3>How It Works</h3>
          <ol>
            <li>Select party size (1-12)</li>
            <li>Choose hunger level</li>
            <li>Get AI-powered menu suggestions</li>
            <li>Share with your group</li>
          </ol>
        </FeatureOverview>

        <AlgorithmCard>
          <h3>The Algorithm</h3>
          <CodeBlock language="typescript">
            {`Base Points = Party Size × 10 × Hunger Multiplier

Hunger Levels:
• Light: 0.8x
• Moderate: 1.2x
• Very Hungry: 1.8x

Portion Points:
• Small: 5 | Medium: 10
• Large: 15 | Shareable: 12`}
          </CodeBlock>
        </AlgorithmCard>
      </div>

      {/* Try it yourself */}
      <Card className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">
          Try It Yourself
        </h3>
        <p className="text-muted-foreground mb-6">
          Experience the feature with a sample restaurant menu
        </p>
        <Button
          size="lg"
          onClick={() => setShowModal(true)}
        >
          Open What to Order Modal
        </Button>
      </Card>

      {/* The actual modal */}
      <WhatToOrderModal
        open={showModal}
        onOpenChange={setShowModal}
        restaurant={demoRestaurant}
      />

      {/* Implementation details */}
      <ImplementationDetails>
        <h3>Implementation Highlights</h3>
        <ul>
          <li>750+ lines of TypeScript</li>
          <li>Comprehensive algorithm with hunger points system</li>
          <li>Platform-specific sharing (Native vs Web API)</li>
          <li>Animated transitions and loading states</li>
          <li>Full documentation (350+ lines)</li>
          <li>Deployed on both mobile and web</li>
        </ul>
      </ImplementationDetails>
    </div>
  );
}
```

**Demo Flow**:
1. Land on feature explanation page
2. See algorithm breakdown
3. Click "Try It Yourself"
4. Modal opens with demo restaurant "Joe's Pizza"
5. Select party size (e.g., 4 people)
6. Choose hunger level (e.g., Very Hungry)
7. See generated order:
   - 2x Margherita Pizza (Shareable)
   - 1x Caesar Salad (Large)
   - 1x Mozzarella Sticks
   - Total: $67.50 ($16.88/person)
8. Try shuffle to see different combination
9. Click share to see share format

**Interactive Elements**:
- Working party size selector (increment/decrement)
- Hunger level cards with hover effects
- Shuffle button with rotation animation
- Share button with toast notification
- Back button to demo hub

---

### Phase 4: Navigation & Polish

#### Demo Mode Indicators

**Global Demo Banner** (when in demo routes):
```tsx
// components/demo/demo-banner.tsx

export function DemoBanner() {
  const pathname = usePathname();
  const isDemo = pathname.startsWith('/demo') || pathname === '/';

  if (!isDemo) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Portfolio Demo Mode</span>
          <span className="text-xs opacity-80">
            Built by Victor Cox IV
          </span>
        </div>
        <Link
          href="/feed"
          className="text-xs underline hover:no-underline"
        >
          Exit to Full App
        </Link>
      </div>
    </div>
  );
}
```

#### Breadcrumb Navigation

```tsx
// components/demo/demo-breadcrumb.tsx

export function DemoBreadcrumb() {
  const pathname = usePathname();

  const crumbs = [
    { label: 'Resume', href: '/' },
    { label: 'Demo Hub', href: '/demo' },
    // ... dynamic based on pathname
  ];

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight className="h-4 w-4" />}
          <Link
            href={crumb.href}
            className="hover:text-foreground transition"
          >
            {crumb.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
```

#### Progress Indicator

For multi-feature tour:
```tsx
<div className="flex items-center justify-center gap-2 mb-8">
  <ProgressDot active={currentFeature === 1} />
  <ProgressDot active={currentFeature === 2} />
  <ProgressDot active={currentFeature === 3} />
</div>
```

---

## File Structure

### New Files to Create

```
beli-web/
├── app/
│   ├── page.tsx                           # NEW: Resume landing page
│   │
│   ├── demo/
│   │   ├── layout.tsx                     # NEW: Demo layout wrapper
│   │   ├── page.tsx                       # NEW: Demo hub
│   │   │
│   │   ├── group-dinner/
│   │   │   └── page.tsx                   # NEW: Group dinner demo
│   │   │
│   │   └── what-to-order/
│   │       └── page.tsx                   # NEW: What to order demo
│   │
│   └── tastemakers/                       # EXISTS: Add demo banner
│       └── page.tsx                       # MODIFY: Add demo indicator
│
├── components/
│   ├── demo/                              # NEW: Demo-specific components
│   │   ├── demo-banner.tsx                # Global demo indicator
│   │   ├── demo-breadcrumb.tsx            # Navigation breadcrumbs
│   │   ├── feature-card.tsx               # Feature showcase card
│   │   ├── demo-header.tsx                # Page headers for demos
│   │   ├── algorithm-card.tsx             # Algorithm explanations
│   │   └── code-block.tsx                 # Syntax-highlighted code
│   │
│   ├── resume/                            # NEW: Resume components
│   │   ├── resume-header.tsx              # Contact info header
│   │   ├── experience-card.tsx            # Job experience cards
│   │   ├── education-card.tsx             # Education section
│   │   ├── skills-grid.tsx                # Technical skills grid
│   │   ├── project-card.tsx               # Featured projects
│   │   └── hobbies-section.tsx            # Personal interests
│   │
│   └── group-dinner/                      # PORT FROM MOBILE
│       ├── participant-selector.tsx       # User search and selection
│       ├── restaurant-swiper.tsx          # Card swipe interface
│       ├── match-breakdown.tsx            # Algorithm visualization
│       ├── selection-screen.tsx           # Choose from saved
│       └── confirmation-modal.tsx         # Final confirmation
│
├── lib/
│   └── demo-data.ts                       # NEW: Demo-specific mock data
│
└── docs/
    └── DEMO-PLAN.md                       # THIS FILE
```

### Files to Modify

```
beli-web/
├── app/
│   ├── layout.tsx                         # MODIFY: Add DemoBanner
│   └── tastemakers/page.tsx               # MODIFY: Add demo indicator
│
└── README.md                              # MODIFY: Portfolio focus
```

---

## Implementation Timeline

### Phase 1: Documentation & Planning (Complete)
- ✅ Create DEMO-PLAN.md
- ✅ Update README.md
- ✅ Document feature status

### Phase 2: Resume Landing Page (2-3 hours)
- [ ] Create resume components
- [ ] Convert resume.html content to React/Tailwind
- [ ] Implement smooth animations
- [ ] Add CTA button with transition
- [ ] Mobile responsive design
- [ ] Test print styles if needed

### Phase 3: Demo Hub (1-2 hours)
- [ ] Create demo hub page
- [ ] Build feature cards
- [ ] Implement navigation
- [ ] Add demo banner component
- [ ] Create breadcrumb navigation

### Phase 4: Feature Demos (4-6 hours)

**Tastemakers (0.5 hours)**:
- [ ] Add demo banner to existing pages
- [ ] Create feature stats display
- [ ] Add "Back to Demo" navigation

**What to Order (1.5-2 hours)**:
- [ ] Create standalone demo page
- [ ] Feature explanation section
- [ ] Algorithm visualization
- [ ] Interactive modal trigger
- [ ] Implementation highlights

**Group Dinner (2-3 hours)**:
- [ ] Port or create web demo version
- [ ] Participant selection UI
- [ ] Restaurant swiper (adapted for web)
- [ ] Match algorithm visualization
- [ ] Results/confirmation flow

### Phase 5: Polish & Testing (2-3 hours)
- [ ] Add transitions between pages
- [ ] Implement progress indicators
- [ ] Mobile responsive testing
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Screenshot/video capture for mobile features
- [ ] Final copy editing

**Total Estimated Time: 10-15 hours**

---

## Design System Consistency

All demo pages should maintain Beli's design language:

### Colors
```css
Primary: #0B7B7F (teal)
Primary Dark: #075159
Primary Light: #E6F7FF

Rating Colors:
- Excellent (8.0+): #22C55E (green)
- Good (7.0-7.9): #84CC16 (light green)
- Average (5.0-6.9): #F59E0B (orange)
- Poor (<5.0): #EF4444 (red)
```

### Typography
- Headings: SF Pro Display / Inter
- Body: System fonts
- Code: Monospace

### Components
- Cards with subtle shadows
- Rounded corners (8px, 12px, 16px)
- Generous white space
- High information density
- Rating bubbles (44x44px circular)

### Animations
- Fade in on load (0.3s ease)
- Hover transitions (0.2s)
- Button press feedback
- Smooth scroll behavior

---

## Technical Considerations

### Performance
- Lazy load images
- Code split routes
- Minimize bundle size
- Use Next.js Image component
- Optimize mock data loading

### SEO & Meta
```tsx
// app/page.tsx
export const metadata = {
  title: 'Victor Cox IV - Beli Portfolio Demo',
  description: 'Full-stack engineer showcasing restaurant discovery features',
  openGraph: {
    title: 'Victor Cox IV - Beli Portfolio',
    description: 'Three custom features built for Beli',
    images: ['/og-image.png'],
  },
};
```

### Accessibility
- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Color contrast compliance

### Mobile Responsiveness
```tsx
// Breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

- Resume: Single column on mobile, two-column on desktop
- Demo hub: 1 column mobile, 3 columns desktop
- Feature pages: Responsive stacking

---

## Testing Checklist

### Functionality
- [ ] Resume loads and renders correctly
- [ ] CTA button navigates to demo hub
- [ ] Demo hub shows all three features
- [ ] Each feature card links correctly
- [ ] Tastemakers pages load with demo banner
- [ ] What to Order modal opens and functions
- [ ] Group dinner demo flow completes
- [ ] Back navigation works throughout
- [ ] All links are functional

### Visual
- [ ] Design system colors applied consistently
- [ ] Typography hierarchy clear
- [ ] Spacing feels balanced
- [ ] Animations smooth (not janky)
- [ ] Rating bubbles display correctly
- [ ] Cards have proper shadows
- [ ] Images load correctly

### Responsive
- [ ] Mobile (375px): All content readable
- [ ] Tablet (768px): Good layout transitions
- [ ] Desktop (1280px+): Optimal experience
- [ ] Touch targets adequate on mobile (44px min)
- [ ] Text readable without zoom

### Cross-Browser
- [ ] Chrome/Edge (Chromium)
- [ ] Safari (WebKit)
- [ ] Firefox (Gecko)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] Images optimized

---

## Future Enhancements

### Phase 2 Additions (Post-Initial Demo)
1. **Interactive Code Tour**
   - Highlight key code snippets
   - Explain technical decisions
   - Link to GitHub repository

2. **Metrics Dashboard**
   - Lines of code written
   - Components created
   - Features shipped
   - Time investment

3. **Video Walkthrough**
   - Recorded demo tour
   - Voiceover explanation
   - Mobile app showcase

4. **A/B Comparison**
   - Before/After implementations
   - Show design iterations
   - Explain improvements made

5. **Technical Deep Dives**
   - Algorithm explanations
   - Architecture diagrams
   - Performance optimizations
   - Type system design

### Social Proof Elements
- GitHub contribution graph
- Commit history highlights
- Pull request examples
- Code review comments

### Personalization
- Why I chose Beli
- What I love about food tech
- How I'd contribute to the team
- Ideas for future features

---

## Deployment Strategy

### Development
```bash
cd beli-web
npm run dev
# Test at http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
- Automatically deploys from `main` branch
- Preview deployments for branches
- Custom domain: `beli-demo.vercel.app` or similar
- Environment variables configured

### Demo URL Structure
```
Production:
https://beli-web.vercel.app/           # Resume
https://beli-web.vercel.app/demo       # Demo hub
https://beli-web.vercel.app/demo/group-dinner
https://beli-web.vercel.app/demo/what-to-order
https://beli-web.vercel.app/tastemakers
```

---

## Presentation Tips

### For Founder Meeting
1. **Start with Resume** (30 seconds)
   - "Let me show you my background quickly..."
   - Highlight relevant experience
   - Click "Continue to Demo"

2. **Demo Hub Overview** (30 seconds)
   - "I built three major features..."
   - Quick overview of each
   - "Let me show you each one..."

3. **Feature Walkthroughs** (2-3 minutes each)
   - Tastemakers: Browse profiles, show articles
   - What to Order: Complete full flow
   - Group Dinner: Explain algorithm, show matching

4. **Technical Discussion** (5-10 minutes)
   - Dive into code if interested
   - Explain architectural decisions
   - Discuss scalability considerations

5. **Close with Enthusiasm**
   - Why you built this
   - What you learned
   - How you'd contribute

### Key Points to Emphasize
- Built without being asked (initiative)
- Full-stack implementation (mobile + web)
- Production-quality code (TypeScript, documentation)
- Design system adherence
- Algorithm design (What to Order, Group Dinner)
- User experience focus
- Comprehensive documentation

---

## Questions to Anticipate

**"How long did this take you?"**
> "About X weeks of evening/weekend work. The What to Order feature took about 15-20 hours, Group Dinner was about 20-25 hours, and Tastemakers about 10-15 hours. This includes research, design, implementation, and documentation."

**"Why did you build this?"**
> "I've been a Beli user and immediately saw the potential. I wanted to show you that I can contribute from day one and that I genuinely care about the product. Building these features helped me understand your tech stack and user experience deeply."

**"What would you change or improve?"**
> [Have thoughtful improvements ready for each feature]

**"How did you decide on these features?"**
> "I analyzed common pain points in restaurant discovery: finding credible recommendations (Tastemakers), coordinating group dining (Group Dinner), and decision paralysis with menus (What to Order). Each solves a real problem I've experienced."

**"Could this scale to production?"**
> "Yes, the architecture is production-ready with proper TypeScript types, error handling, and documentation. The algorithms are optimized, and I've considered edge cases. Some areas like data persistence and real-time syncing would need backend integration, but the foundations are solid."

---

## Success Metrics

### Immediate Goals
- ✅ Demonstrate technical proficiency
- ✅ Show product thinking and UX sense
- ✅ Prove initiative and passion
- ✅ Establish cultural fit

### Demo Success Indicators
- Founders spend time exploring features
- Technical questions about implementation
- Discussion about taking features to production
- Conversation about your role on the team
- Request to walk through code

### Follow-up Actions
- Share GitHub repository
- Provide deployment links
- Send additional documentation
- Discuss next steps

---

## Contact & Next Steps

**Victor Cox IV**
- Email: vcox484@gmail.com
- Phone: (651) 955-9920
- GitHub: [github.com/tor-iv](https://github.com/tor-iv)
- LinkedIn: [linkedin.com/in/tor-iv](https://linkedin.com/in/tor-iv)
- Portfolio: [tor-iv.com](https://tor-iv.com)

**Repository**: [github.com/tor-iv/beli-app](https://github.com/tor-iv/beli-app)

**Demo URL**: [TBD after deployment]

---

## Appendix: Technical Details

### Dependencies Added
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-tabs": "^1.0.4",
    "framer-motion": "^10.16.4",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

### Key TypeScript Types
```typescript
interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'web' | 'mobile' | 'both';
  stats: string[];
  href: string;
  tech: string[];
  highlights: string[];
}

interface TastemakerProfile {
  id: string;
  username: string;
  displayName: string;
  specialty: string;
  badges: Badge[];
  followers: number;
  engagementRate: number;
  // ... more fields
}

interface OrderSuggestion {
  restaurantId: string;
  partySize: number;
  hungerLevel: HungerLevel;
  items: MenuItem[];
  totalPrice: number;
  reasoning: string[];
  sharability: number;
}
```

### Environment Variables
```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_PORTFOLIO_NAME="Victor Cox IV"
```

---

**Last Updated**: October 28, 2024
**Version**: 1.0
**Author**: Victor Cox IV
