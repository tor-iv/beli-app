# Group Dinner Planner & Date Night Mode
## Detailed Product Specifications

---

## 🍽️ GROUP DINNER PLANNER

### Overview
An intelligent group dining coordinator that solves the "where should we eat?" paralysis by analyzing collective preferences, dietary needs, and social dynamics to suggest perfect restaurants for groups.

### Entry Points
1. **Primary**: Top-right hamburger menu → "Group Dinner Planner" (add between "Your Reservations" and "Your 2025 Goal")
2. **Contextual**: Floating action button when viewing lists with friends nearby
3. **Feed Integration**: Card in feed when multiple friends are active
4. **Proactive**: Push notification suggestions based on patterns
   - "It's Friday - plan dinner with your usual crew?"
   - "3 friends are free tonight"
   - "You haven't seen Sarah in 2 weeks - dinner?"

### User Flow Architecture

#### Phase 1: Session Creation
```
Screen: New Group Dinner
├── Input: Session Name (auto-suggest based on context)
│   └── Examples: "Friday Squad", "Team Lunch", "Birthday Dinner"
├── Date Selector
│   ├── Quick options: Tonight, Tomorrow, This Weekend
│   └── Calendar picker for future dates
├── Time Selector
│   ├── Smart defaults based on meal type
│   └── Lunch: 12-2pm, Dinner: 6-9pm slots
└── Occasion Tags (optional)
    └── Birthday, Celebration, Casual, Business, Catch-up
```

#### Phase 2: Participant Selection
```
Screen: Add Participants
├── Search Bar with autocomplete
├── Smart Suggestions
│   ├── Recent dinner companions
│   ├── Frequently tagged friends
│   ├── Friends who are "active now"
│   └── Location-based (friends nearby)
├── Participant Cards (showing)
│   ├── Avatar & Name
│   ├── Dietary restrictions (if known)
│   ├── Last dinner together
│   └── Taste match percentage
└── Group Size Limits
    ├── Minimum: 2 people (including organizer)
    └── Maximum: 10 people (customizable)
```

#### Phase 3: Preference Aggregation (Automatic Background Process)
```
Data Collection per Participant:
├── Want to Try Lists
│   └── Weight: Higher priority for restaurants on multiple lists
├── Been To Lists
│   └── Use for negative filtering (avoid recent visits)
├── Taste Profile
│   ├── Cuisine preferences (weighted by frequency)
│   ├── Price comfort zone
│   └── Ambiance preferences
├── Dietary Restrictions
│   ├── Hard restrictions (allergies, religious)
│   └── Soft preferences (dislikes, avoiding)
└── Schedule & Location
    ├── Coming from work/home
    └── Time constraints
```

#### Phase 4: The Shuffle Experience

**Initial Presentation:**
```
┌──────────────────────────────┐
│  GROUP COMPATIBILITY: 92%    │
│  ────────────────────────    │
│                              │
│  [Restaurant Hero Image]      │
│                              │
│  PICCOLO SOGNO               │
│  Italian • $$$ • 0.8 mi      │
│  ⭐ 4.8 (327 reviews)        │
│                              │
│  📊 Match Breakdown:         │
│  ├── Sarah: 95% (loves it!)  │
│  ├── Mike: 88% (good match)  │
│  └── Emma: 91% (wants to try)│
│                              │
│  ✓ Why This Works:           │
│  • On 3 want-to-try lists    │
│  • Full vegetarian menu      │
│  • Central location (0.8mi)  │
│  • Available at 7:30 PM      │
│  • Similar to Mike's faves   │
│                              │
│  [🔄 SHUFFLE] [💬] [✓ LOCK]  │
└──────────────────────────────┘
```

**Shuffle Animation Sequence:**
1. Current card shrinks slightly (scale: 0.95)
2. Stack of 3 cards appears behind
3. Cards fan out horizontally
4. Rapid flip through 5-10 options (50ms each)
5. Slow down and settle on selection
6. New card scales up with bounce effect
7. "Why This Works" points fade in sequentially

#### Phase 5: Decision Making

**Voting System (Optional):**
```
Notification to Participants:
"Alex suggests Piccolo Sogno for tonight!"

Voting Interface:
┌──────────────────────────────┐
│  Cast Your Vote              │
│                              │
│  Piccolo Sogno               │
│  [Mini preview card]         │
│                              │
│  [👍 Yes!] [🤔 Maybe] [👎 No] │
│                              │
│  Comments: [___________]     │
│                              │
│  Live Results:               │
│  ✓ Alex (organizer)         │
│  ✓ Sarah "Perfect!"         │
│  🤔 Mike "Bit pricey?"       │
│  ... Emma (voting)          │
└──────────────────────────────┘
```

