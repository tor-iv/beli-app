# Beli Backend Business Logic

## Overview

This document provides detailed specifications for all core algorithms and business logic in the Beli backend. Each algorithm includes pseudocode, complexity analysis, and implementation notes.

---

## Table of Contents

1. [Group Dinner Matching Algorithm](#group-dinner-matching-algorithm)
2. ["What to Order" Recommendation Engine](#what-to-order-recommendation-engine)
3. [User Match Percentage Calculation](#user-match-percentage-calculation)
4. [Leaderboard Ranking System](#leaderboard-ranking-system)
5. [Restaurant Scoring System](#restaurant-scoring-system)
6. [Activity Feed Generation](#activity-feed-generation)
7. [Streak Calculation](#streak-calculation)
8. [Taste Profile Analytics](#taste-profile-analytics)
9. [Search Ranking Algorithm](#search-ranking-algorithm)
10. [Notification Priority System](#notification-priority-system)

---

## 1. Group Dinner Matching Algorithm

### Purpose

Find the best restaurant matches for a group based on want-to-try lists, dietary restrictions, and location convenience.

### Algorithm

```typescript
function findGroupMatches(
  participantIds: number[],
  date: Date,
  dietaryRestrictions: string[] = [],
  maxResults: number = 20
): GroupMatch[] {

  // Step 1: Fetch all participants' want-to-try lists
  const participantLists = await Promise.all(
    participantIds.map(id =>
      db.getUserRestaurants(id, 'want_to_try')
    )
  );

  // Step 2: Find restaurant intersection (restaurants on multiple lists)
  const restaurantCounts = new Map<number, number>();
  const restaurantOverlap = new Map<number, Set<number>>(); // restaurant -> user IDs

  for (let i = 0; i < participantIds.length; i++) {
    const userId = participantIds[i];
    const restaurants = participantLists[i];

    for (const restaurant of restaurants) {
      const count = restaurantCounts.get(restaurant.id) || 0;
      restaurantCounts.set(restaurant.id, count + 1);

      if (!restaurantOverlap.has(restaurant.id)) {
        restaurantOverlap.set(restaurant.id, new Set());
      }
      restaurantOverlap.get(restaurant.id)!.add(userId);
    }
  }

  // Step 3: Filter restaurants with at least 2 participants interested
  const candidateRestaurantIds = Array.from(restaurantCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([id, _]) => id);

  if (candidateRestaurantIds.length === 0) {
    return []; // No matches found
  }

  // Step 4: Fetch restaurant details
  const restaurants = await db.getRestaurantsByIds(candidateRestaurantIds);

  // Step 5: Calculate match score for each restaurant
  const matches: GroupMatch[] = [];

  for (const restaurant of restaurants) {
    const overlapCount = restaurantCounts.get(restaurant.id) || 0;
    const overlapRatio = overlapCount / participantIds.length;

    // Scoring components
    let score = 0;
    const reasons: string[] = [];

    // Component 1: Want-to-try overlap (70% weight)
    const wantToTryScore = overlapRatio * 70;
    score += wantToTryScore;

    if (overlapRatio === 1) {
      reasons.push(`All ${participantIds.length} people want to try this!`);
    } else if (overlapCount >= 3) {
      reasons.push(`${overlapCount} out of ${participantIds.length} people want to try`);
    } else {
      reasons.push(`${overlapCount} people want to try`);
    }

    // Component 2: Dietary compatibility (20% weight)
    let dietaryScore = 0;
    if (dietaryRestrictions.length > 0) {
      const canAccommodate = checkDietaryCompatibility(
        restaurant,
        dietaryRestrictions
      );
      if (canAccommodate) {
        dietaryScore = 20;
        reasons.push(`Accommodates ${dietaryRestrictions.join(', ')}`);
      }
    } else {
      dietaryScore = 20; // Full score if no restrictions
    }
    score += dietaryScore;

    // Component 3: Location convenience (10% weight)
    const avgDistance = await calculateAvgDistanceForGroup(
      restaurant,
      participantIds
    );
    let locationScore = Math.max(0, 10 - avgDistance);
    score += locationScore;

    if (avgDistance < 1) {
      reasons.push('Close to everyone');
    } else if (avgDistance < 3) {
      reasons.push('Convenient location');
    }

    // Additional match reasons based on restaurant attributes
    if (restaurant.rating >= 8.5) {
      reasons.push('Highly rated by Beli users');
    }

    if (restaurant.tags.includes('special_occasion') && participantIds.length >= 4) {
      reasons.push('Perfect for special occasions');
    }

    // Check availability (mocked 70% success rate)
    const isAvailable = Math.random() > 0.3;

    matches.push({
      restaurant,
      score: Math.round(score),
      matchReasons: reasons,
      availability: isAvailable ? {
        date,
        timeSlot: 'dinner',
        reservationLink: `https://resy.com/${restaurant.id}`
      } : null,
      participantOverlap: Array.from(restaurantOverlap.get(restaurant.id)!)
    });
  }

  // Step 6: Sort by score and return top matches
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, maxResults);
}

// Helper: Check if restaurant can accommodate dietary restrictions
function checkDietaryCompatibility(
  restaurant: Restaurant,
  restrictions: string[]
): boolean {
  // Check menu items for compatible options
  const menuItems = await db.getMenuItems(restaurant.id);

  for (const restriction of restrictions) {
    let hasOption = false;

    for (const item of menuItems) {
      if (restriction === 'vegetarian' && item.isVegetarian) {
        hasOption = true;
        break;
      }
      if (restriction === 'vegan' && item.isVegan) {
        hasOption = true;
        break;
      }
      if (restriction === 'gluten-free' && item.isGlutenFree) {
        hasOption = true;
        break;
      }
    }

    if (!hasOption) {
      return false; // Cannot accommodate this restriction
    }
  }

  return true; // All restrictions can be accommodated
}

// Helper: Calculate average distance from restaurant to all participants
async function calculateAvgDistanceForGroup(
  restaurant: Restaurant,
  participantIds: number[]
): Promise<number> {
  const participants = await db.getUsersByIds(participantIds);
  let totalDistance = 0;
  let count = 0;

  for (const participant of participants) {
    if (participant.location) {
      const distance = calculateDistance(
        restaurant.location.coordinates,
        participant.location.coordinates
      );
      totalDistance += distance;
      count++;
    }
  }

  return count > 0 ? totalDistance / count : 5; // Default 5 miles if no locations
}
```

### Complexity Analysis

- **Time**: O(n * m + r * log(r))
  - n = number of participants
  - m = avg restaurants per participant
  - r = candidate restaurants
- **Space**: O(r * n) for overlap tracking

### Optimization Strategies

1. **Pre-calculate intersections**: For common friend groups, cache results
2. **Parallel queries**: Fetch all participant data simultaneously
3. **Index optimization**: Ensure `user_restaurant_relations` has composite index on `(user_id, status)`
4. **Redis cache**: Cache match results for 5 minutes

---

## 2. "What to Order" Recommendation Engine

### Purpose

Recommend optimal menu items based on party size, hunger level, and dietary restrictions.

### Algorithm

```typescript
interface OrderSuggestion {
  items: MenuItem[];
  totalPrice: number;
  pricePerPerson: number;
  reasoning: string[];
  estimatedSharability: string;
}

function generateOrderRecommendation(
  restaurantId: number,
  partySize: number,
  hungerLevel: 'light' | 'moderate' | 'very-hungry',
  mealTime: 'breakfast' | 'lunch' | 'dinner' = 'dinner',
  dietaryRestrictions: string[] = []
): OrderSuggestion {

  // Step 1: Fetch and categorize menu items
  const allMenuItems = await db.getMenuItems(restaurantId);

  const categorized = {
    appetizers: allMenuItems.filter(i => i.category === 'appetizer'),
    entrees: allMenuItems.filter(i => i.category === 'entree'),
    sides: allMenuItems.filter(i => i.category === 'side'),
    desserts: allMenuItems.filter(i => i.category === 'dessert'),
    drinks: allMenuItems.filter(i => i.category === 'drink')
  };

  // Step 2: Apply filters
  const filterItems = (items: MenuItem[]) => {
    return items.filter(item => {
      // Filter by meal time
      if (item.mealTime && !item.mealTime.includes(mealTime)) {
        return false;
      }

      // Filter by dietary restrictions
      for (const restriction of dietaryRestrictions) {
        if (restriction === 'vegetarian' && !item.isVegetarian) return false;
        if (restriction === 'vegan' && !item.isVegan) return false;
        if (restriction === 'gluten-free' && !item.isGlutenFree) return false;
      }

      return true;
    });
  };

  const filtered = {
    appetizers: filterItems(categorized.appetizers),
    entrees: filterItems(categorized.entrees),
    sides: filterItems(categorized.sides),
    desserts: filterItems(categorized.desserts),
    drinks: filterItems(categorized.drinks)
  };

  // Step 3: Calculate hunger points
  const hungerMultipliers = {
    'light': 0.8,
    'moderate': 1.2,
    'very-hungry': 1.8
  };

  const basePoints = partySize * 10;
  const hungerPoints = basePoints * hungerMultipliers[hungerLevel];

  // Step 4: Build order
  const selectedItems: MenuItem[] = [];
  let remainingPoints = hungerPoints;
  const reasoning: string[] = [];

  // Portion point values
  const portionPoints = {
    'small': 5,
    'medium': 10,
    'large': 15,
    'shareable': 12
  };

  // Solo diner logic
  if (partySize === 1) {
    if (hungerLevel === 'light') {
      // 1 appetizer OR 1 entree
      const item = selectBestItem(
        [...filtered.appetizers, ...filtered.entrees],
        ['high', 'medium']
      );
      if (item) selectedItems.push(item);
      reasoning.push('Light meal for one');
    } else if (hungerLevel === 'moderate') {
      // 1 entree, maybe appetizer
      const entree = selectBestItem(filtered.entrees, ['high', 'medium']);
      if (entree) selectedItems.push(entree);

      if (Math.random() > 0.5) {
        const appetizer = selectBestItem(filtered.appetizers, ['high']);
        if (appetizer) selectedItems.push(appetizer);
      }
      reasoning.push('Satisfying meal for one');
    } else {
      // appetizer + entree + dessert
      const entree = selectBestItem(filtered.entrees, ['high']);
      const appetizer = selectBestItem(filtered.appetizers, ['high']);
      const dessert = selectBestItem(filtered.desserts, ['high']);

      if (entree) selectedItems.push(entree);
      if (appetizer) selectedItems.push(appetizer);
      if (dessert) selectedItems.push(dessert);
      reasoning.push('Full meal with dessert');
    }
  }

  // Group logic (2+)
  else {
    // Appetizers
    const appetizerCount = Math.min(
      Math.ceil(partySize / 2),
      hungerLevel === 'light' ? 1 : hungerLevel === 'moderate' ? 2 : 3
    );

    const appetizers = selectMultipleItems(
      filtered.appetizers,
      appetizerCount,
      ['high', 'medium']
    );
    selectedItems.push(...appetizers);

    if (appetizerCount > 0) {
      reasoning.push(`${appetizerCount} shareable ${appetizerCount === 1 ? 'appetizer' : 'appetizers'}`);
    }

    // Entrees
    let entreeCount = partySize;
    if (hungerLevel === 'light') {
      entreeCount = Math.ceil(partySize * 0.7);
    } else if (hungerLevel === 'very-hungry') {
      entreeCount = partySize;
    }

    const entrees = selectMultipleItems(
      filtered.entrees,
      entreeCount,
      ['high', 'medium']
    );
    selectedItems.push(...entrees);

    // Sides (for moderate/very-hungry)
    if (hungerLevel !== 'light' && partySize >= 3) {
      const sideCount = Math.ceil(partySize / 3);
      const sides = selectMultipleItems(
        filtered.sides,
        sideCount,
        ['high', 'medium']
      );
      selectedItems.push(...sides);

      if (sides.length > 0) {
        reasoning.push(`${sides.length} shared ${sides.length === 1 ? 'side' : 'sides'}`);
      }
    }

    // Desserts (for very-hungry groups)
    if (hungerLevel === 'very-hungry' && partySize >= 2) {
      const dessertCount = Math.max(1, Math.floor(partySize / 3));
      const desserts = selectMultipleItems(
        filtered.desserts,
        dessertCount,
        ['high', 'medium']
      );
      selectedItems.push(...desserts);

      if (desserts.length > 0) {
        reasoning.push('Dessert to finish strong');
      }
    }

    // Drinks (for 2+ people)
    if (partySize >= 2) {
      const drinkCount = Math.min(partySize, 4);
      const drinks = selectMultipleItems(
        filtered.drinks,
        drinkCount,
        ['high', 'medium']
      );
      selectedItems.push(...drinks);
    }
  }

  // Step 5: Calculate totals
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const pricePerPerson = totalPrice / partySize;

  // Step 6: Add budget reasoning
  if (pricePerPerson < 30) {
    reasoning.push('Budget-friendly selection');
  } else if (pricePerPerson > 75) {
    reasoning.push('Premium dining experience');
  }

  // Step 7: Estimate sharability
  let sharability = '';
  if (partySize === 1) {
    sharability = hungerLevel === 'light'
      ? 'Light meal for one'
      : hungerLevel === 'moderate'
      ? 'Satisfying meal for one'
      : 'Full meal with dessert';
  } else {
    const itemsPerPerson = selectedItems.length / partySize;
    if (itemsPerPerson >= 1.5) {
      sharability = 'Generous portions for sharing';
    } else if (itemsPerPerson >= 1) {
      sharability = 'Perfect for sharing family-style';
    } else {
      sharability = 'Lighter selection, ideal for tapas-style';
    }
  }

  return {
    items: selectedItems,
    totalPrice,
    pricePerPerson,
    reasoning,
    estimatedSharability: sharability
  };
}

// Helper: Select best item by popularity
function selectBestItem(
  items: MenuItem[],
  popularityLevels: string[]
): MenuItem | null {
  const filtered = items.filter(item =>
    popularityLevels.includes(item.popularity)
  );

  if (filtered.length === 0) return null;

  // Sort by popularity, then price
  filtered.sort((a, b) => {
    const popularityOrder = { high: 3, medium: 2, low: 1 };
    const aScore = popularityOrder[a.popularity] || 0;
    const bScore = popularityOrder[b.popularity] || 0;
    if (aScore !== bScore) return bScore - aScore;
    return a.price - b.price; // Cheaper first if same popularity
  });

  return filtered[0];
}

// Helper: Select multiple diverse items
function selectMultipleItems(
  items: MenuItem[],
  count: number,
  popularityLevels: string[]
): MenuItem[] {
  const filtered = items.filter(item =>
    popularityLevels.includes(item.popularity)
  );

  // Sort by popularity
  filtered.sort((a, b) => {
    const popularityOrder = { high: 3, medium: 2, low: 1 };
    return (popularityOrder[b.popularity] || 0) - (popularityOrder[a.popularity] || 0);
  });

  // Take top N, ensuring diversity
  const selected: MenuItem[] = [];
  const selectedNames = new Set<string>();

  for (const item of filtered) {
    if (selected.length >= count) break;

    // Avoid duplicates (similar names)
    const normalized = item.name.toLowerCase();
    if (!selectedNames.has(normalized)) {
      selected.push(item);
      selectedNames.add(normalized);
    }
  }

  return selected;
}
```

### Complexity Analysis

- **Time**: O(m * log(m)) where m = menu items (sorting)
- **Space**: O(m) for categorization

### Optimization Strategies

1. **Cache menu items**: TTL 1 hour (menus rarely change)
2. **Pre-categorize**: Store category in database
3. **Parallel processing**: Filter all categories simultaneously

---

## 3. User Match Percentage Calculation

### Purpose

Calculate how similar two users are based on restaurant overlap and cuisine preferences.

### Algorithm

```typescript
interface MatchResult {
  matchPercentage: number;
  sharedRestaurants: number;
  totalRestaurants: number;
  topSharedCuisines: string[];
}

async function calculateMatchPercentage(
  user1Id: number,
  user2Id: number
): Promise<MatchResult> {

  // Step 1: Check cache
  const cacheKey = `match:${Math.min(user1Id, user2Id)}:${Math.max(user1Id, user2Id)}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Step 2: Fetch both users' "been" lists
  const [user1Restaurants, user2Restaurants] = await Promise.all([
    db.getUserRestaurants(user1Id, 'been'),
    db.getUserRestaurants(user2Id, 'been')
  ]);

  const user1Set = new Set(user1Restaurants.map(r => r.restaurantId));
  const user2Set = new Set(user2Restaurants.map(r => r.restaurantId));

  // Step 3: Calculate Jaccard similarity (intersection / union)
  const intersection = new Set([...user1Set].filter(id => user2Set.has(id)));
  const union = new Set([...user1Set, ...user2Set]);

  const jaccardSimilarity = union.size > 0
    ? intersection.size / union.size
    : 0;

  // Step 4: Calculate cuisine preference similarity
  const user1Cuisines = await getUserTopCuisines(user1Id, user1Restaurants);
  const user2Cuisines = await getUserTopCuisines(user2Id, user2Restaurants);

  const cuisineSet1 = new Set(user1Cuisines.map(c => c.cuisine));
  const cuisineSet2 = new Set(user2Cuisines.map(c => c.cuisine));

  const cuisineIntersection = new Set(
    [...cuisineSet1].filter(c => cuisineSet2.has(c))
  );
  const cuisineUnion = new Set([...cuisineSet1, ...cuisineSet2]);

  const cuisineSimilarity = cuisineUnion.size > 0
    ? cuisineIntersection.size / cuisineUnion.size
    : 0;

  // Step 5: Weighted average
  const matchScore = (jaccardSimilarity * 0.7) + (cuisineSimilarity * 0.3);

  // Step 6: Scale to 20-99 range (minimum 20 to show some connection)
  const matchPercentage = Math.max(20, Math.min(99, Math.round(matchScore * 100)));

  // Step 7: Get shared restaurants and top shared cuisines
  const sharedRestaurantIds = Array.from(intersection);
  const sharedRestaurants = await db.getRestaurantsByIds(sharedRestaurantIds);

  const sharedCuisines = new Map<string, number>();
  for (const restaurant of sharedRestaurants) {
    for (const cuisine of restaurant.cuisines) {
      sharedCuisines.set(cuisine, (sharedCuisines.get(cuisine) || 0) + 1);
    }
  }

  const topSharedCuisines = Array.from(sharedCuisines.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cuisine, _]) => cuisine);

  const result: MatchResult = {
    matchPercentage,
    sharedRestaurants: intersection.size,
    totalRestaurants: union.size,
    topSharedCuisines
  };

  // Step 8: Cache result for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(result));

  return result;
}

// Helper: Get user's top cuisines
async function getUserTopCuisines(
  userId: number,
  userRestaurants: UserRestaurantRelation[]
): Promise<Array<{cuisine: string, count: number}>> {

  const restaurantIds = userRestaurants.map(r => r.restaurantId);
  const restaurants = await db.getRestaurantsByIds(restaurantIds);

  const cuisineCounts = new Map<string, number>();
  for (const restaurant of restaurants) {
    for (const cuisine of restaurant.cuisines) {
      cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) || 0) + 1);
    }
  }

  return Array.from(cuisineCounts.entries())
    .map(([cuisine, count]) => ({ cuisine, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
```

### Complexity Analysis

- **Time**: O(n + m) where n, m = restaurant counts for each user
- **Space**: O(n + m) for sets

### Caching Strategy

- **Key**: `match:{userId1}:{userId2}` (sorted IDs)
- **TTL**: 5 minutes
- **Invalidation**: On new restaurant added to either user's list

---

## 4. Leaderboard Ranking System

### Purpose

Rank users based on activity and engagement.

### Algorithm

```typescript
interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
}

async function calculateLeaderboard(
  city?: string,
  limit: number = 100
): Promise<LeaderboardEntry[]> {

  // Ranking formula:
  // score = (beenCount * 10) + (currentStreak * 5) + (totalReviews * 3) + (followersCount * 1)

  const query = `
    SELECT
      u.*,
      (
        (u.been_count * 10) +
        (u.current_streak * 5) +
        (u.total_reviews * 3) +
        (u.followers_count * 1)
      ) as score
    FROM users u
    WHERE u.deleted_at IS NULL
      ${city ? 'AND u.city = $1' : ''}
    ORDER BY score DESC
    LIMIT $${city ? 2 : 1}
  `;

  const params = city ? [city, limit] : [limit];
  const results = await db.query(query, params);

  return results.rows.map((row, index) => ({
    rank: index + 1,
    user: row,
    score: row.score
  }));
}

// Background job: Update user ranks nightly
async function updateUserRanks() {
  const leaderboard = await calculateLeaderboard(undefined, 10000);

  // Batch update ranks
  const updates = leaderboard.map(entry => ({
    userId: entry.user.id,
    rank: entry.rank
  }));

  await db.batchUpdateRanks(updates);
}
```

### Complexity Analysis

- **Time**: O(n * log(n)) where n = total users (sorting)
- **Space**: O(n)

### Optimization

- Pre-calculate scores as denormalized column
- Update ranks via nightly background job
- Cache leaderboard for 1 hour

---

## 5. Restaurant Scoring System

### Purpose

Calculate restaurant scores based on user ratings and recommendations.

### Algorithm

```typescript
async function updateRestaurantScores(restaurantId: number) {

  // Fetch all ratings for this restaurant
  const relations = await db.query(`
    SELECT rating, user_id, status
    FROM user_restaurant_relations
    WHERE restaurant_id = $1 AND rating IS NOT NULL
  `, [restaurantId]);

  // Separate by recommendation source
  const recRatings: number[] = []; // From recommendations
  const friendRatings: number[] = []; // From friends (need to determine)
  const allRatings: number[] = [];

  for (const relation of relations.rows) {
    allRatings.push(relation.rating);

    // Check if recommended
    const isRecommended = relation.status === 'recommended';
    if (isRecommended) {
      recRatings.push(relation.rating);
    }

    // Check if from friend (simplified: anyone who isn't recommender)
    if (!isRecommended) {
      friendRatings.push(relation.rating);
    }
  }

  // Calculate averages
  const recScore = recRatings.length > 0
    ? recRatings.reduce((a, b) => a + b, 0) / recRatings.length
    : 0;

  const friendScore = friendRatings.length > 0
    ? friendRatings.reduce((a, b) => a + b, 0) / friendRatings.length
    : 0;

  const averageScore = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 0;

  // Update restaurant
  await db.query(`
    UPDATE restaurants
    SET
      rec_score = $1,
      rec_score_sample_size = $2,
      friend_score = $3,
      friend_score_sample_size = $4,
      average_score = $5,
      average_score_sample_size = $6,
      rating_count = $7,
      updated_at = NOW()
    WHERE id = $8
  `, [
    recScore,
    recRatings.length,
    friendScore,
    friendRatings.length,
    averageScore,
    allRatings.length,
    allRatings.length,
    restaurantId
  ]);
}
```

### Trigger: Update on Rating Change

```sql
CREATE OR REPLACE FUNCTION update_restaurant_scores_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue background job to update scores
  INSERT INTO job_queue (job_type, data)
  VALUES ('update_restaurant_scores', jsonb_build_object('restaurantId', NEW.restaurant_id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER urr_update_scores
AFTER INSERT OR UPDATE OF rating ON user_restaurant_relations
FOR EACH ROW EXECUTE FUNCTION update_restaurant_scores_trigger();
```

---

## 6. Activity Feed Generation

### Purpose

Generate personalized activity feed showing friends' activities.

### Algorithm

```typescript
async function getActivityFeed(
  userId: number,
  cursor?: string,
  limit: number = 20
): Promise<{ items: FeedItem[], nextCursor?: string }> {

  // Step 1: Get user's following list
  const following = await db.query(`
    SELECT following_id
    FROM follows
    WHERE follower_id = $1
  `, [userId]);

  const followingIds = following.rows.map(r => r.following_id);

  if (followingIds.length === 0) {
    return { items: [] };
  }

  // Step 2: Fetch activities from following
  // cursor is base64 encoded timestamp
  const cursorTimestamp = cursor
    ? new Date(Buffer.from(cursor, 'base64').toString())
    : new Date();

  const activities = await db.query(`
    SELECT
      af.*,
      u.username, u.display_name, u.avatar,
      r.name as restaurant_name, r.images as restaurant_images, r.cuisines
    FROM activity_feed af
    JOIN users u ON af.user_id = u.id
    LEFT JOIN restaurants r ON af.restaurant_id = r.id
    WHERE
      af.user_id = ANY($1)
      AND af.created_at < $2
      AND af.deleted_at IS NULL
    ORDER BY af.created_at DESC
    LIMIT $3
  `, [followingIds, cursorTimestamp, limit + 1]);

  // Step 3: Check if more results exist
  const hasMore = activities.rows.length > limit;
  const items = hasMore ? activities.rows.slice(0, limit) : activities.rows;

  // Step 4: Enrich with engagement data
  const activityIds = items.map(a => a.id);

  const [likes, bookmarks, comments] = await Promise.all([
    db.getActivityLikes(activityIds, userId),
    db.getActivityBookmarks(activityIds, userId),
    db.getActivityCommentCounts(activityIds)
  ]);

  const enrichedItems = items.map(activity => ({
    ...activity,
    isLiked: likes.has(activity.id),
    isBookmarked: bookmarks.has(activity.id),
    commentCount: comments.get(activity.id) || 0
  }));

  // Step 5: Generate next cursor
  const nextCursor = hasMore
    ? Buffer.from(items[items.length - 1].created_at.toISOString()).toString('base64')
    : undefined;

  return {
    items: enrichedItems,
    nextCursor
  };
}
```

### Optimization: Pre-computed Feeds

For heavy users, pre-compute feeds every 5 minutes:

```typescript
// Background job
async function precomputeFeedForUser(userId: number) {
  const feed = await getActivityFeed(userId, undefined, 100);

  // Store in Redis
  await redis.setex(
    `feed:${userId}`,
    300, // 5 min TTL
    JSON.stringify(feed)
  );
}
```

---

## 7. Streak Calculation

### Purpose

Track user's current dining streak (consecutive days with restaurant visits).

### Algorithm

```typescript
async function calculateStreak(userId: number): Promise<number> {

  // Fetch all visit dates for user (sorted desc)
  const visits = await db.query(`
    SELECT DISTINCT visit_date
    FROM user_restaurant_relations
    WHERE user_id = $1 AND status = 'been' AND visit_date IS NOT NULL
    ORDER BY visit_date DESC
  `, [userId]);

  if (visits.rows.length === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let expectedDate = new Date(today);

  for (const row of visits.rows) {
    const visitDate = new Date(row.visit_date);
    visitDate.setHours(0, 0, 0, 0);

    // Check if visit matches expected date
    if (visitDate.getTime() === expectedDate.getTime()) {
      streak++;
      // Move expected date back one day
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }

  return streak;
}

// Background job: Update all streaks nightly
async function updateAllStreaks() {
  const users = await db.query('SELECT id FROM users WHERE deleted_at IS NULL');

  for (const user of users.rows) {
    const streak = await calculateStreak(user.id);
    await db.query(`
      UPDATE users
      SET
        current_streak = $1,
        longest_streak = GREATEST(longest_streak, $1),
        updated_at = NOW()
      WHERE id = $2
    `, [streak, user.id]);
  }
}
```

---

## 8. Taste Profile Analytics

### Purpose

Analyze user's dining patterns and preferences.

### Algorithm

```typescript
interface TasteProfile {
  last30Days: {
    restaurantCount: number;
    cuisineCount: number;
    activityPercentile: number;
  };
  cuisineBreakdown: Array<{
    cuisine: string;
    count: number;
    avgScore: number;
  }>;
  cityBreakdown: Array<{
    city: string;
    state: string;
    count: number;
    avgScore: number;
  }>;
  totals: {
    totalRestaurants: number;
    totalCities: number;
    totalCuisines: number;
  };
}

async function calculateTasteProfile(userId: number): Promise<TasteProfile> {

  // Fetch all user's "been" restaurants
  const relations = await db.query(`
    SELECT
      urr.rating,
      urr.visit_date,
      r.cuisines,
      r.city,
      r.state,
      r.country
    FROM user_restaurant_relations urr
    JOIN restaurants r ON urr.restaurant_id = r.id
    WHERE urr.user_id = $1 AND urr.status = 'been'
  `, [userId]);

  // Single-pass aggregation
  const cuisineMap = new Map<string, {count: number, totalScore: number}>();
  const cityMap = new Map<string, {count: number, totalScore: number, state: string}>();
  const countrySet = new Set<string>();

  let restaurantsLast30Days = 0;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const row of relations.rows) {
    // Count last 30 days
    if (row.visit_date && new Date(row.visit_date) >= thirtyDaysAgo) {
      restaurantsLast30Days++;
    }

    // Aggregate cuisines
    for (const cuisine of row.cuisines) {
      const existing = cuisineMap.get(cuisine) || { count: 0, totalScore: 0 };
      existing.count++;
      existing.totalScore += row.rating || 0;
      cuisineMap.set(cuisine, existing);
    }

    // Aggregate cities
    const cityKey = `${row.city}, ${row.state}`;
    const existing = cityMap.get(cityKey) || { count: 0, totalScore: 0, state: row.state };
    existing.count++;
    existing.totalScore += row.rating || 0;
    cityMap.set(cityKey, existing);

    // Count countries
    countrySet.add(row.country);
  }

  // Build cuisine breakdown
  const cuisineBreakdown = Array.from(cuisineMap.entries())
    .map(([cuisine, data]) => ({
      cuisine,
      count: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Build city breakdown
  const cityBreakdown = Array.from(cityMap.entries())
    .map(([cityStr, data]) => {
      const [city, state] = cityStr.split(', ');
      return {
        city,
        state,
        count: data.count,
        avgScore: data.count > 0 ? data.totalScore / data.count : 0
      };
    })
    .sort((a, b) => b.count - a.count);

  // Calculate activity percentile (requires all users' data)
  const percentile = await calculateActivityPercentile(userId, restaurantsLast30Days);

  return {
    last30Days: {
      restaurantCount: restaurantsLast30Days,
      cuisineCount: Array.from(cuisineMap.keys()).length,
      activityPercentile: percentile
    },
    cuisineBreakdown,
    cityBreakdown,
    totals: {
      totalRestaurants: relations.rows.length,
      totalCities: cityMap.size,
      totalCuisines: cuisineMap.size
    }
  };
}

async function calculateActivityPercentile(
  userId: number,
  userRestaurantCount: number
): Promise<number> {

  const result = await db.query(`
    SELECT COUNT(*) as lower_count
    FROM (
      SELECT user_id, COUNT(*) as count
      FROM user_restaurant_relations
      WHERE status = 'been'
        AND visit_date >= NOW() - INTERVAL '30 days'
      GROUP BY user_id
    ) subquery
    WHERE count < $1
  `, [userRestaurantCount]);

  const totalUsers = await db.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL');

  const percentile = (result.rows[0].lower_count / totalUsers.rows[0].count) * 100;
  return Math.round(percentile);
}
```

---

## 9. Search Ranking Algorithm

### Purpose

Rank search results by relevance.

### Algorithm

```typescript
interface SearchResult {
  restaurant: Restaurant;
  relevanceScore: number;
}

async function searchRestaurants(
  query: string,
  userId?: number
): Promise<SearchResult[]> {

  // Use PostgreSQL full-text search with trigram similarity
  const results = await db.query(`
    SELECT
      r.*,
      similarity(r.name, $1) as name_similarity,
      similarity(array_to_string(r.cuisines, ' '), $1) as cuisine_similarity
    FROM restaurants r
    WHERE
      r.deleted_at IS NULL
      AND (
        similarity(r.name, $1) > 0.3
        OR array_to_string(r.cuisines, ' ') ILIKE '%' || $1 || '%'
        OR r.neighborhood ILIKE '%' || $1 || '%'
      )
    ORDER BY
      (similarity(r.name, $1) * 2 + similarity(array_to_string(r.cuisines, ' '), $1)) DESC,
      r.average_score DESC
    LIMIT 50
  `, [query]);

  // Personalization boost (if user logged in)
  if (userId) {
    const userLists = await db.getUserRestaurantIds(userId);

    return results.rows.map(r => {
      let relevanceScore = (r.name_similarity * 2) + r.cuisine_similarity;

      // Boost if on user's list
      if (userLists.has(r.id)) {
        relevanceScore += 0.5;
      }

      return {
        restaurant: r,
        relevanceScore
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  return results.rows.map(r => ({
    restaurant: r,
    relevanceScore: (r.name_similarity * 2) + r.cuisine_similarity
  }));
}
```

---

## 10. Notification Priority System

### Purpose

Prioritize notifications to avoid spam.

### Algorithm

```typescript
async function shouldSendNotification(
  userId: number,
  notificationType: string,
  actorUserId: number
): Promise<boolean> {

  // Rate limiting rules
  const limits = {
    'follow': { maxPerHour: 10, maxPerDay: 50 },
    'rating_liked': { maxPerHour: 20, maxPerDay: 100 },
    'comment': { maxPerHour: 15, maxPerDay: 75 }
  };

  const limit = limits[notificationType] || { maxPerHour: 5, maxPerDay: 25 };

  // Check hourly limit
  const hourlyCount = await redis.get(`notif:${userId}:${notificationType}:hour`);
  if (hourlyCount && parseInt(hourlyCount) >= limit.maxPerHour) {
    return false;
  }

  // Check daily limit
  const dailyCount = await redis.get(`notif:${userId}:${notificationType}:day`);
  if (dailyCount && parseInt(dailyCount) >= limit.maxPerDay) {
    return false;
  }

  // Check if user follows actor (higher priority)
  const isFollowing = await db.isFollowing(userId, actorUserId);
  if (!isFollowing && notificationType !== 'follow') {
    // Lower priority for non-followers
    const randomSkip = Math.random() < 0.5;
    if (randomSkip) return false;
  }

  // Increment counters
  await redis.incr(`notif:${userId}:${notificationType}:hour`);
  await redis.expire(`notif:${userId}:${notificationType}:hour`, 3600);

  await redis.incr(`notif:${userId}:${notificationType}:day`);
  await redis.expire(`notif:${userId}:${notificationType}:day`, 86400);

  return true;
}
```

---

## Summary

All core business logic is now documented with:
- Clear purpose and use cases
- Detailed pseudocode implementations
- Complexity analysis
- Optimization strategies
- Caching approaches

These algorithms can be directly translated to your backend implementation language (TypeScript/Node.js, Go, Python, etc.).

---

## Next Steps

1. Review [backend-architecture.md](./backend-architecture.md) for system design
2. Study [backend-api-spec.md](./backend-api-spec.md) for API endpoints
3. Review [backend-database-schema.md](./backend-database-schema.md) for data models
4. Follow [backend-integration-guide.md](./backend-integration-guide.md) for migration plan
5. Implement core algorithms in your chosen backend framework
6. Write unit tests for each algorithm
7. Benchmark performance with realistic data volumes