**Instant Decision Mode:**
- Organizer can skip voting
- "Executive decision" for time-sensitive plans
- Others notified of final choice

#### Phase 6: Confirmation & Booking

```
Final Confirmation Screen:
┌──────────────────────────────┐
│  🎉 Dinner Confirmed!        │
│                              │
│  Piccolo Sogno               │
│  Tonight at 7:30 PM          │
│  Party of 4                  │
│                              │
│  📱 Everyone's notified      │
│                              │
│  Next Steps:                 │
│  ┌─────────────────────┐    │
│  │ 📅 Add to Calendar  │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 🎫 Reserve on Resy  │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 💬 Open Group Chat  │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 📍 Get Directions   │    │
│  └─────────────────────┘    │
└──────────────────────────────┘
```

### The Shuffle Algorithm

```typescript
interface ShuffleAlgorithm {
  // Main scoring function
  scoreRestaurant(restaurant: Restaurant, group: GroupDinner): number {
    const weights = {
      wantToTry: 0.35,      // 35% - Collective desire
      tasteMatch: 0.25,     // 25% - Cuisine compatibility  
      dietary: 0.20,        // 20% - Restriction handling
      location: 0.10,       // 10% - Central & accessible
      price: 0.05,          // 5%  - Budget appropriate
      novelty: 0.05         // 5%  - New experiences
    };

    let score = 0;

    // Want to Try Overlap Score
    const wantToTryScore = this.calculateWantToTryOverlap(restaurant, group);
    score += wantToTryScore * weights.wantToTry;

    // Taste Compatibility Score
    const tasteScore = this.calculateTasteCompatibility(restaurant, group);
    score += tasteScore * weights.tasteMatch;

    // Dietary Accommodation Score
    const dietaryScore = this.checkDietaryAccommodation(restaurant, group);
    score += dietaryScore * weights.dietary;

    // Location Convenience Score
    const locationScore = this.calculateLocationScore(restaurant, group);
    score += locationScore * weights.location;

    // Price Appropriateness Score
    const priceScore = this.calculatePriceScore(restaurant, group);
    score += priceScore * weights.price;

    // Novelty Bonus
    const noveltyScore = this.calculateNoveltyScore(restaurant, group);
    score += noveltyScore * weights.novelty;

    // Apply penalties
    score = this.applyPenalties(score, restaurant, group);

    return Math.min(100, Math.max(0, score));
  }

  // Detailed scoring subfunctions
  calculateWantToTryOverlap(restaurant, group): number {
    const wanting = group.members.filter(m => 
      m.wantToTry.includes(restaurant.id)
    ).length;
    
    // Exponential scoring for multiple wants
    if (wanting === group.members.length) return 100;
    if (wanting >= group.members.length * 0.75) return 85;
    if (wanting >= group.members.length * 0.5) return 70;
    if (wanting >= group.members.length * 0.25) return 50;
    if (wanting > 0) return 30;
    return 0;
  }

  calculateTasteCompatibility(restaurant, group): number {
    // Aggregate group cuisine preferences
    const groupPreferences = new Map();
    group.members.forEach(member => {
      member.cuisinePreferences.forEach((score, cuisine) => {
        groupPreferences.set(cuisine, 
          (groupPreferences.get(cuisine) || 0) + score
        );
      });
    });

    // Check restaurant cuisine match
    const cuisineScore = groupPreferences.get(restaurant.cuisine) || 0;
    const maxPossible = group.members.length * 10;
    return (cuisineScore / maxPossible) * 100;
  }

  checkDietaryAccommodation(restaurant, group): number {
    const restrictions = group.members.flatMap(m => m.dietary);
    if (!restrictions.length) return 100;

    let accommodationScore = 100;
    restrictions.forEach(restriction => {
      if (!restaurant.accommodates.includes(restriction)) {
        accommodationScore -= 50; // Heavy penalty for each unmet need
      }
    });
    return Math.max(0, accommodationScore);
  }

  applyPenalties(baseScore, restaurant, group): number {
    let score = baseScore;

    // Recency penalty
    const recentVisits = group.members.filter(m => 
      m.recentlyVisited.includes(restaurant.id)
    ).length;
    if (recentVisits > 0) {
      score *= (1 - (recentVisits / group.members.length) * 0.5);
    }

    // Repeatedly suggested penalty
    if (group.previousSuggestions?.includes(restaurant.id)) {
      score *= 0.7;
    }

    // Bad experience penalty
    const badExperiences = group.members.filter(m =>
      m.negativeExperiences?.includes(restaurant.id)
    ).length;
    if (badExperiences > 0) {
      score *= 0.3;
    }

    return score;
  }
}
```

### Advanced Features

#### Smart Conflict Resolution
```
Detected Conflicts:
├── Dietary Conflicts
│   └── Alert: "Sarah is vegetarian but Mike suggested steakhouse"
├── Budget Conflicts
│   └── Suggest: "Emma prefers $$, showing affordable options"
├── Distance Conflicts
│   └── Solution: "Finding spots central to everyone"
└── Time Conflicts
    └── Adapt: "Mike arrives late, suggesting quick service"
```

#### Group Learning System
```
Pattern Recognition:
├── "This group always chooses Italian"
├── "You tend to go casual with this crew"
├── "Sarah and Mike both love spicy food"
└── "This group prefers walkable distances"

Preference Evolution:
├── Track successful dinners
├── Note failed suggestions
├── Update taste compatibility scores
└── Improve future recommendations
```

#### Multi-Stage Planning
For complex group dinners:
```
1. Pre-dinner drinks: Bar nearby main restaurant
2. Dinner: Main event
3. After-dinner: Dessert spot or cocktails
4. Full itinerary with walking directions
```

---

## 💕 DATE NIGHT MODE

### Overview
A romantic restaurant discovery and planning feature that prioritizes ambiance, intimacy, and special experiences over pure food quality ratings.

### Entry Points
1. **Primary**: Top-right hamburger menu → "Date Night Mode" (add between "Your Reservations" and "Your 2025 Goal")
2. **Profile**: Special section if partner is linked
3. **Contextual**: Weekend/special date prompts
4. **Calendar**: Integration with anniversaries and special dates
5. **Feed**: Romantic restaurant suggestions on Fridays/Saturdays

### Core Features

#### Mood & Occasion Setting
```
Initial Configuration:
├── Mood Selection
│   ├── 🕯️ Romantic (candlelit, intimate)
│   ├── 🎉 Celebration (birthday, promotion)
│   ├── ✨ Special Occasion (anniversary, proposal)
│   ├── 😊 Casual Date (relaxed, fun)
│   └── 🌃 Night Out (fancy, dressed up)
├── Date Details
│   ├── Date/Time selection
│   ├── Partner selection (if linked)
│   └── Surprise mode toggle
└── Budget Range
    └── Slider: $$ to $$$$
```

#### Ambiance Scoring System

```typescript
interface AmbianceProfile {
  romantic: {
    lighting: 'dim' | 'candle' | 'mood' | 'bright';
    seating: 'booth' | 'corner' | 'private' | 'open';
    spacing: number; // feet between tables
    music: 'none' | 'soft' | 'live' | 'loud';
    score: 1-5; // hearts display
  };
  
  atmosphere: {
    noiseLevel: number; // decibels
    crowdedness: 'intimate' | 'moderate' | 'busy' | 'packed';
    dresscode: 'casual' | 'smart-casual' | 'business' | 'formal';
    vibe: string[]; // ['cozy', 'elegant', 'trendy', 'classic']
  };

  features: {
    view: boolean;
    outdoor: boolean;
    fireplace: boolean;
    privateRooms: boolean;
    rooftop: boolean;
    waterfront: boolean;
    garden: boolean;
    liveMusic: string | null;
  };

  timing: {
    sunsetView: boolean;
    bestTimes: string[]; // ['golden-hour', 'dinner', 'late-night']
    quietHours: string[]; // ['5-6pm', '9-10pm']
  };
}
```

#### Discovery Interface

**Card Stack Navigation:**
```
┌──────────────────────────────┐
│  LE BERNARDIN                │
│  French • $$$$               │
│  ──────────────────          │
│                              │
│  [Romantic ambiance photo]   │
│                              │
│  💕💕💕💕💕 Perfect Romance │
│                              │
│  Ambiance Highlights:        │
│  🕯️ Candlelit tables         │
│  🤫 Whisper quiet            │
│  🍷 500+ wine selection      │
│  👁️ City skyline views       │
│  🎼 Live piano Fridays       │
│                              │
│  Couples Say:                │
│  "Proposed here! Perfect" -J │
│  "Anniversary tradition" -M&K │
│  "Most romantic meal" -Chris │
│                              │
│  Special Tonight:             │
│  Window table available       │
│  Sunset at 7:23 PM           │
│                              │
│ [❤️ Save] [📅 Book] [➡️ Next]│
└──────────────────────────────┘
```

**Swipe Gestures:**
- Right: Save to date night list
- Left: Not interested
- Up: Book immediately
- Down: See more details

#### Partner Integration

**Linked Partner Features:**
```
Shared Experience:
├── Combined Preferences
│   ├── Merge "want to try" lists
│   ├── Show mutual favorites
│   └── Avoid partner's dislikes
├── Relationship Timeline
│   ├── First date spot
│   ├── Anniversary locations
│   ├── Special memories tagged
│   └── "Our places" collection
├── Surprise Planning
│   ├── Hide details from partner
│   ├── Send mysterious invites
│   ├── Reveal at arrival
│   └── Capture reaction
└── Split Decision
    ├── Both swipe on options
    ├── Show matches only
    └── Mutual excitement metric
```

#### Surprise Mode

**Planning Interface:**
```
┌──────────────────────────────┐
│  🎁 SURPRISE MODE ACTIVE     │
│                              │
│  Your partner will see:      │
│  ┌────────────────────┐      │
│  │ Saturday Night      │      │
│  │ "Dress nicely 👗"   │      │
│  │ "Pick up at 7 PM"   │      │
│  │ "Trust me 😘"       │      │
│  └────────────────────┘      │
│                              │
│  You're planning:            │
│  Le Bernardin                │
│  Window table reserved       │
│  Champagne pre-ordered       │
│                              │
│  [Edit Teaser Message]       │
│  [Send Invite to Partner]    │
└──────────────────────────────┘
```

**Partner's View:**
```
┌──────────────────────────────┐
│  💕 Date Night Surprise!     │
│                              │
│  Alex has planned something  │
│  special for Saturday        │
│                              │
│  What you need to know:      │
│  📅 Saturday, Dec 14         │
│  ⏰ Pick up at 7:00 PM       │
│  👗 Dress Code: Elegant      │
│  🚫 No peeking!              │
│                              │
│  Hint: "You mentioned wanting│
│  to try something French"    │
│                              │
│  [😍 Can't Wait!]            │
└──────────────────────────────┘
```

#### Experience Enhancement

**Pre-Arrival Arrangements:**
```
Make It Special:
├── Restaurant Arrangements
│   ├── Pre-order wine/champagne
│   ├── Request specific table
│   ├── Arrange surprise dessert
│   ├── Add celebration message
│   └── Notify of special occasion
├── Additional Services
│   ├── Flower delivery to table
│   ├── Photographer booking
│   ├── Musicians request
│   └── Custom menu printing
└── Transportation
    ├── Book ride service
    ├── Arrange valet
    └── Plan scenic route
```

#### Memory Banking

**Post-Date Capture:**
```
┌──────────────────────────────┐
│  How was Le Bernardin?       │
│                              │
│  [📸 Add photos from tonight]│
│                              │
│  Rate the Romance:           │
│  [💕💕💕💕💕]                │
│                              │
│  Special Moments:            │
│  [We ordered the tasting    ]│
│  [menu and loved every...]   ]│
│                              │
│  Highlights:                 │
│  ☑ Food was incredible       │
│  ☑ Perfect ambiance          │
│  ☑ Great service             │
│  ☐ Would return              │
│                              │
│  💑 Relationship Milestone?  │
│  [Add to Our Story →]        │
└──────────────────────────────┘
```

### Date Night Algorithm

```typescript
class DateNightAlgorithm {
  scoreForRomance(restaurant: Restaurant, preferences: DatePreferences): number {
    const weights = {
      ambiance: 0.40,     // 40% - Most important for dates
      experience: 0.25,   // 25% - Special features/uniqueness
      reviews: 0.15,      // 15% - Couple-specific feedback
      availability: 0.10, // 10% - Can get good table
      food: 0.10         // 10% - Still matters, less weight
    };

    let score = 0;

    // Ambiance scoring (detailed breakdown)
    const ambianceScore = this.scoreAmbiance(restaurant);
    score += ambianceScore * weights.ambiance;

    // Experience scoring
    const experienceScore = this.scoreExperience(restaurant, preferences);
    score += experienceScore * weights.experience;

    // Couple reviews scoring
    const reviewScore = this.scoreCoupleReviews(restaurant);
    score += reviewScore * weights.reviews;

    // Availability scoring (good tables, times)
    const availabilityScore = this.scoreAvailability(restaurant, preferences);
    score += availabilityScore * weights.availability;

    // Food quality (from regular ratings)
    const foodScore = restaurant.rating * 10;
    score += foodScore * weights.food;

    return Math.round(score);
  }

  scoreAmbiance(restaurant): number {
    const factors = {
      lighting: {
        dim: 25,
        candle: 30,
        mood: 20,
        bright: 0
      },
      noise: {
        quiet: 30,
        moderate: 20,
        lively: 10,
        loud: 0
      },
      seating: {
        booth: 25,
        corner: 20,
        private: 30,
        open: 5
      },
      spacing: (restaurant.tableSpacing > 6) ? 20 : 10
    };

    let score = 0;
    score += factors.lighting[restaurant.lighting] || 0;
    score += factors.noise[restaurant.noiseLevel] || 0;
    score += factors.seating[restaurant.seatingType] || 0;
    score += factors.spacing;

    // Bonus features
    if (restaurant.hasView) score += 15;
    if (restaurant.hasFireplace) score += 10;
    if (restaurant.liveMusic === 'jazz' || restaurant.liveMusic === 'piano') score += 10;
    if (restaurant.rooftop) score += 20;

    return Math.min(100, score);
  }

  scoreExperience(restaurant, preferences): number {
    let score = 50; // Base score

    // Match mood to restaurant vibe
    const moodMatch = this.matchMoodToVibe(preferences.mood, restaurant.vibe);
    score += moodMatch * 30;

    // Special occasion handling
    if (preferences.occasion === 'anniversary' && restaurant.specialOccasion) {
      score += 20;
    }

    // Unique experiences
    if (restaurant.hasUniqueFeature) score += 15;
    if (restaurant.instagrammable) score += 10;
    if (restaurant.hasStory) score += 5;

    return Math.min(100, score);
  }
}
```

### Analytics & Insights

#### Success Metrics
```
Group Dinner Planner:
├── Average time to decision: < 3 minutes
├── Shuffle count before lock: 2-3 times
├── Group satisfaction rate: Track post-dinner
├── Participation rate: % who vote/engage
└── Rebooking rate: Groups using again

Date Night Mode:
├── Romance rating correlation
├── Memory creation rate
├── Partner feature adoption
├── Special occasion coverage
└── Surprise mode success rate
```

#### Learning Loops
```
Continuous Improvement:
├── Post-dinner surveys (simple emoji)
├── Implicit signals (rebooking, sharing)
├── Failed suggestion analysis
├── Time-of-day optimization
└── Seasonal preference adaptation
```

---

## 🎯 Implementation Priorities

### Phase 1: Core Functionality (Week 1)
- Basic group creation and member adding
- Simple preference aggregation
- Manual restaurant suggestions
- Basic date night mood selection

### Phase 2: Smart Algorithms (Week 2)
- Weighted shuffle algorithm
- Dietary restriction handling
- Ambiance scoring system
- Compatibility calculations

### Phase 3: Social Features (Week 3)
- Real-time voting
- Group chat integration
- Partner linking
- Surprise mode

### Phase 4: Enhancements (Week 4)
- Animation polish
- Memory banking
- Advanced arrangements
- Calendar integration

### Phase 5: Intelligence (Week 5)
- Learning algorithms
- Pattern recognition
- Predictive suggestions
- Optimization loops

---

## 🚀 Why These Features Win

### Market Differentiators
1. **Solves Universal Problem**: Everyone struggles with group dining decisions
2. **Network Effects**: Each user brings their dining group
3. **High Engagement**: Planning requires multiple users, multiple opens
4. **Revenue Opportunities**: Premium features, reservation partnerships, sponsored suggestions
5. **Emotional Connection**: Creating memories, not just tracking meals

### User Value
- **Time Saved**: 3 minutes vs 30 minutes of debate
- **Stress Reduced**: Algorithm handles the politics
- **Better Outcomes**: Data-driven selections beat random choices
- **Relationship Building**: Thoughtful date planning, group bonding
- **Discovery Enhancement**: Find places perfect for specific contexts

### Technical Innovation
- **Multi-user preference synthesis**
- **Real-time collaborative decision making**
- **Context-aware recommendations**
- **Relationship-based learning**
- **Ambiance quantification**

This transforms Beli from a personal tool to a social platform - the missing piece in restaurant discovery!