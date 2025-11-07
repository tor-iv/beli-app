import { User, Restaurant, UserRestaurantRelation, FeedItem, List, ListCategory, ListScope, Notification, TastemakerPost, Reservation, ReservationPriorityLevel, MenuItem, OrderSuggestion, HungerLevel, MealTime, ActivityComment } from '@/types';
import { mockUsers, currentUser } from '@/data/mock/users';
import { mockRestaurants } from '@/data/mock/restaurants';
import { mockUserRestaurantRelations } from '@/data/mock/userRestaurantRelations';
import { mockReviews, Review } from '@/data/mock/reviews';
import { mockActivities, trendingRestaurants, recentCheckIns, Activity } from '@/data/mock/activities';
import { mockLists, getUserListsByType, featuredLists } from '@/data/mock/lists';
import { mockNotifications } from '@/data/mock/notifications';
import { mockRecentSearches, RecentSearch } from '@/data/mock/recentSearches';
import { mockTastemakers } from '@/data/mock/tastemakers';
import { mockTastemakerPosts, getFeaturedPosts, getPostsByUserId } from '@/data/mock/tastemakerPosts';
import { mockReservations, getUserPriorityLevel, getAvailableReservations, getClaimedReservationsByUser, getSharedReservationsByUser, getReservationReminders } from '@/data/mock/reservations';
import { allMenuItems, restaurantMenus } from '@/data/mock/menuItems';

// Simulate network delay - reduced for better development performance
const delay = (ms: number = 50) => new Promise(resolve => setTimeout(resolve, ms));

export class MockDataService {
  // In-memory cache for match percentages (5-minute TTL)
  private static matchPercentageCache = new Map<string, { value: number, timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  // User-related methods
  static async getCurrentUser(): Promise<User> {
    await delay();
    return currentUser;
  }

  static async getUserById(userId: string): Promise<User | null> {
    await delay();
    return mockUsers.find(user => user.id === userId) || null;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    await delay();
    return mockUsers.find(user => user.username === username) || null;
  }

  static async searchUsers(query: string): Promise<User[]> {
    await delay();
    const lowercaseQuery = query.toLowerCase();
    return mockUsers.filter(user =>
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.displayName.toLowerCase().includes(lowercaseQuery)
    );
  }

  static async getUserStats(userId: string): Promise<User['stats'] | null> {
    await delay();
    const user = mockUsers.find(u => u.id === userId);
    return user?.stats || null;
  }

  static async getUserMatchPercentage(userId: string, targetUserId: string): Promise<number> {
    // Check cache first
    const cacheKey = `${userId}-${targetUserId}`;
    const cached = this.matchPercentageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value; // Return cached value without delay
    }

    await delay();

    // Get both users' restaurant relations
    const userRelations = mockUserRestaurantRelations.filter(
      rel => rel.userId === userId && (rel.status === 'been' || rel.status === 'want_to_try')
    );
    const targetRelations = mockUserRestaurantRelations.filter(
      rel => rel.userId === targetUserId && (rel.status === 'been' || rel.status === 'want_to_try')
    );

    if (userRelations.length === 0 || targetRelations.length === 0) {
      // Return a baseline match percentage (30-50%) if either user has no data
      return Math.floor(Math.random() * 21) + 30; // Random between 30-50
    }

    // Calculate overlap in restaurants
    const userRestaurantIds = new Set(userRelations.map(rel => rel.restaurantId));
    const targetRestaurantIds = new Set(targetRelations.map(rel => rel.restaurantId));

    const intersection = [...userRestaurantIds].filter(id => targetRestaurantIds.has(id));
    const union = new Set([...userRestaurantIds, ...targetRestaurantIds]);

    // Jaccard similarity coefficient
    const jaccardSimilarity = intersection.length / union.size;

    // Get both users' cuisine preferences
    const userCuisines = new Set<string>();
    const targetCuisines = new Set<string>();

    userRelations.forEach(rel => {
      const restaurant = mockRestaurants.find(r => r.id === rel.restaurantId);
      restaurant?.cuisine.forEach(c => userCuisines.add(c));
    });

    targetRelations.forEach(rel => {
      const restaurant = mockRestaurants.find(r => r.id === rel.restaurantId);
      restaurant?.cuisine.forEach(c => targetCuisines.add(c));
    });

    const cuisineIntersection = [...userCuisines].filter(c => targetCuisines.has(c));
    const cuisineUnion = new Set([...userCuisines, ...targetCuisines]);
    const cuisineSimilarity = cuisineIntersection.length / cuisineUnion.size;

    // Combined score: 70% restaurant overlap + 30% cuisine similarity
    const matchScore = (jaccardSimilarity * 0.7 + cuisineSimilarity * 0.3) * 100;

    // Add some variance and ensure it's between 30-99
    const variance = Math.floor(Math.random() * 11) - 5; // -5 to +5
    const finalScore = Math.max(30, Math.min(99, Math.floor(matchScore + variance)));

    // Cache the result
    this.matchPercentageCache.set(cacheKey, { value: finalScore, timestamp: Date.now() });

    return finalScore;
  }

  // Batch version of getUserMatchPercentage to avoid N+1 queries
  static async getBatchMatchPercentages(userId: string, targetUserIds: string[]): Promise<Record<string, number>> {
    await delay();

    const results: Record<string, number> = {};

    // Get user's relations once
    const userRelations = mockUserRestaurantRelations.filter(
      rel => rel.userId === userId && (rel.status === 'been' || rel.status === 'want_to_try')
    );
    const userRestaurantIds = new Set(userRelations.map(rel => rel.restaurantId));

    // Get user's cuisines once
    const userCuisines = new Set<string>();
    userRelations.forEach(rel => {
      const restaurant = mockRestaurants.find(r => r.id === rel.restaurantId);
      restaurant?.cuisine.forEach(c => userCuisines.add(c));
    });

    // Calculate match percentage for each target user
    targetUserIds.forEach(targetUserId => {
      const targetRelations = mockUserRestaurantRelations.filter(
        rel => rel.userId === targetUserId && (rel.status === 'been' || rel.status === 'want_to_try')
      );

      if (userRelations.length === 0 || targetRelations.length === 0) {
        results[targetUserId] = Math.floor(Math.random() * 21) + 30;
        return;
      }

      const targetRestaurantIds = new Set(targetRelations.map(rel => rel.restaurantId));
      const intersection = [...userRestaurantIds].filter(id => targetRestaurantIds.has(id));
      const union = new Set([...userRestaurantIds, ...targetRestaurantIds]);
      const jaccardSimilarity = intersection.length / union.size;

      const targetCuisines = new Set<string>();
      targetRelations.forEach(rel => {
        const restaurant = mockRestaurants.find(r => r.id === rel.restaurantId);
        restaurant?.cuisine.forEach(c => targetCuisines.add(c));
      });

      const cuisineIntersection = [...userCuisines].filter(c => targetCuisines.has(c));
      const cuisineUnion = new Set([...userCuisines, ...targetCuisines]);
      const cuisineSimilarity = cuisineIntersection.length / cuisineUnion.size;

      const matchScore = (jaccardSimilarity * 0.7 + cuisineSimilarity * 0.3) * 100;
      const variance = Math.floor(Math.random() * 11) - 5;
      results[targetUserId] = Math.max(30, Math.min(99, Math.floor(matchScore + variance)));
    });

    return results;
  }

  // Social relationship methods
  // In-memory storage for following relationships (in a real app, this would be in a database)
  private static followingRelationships: Map<string, Set<string>> = new Map([
    // currentUser (id: '1') follows some users
    ['1', new Set(['2', '3', '4', '5'])],
    // Other users follow currentUser
    ['2', new Set(['1', '3'])],
    ['3', new Set(['1', '2'])],
    ['4', new Set(['1'])],
    ['5', new Set(['1'])],
  ]);

  static async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    await delay(50); // Faster delay for social checks
    const userFollowing = this.followingRelationships.get(userId);
    return userFollowing?.has(targetUserId) || false;
  }

  static async followUser(userId: string, targetUserId: string): Promise<void> {
    await delay(100);

    // Get or create the following set for this user
    let userFollowing = this.followingRelationships.get(userId);
    if (!userFollowing) {
      userFollowing = new Set();
      this.followingRelationships.set(userId, userFollowing);
    }

    // Add the target user to following set
    userFollowing.add(targetUserId);

    // Update follower/following counts
    const user = mockUsers.find(u => u.id === userId);
    const targetUser = mockUsers.find(u => u.id === targetUserId);

    if (user && user.stats) {
      user.stats.following = (user.stats.following || 0) + 1;
    }
    if (targetUser && targetUser.stats) {
      targetUser.stats.followers = (targetUser.stats.followers || 0) + 1;
    }
  }

  static async unfollowUser(userId: string, targetUserId: string): Promise<void> {
    await delay(100);

    const userFollowing = this.followingRelationships.get(userId);
    if (userFollowing) {
      userFollowing.delete(targetUserId);

      // Update follower/following counts
      const user = mockUsers.find(u => u.id === userId);
      const targetUser = mockUsers.find(u => u.id === targetUserId);

      if (user && user.stats) {
        user.stats.following = Math.max(0, (user.stats.following || 0) - 1);
      }
      if (targetUser && targetUser.stats) {
        targetUser.stats.followers = Math.max(0, (targetUser.stats.followers || 0) - 1);
      }
    }
  }

  static async getFollowers(userId: string): Promise<User[]> {
    await delay();
    const followers: User[] = [];

    // Find all users who follow this user
    for (const [followerId, following] of this.followingRelationships.entries()) {
      if (following.has(userId)) {
        const follower = mockUsers.find(u => u.id === followerId);
        if (follower) {
          followers.push(follower);
        }
      }
    }

    return followers;
  }

  static async getFollowing(userId: string): Promise<User[]> {
    await delay();
    const following = this.followingRelationships.get(userId);
    if (!following) return [];

    return mockUsers.filter(u => following.has(u.id));
  }

  // Restaurant-related methods
  static async getAllRestaurants(): Promise<Restaurant[]> {
    await delay();
    return mockRestaurants;
  }

  static async getRestaurantById(restaurantId: string): Promise<Restaurant | null> {
    await delay();
    return mockRestaurants.find(restaurant => restaurant.id === restaurantId) || null;
  }

  static async searchRestaurants(query: string, filters?: {
    cuisine?: string[];
    priceRange?: string[];
    neighborhood?: string;
    maxDistance?: number;
  }): Promise<Restaurant[]> {
    await delay();
    let filteredRestaurants = mockRestaurants;

    // Text search
    if (query.trim()) {
      const lowercaseQuery = query.trim().toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(restaurant => {
        const textFields: string[] = [
          restaurant.name,
          restaurant.location.neighborhood,
          restaurant.location.city,
          restaurant.location.state,
          restaurant.location.address,
          restaurant.priceRange,
          ...(restaurant.cuisine ?? []),
          ...(restaurant.tags ?? []),
          ...(restaurant.popularDishes ?? []),
        ];

        return textFields.some(field =>
          typeof field === 'string' && field.toLowerCase().includes(lowercaseQuery)
        );
      });
    }

    // Cuisine filter
    if (filters?.cuisine && filters.cuisine.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.cuisine.some(c => filters.cuisine!.includes(c))
      );
    }

    // Price range filter
    if (filters?.priceRange && filters.priceRange.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        filters.priceRange!.includes(restaurant.priceRange)
      );
    }

    // Neighborhood filter
    if (filters?.neighborhood) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.location.neighborhood === filters.neighborhood
      );
    }

    // Distance filter
    if (filters?.maxDistance) {
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.distance && restaurant.distance <= filters.maxDistance!
      );
    }

    return filteredRestaurants;
  }

  static async getRestaurantsByIds(restaurantIds: string[]): Promise<Restaurant[]> {
    await delay();
    const idSet = new Set(restaurantIds);
    return mockRestaurants.filter(restaurant => idSet.has(restaurant.id));
  }

  static async getTrendingRestaurants(): Promise<Restaurant[]> {
    const restaurantIds = trendingRestaurants.map(restaurant => restaurant.id);
    if (restaurantIds.length === 0) {
      const randomSelection = await this.getRandomRestaurants(6);
      return this.getRestaurantsWithStatus(randomSelection.map(restaurant => restaurant.id), { sortBy: 'rating' });
    }

    return this.getRestaurantsWithStatus(restaurantIds, { sortBy: 'rating' });
  }

  // User-Restaurant Relations
  static async getUserRestaurantRelations(userId: string): Promise<UserRestaurantRelation[]> {
    await delay();
    return mockUserRestaurantRelations.filter(relation => relation.userId === userId);
  }

  static async getUserRestaurantsByStatus(userId: string, status: 'been' | 'want_to_try' | 'recommended'): Promise<Restaurant[]> {
    await delay();
    const relations = mockUserRestaurantRelations.filter(
      relation => relation.userId === userId && relation.status === status
    );
    const restaurantIds = relations.map(relation => relation.restaurantId);
    return mockRestaurants.filter(restaurant => restaurantIds.includes(restaurant.id));
  }

  static async addRestaurantToUserList(userId: string, restaurantId: string, status: 'been' | 'want_to_try' | 'recommended', data?: {
    rating?: number;
    notes?: string;
    photos?: string[];
    tags?: string[];
  }): Promise<UserRestaurantRelation> {
    await delay();

    const newRelation: UserRestaurantRelation = {
      userId,
      restaurantId,
      status,
      rating: data?.rating,
      notes: data?.notes,
      photos: data?.photos,
      tags: data?.tags,
      createdAt: new Date(),
      visitDate: status === 'been' ? new Date() : undefined,
    };

    // In a real app, this would save to the backend
    mockUserRestaurantRelations.push(newRelation);
    return newRelation;
  }

  static async removeRestaurantFromUserList(userId: string, restaurantId: string): Promise<void> {
    await delay();

    // In a real app, this would remove from the backend
    const index = mockUserRestaurantRelations.findIndex(
      relation => relation.userId === userId && relation.restaurantId === restaurantId
    );
    if (index > -1) {
      mockUserRestaurantRelations.splice(index, 1);
    }
  }

  // Reviews
  static async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    await delay();
    return mockReviews.filter(review => review.restaurantId === restaurantId);
  }

  static async getUserReviews(userId: string): Promise<Review[]> {
    await delay();
    return mockReviews.filter(review => review.userId === userId);
  }

  static async addReview(review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): Promise<Review> {
    await delay();

    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date(),
      helpfulCount: 0,
    };

    // In a real app, this would save to the backend
    mockReviews.push(newReview);
    return newReview;
  }

  // Activity Feed
  static async getActivityFeed(userId?: string, limit: number = 20): Promise<Activity[]> {
    await delay();

    // If userId is provided, filter for that user's activity
    let activities = userId
      ? mockActivities.filter(activity => activity.user.id === userId)
      : mockActivities;

    // Sort by timestamp (newest first) and limit results
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  static async addActivity(activity: Omit<FeedItem, 'id'>): Promise<Activity> {
    await delay();

    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      interactions: {
        likes: [],
        comments: [],
        bookmarks: [],
      },
    };

    // In a real app, this would save to the backend
    mockActivities.unshift(newActivity);
    return newActivity;
  }

  static async likeActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const likes = activity.interactions.likes;
      if (!likes.includes(userId)) {
        likes.push(userId);
      }
    }
  }

  static async unlikeActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const likes = activity.interactions.likes;
      const index = likes.indexOf(userId);
      if (index > -1) {
        likes.splice(index, 1);
      }
    }
  }

  static async bookmarkActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const bookmarks = activity.interactions.bookmarks;
      if (!bookmarks.includes(userId)) {
        bookmarks.push(userId);
      }
    }
  }

  static async unbookmarkActivity(activityId: string, userId: string): Promise<void> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (activity && activity.interactions) {
      const bookmarks = activity.interactions.bookmarks;
      const index = bookmarks.indexOf(userId);
      if (index > -1) {
        bookmarks.splice(index, 1);
      }
    }
  }

  static async addCommentToActivity(activityId: string, userId: string, content: string): Promise<ActivityComment> {
    await delay();

    const activity = mockActivities.find(a => a.id === activityId);
    if (!activity || !activity.interactions) {
      throw new Error('Activity not found');
    }

    const newComment: ActivityComment = {
      id: `comment-${Date.now()}`,
      userId,
      content,
      timestamp: new Date(),
    };

    activity.interactions.comments.push(newComment);
    return newComment;
  }

  // Lists
  static async getUserLists(userId: string): Promise<List[]> {
    await delay();
    return mockLists.filter(list => list.userId === userId);
  }

  static async getUserListsByType(userId: string, type: ListScope, category: ListCategory): Promise<List[]> {
    await delay();
    return getUserListsByType(userId, type, category);
  }

  static async getFeaturedLists(): Promise<List[]> {
    await delay();
    return featuredLists;
  }

  static async getListById(listId: string): Promise<List | null> {
    await delay();
    return mockLists.find(list => list.id === listId) || null;
  }

  static async createList(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List> {
    await delay();

    const newList: List = {
      ...list,
      id: `list-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real app, this would save to the backend
    mockLists.push(newList);
    return newList;
  }

  static async updateList(listId: string, updates: Partial<List>): Promise<List | null> {
    await delay();

    const listIndex = mockLists.findIndex(list => list.id === listId);
    if (listIndex === -1) {
      return null;
    }

    mockLists[listIndex] = {
      ...mockLists[listIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return mockLists[listIndex];
  }

  static async deleteList(listId: string): Promise<void> {
    await delay();

    const index = mockLists.findIndex(list => list.id === listId);
    if (index > -1) {
      mockLists.splice(index, 1);
    }
  }

  static async getUserListProgress(userId: string, listId: string): Promise<{ visited: number; total: number }> {
    await delay();

    const list = mockLists.find(l => l.id === listId);
    if (!list) {
      return { visited: 0, total: 0 };
    }

    // Get user's been list to check which restaurants they've visited (direct access to avoid nested delay)
    const userRelations = mockUserRestaurantRelations.filter(relation => relation.userId === userId);
    const visitedRestaurantIds = userRelations
      .filter(rel => rel.status === 'been')
      .map(rel => rel.restaurantId);

    // Count how many restaurants in the list the user has been to
    const visited = list.restaurants.filter(restaurantId =>
      visitedRestaurantIds.includes(restaurantId)
    ).length;

    return {
      visited,
      total: list.restaurants.length,
    };
  }

  // Leaderboard
  static async getLeaderboard(city?: string, limit: number = 50): Promise<User[]> {
    await delay();

    let users = [...mockUsers];

    // Filter by city if provided
    if (city) {
      users = users.filter(user => user.location.city === city);
    }

    // Sort by rank (lower is better)
    return users
      .sort((a, b) => a.stats.rank - b.stats.rank)
      .slice(0, limit);
  }

  // Utility methods
  static async getRandomRestaurants(count: number = 5): Promise<Restaurant[]> {
    await delay();

    const shuffled = [...mockRestaurants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static async getRestaurantRecommendations(userId: string): Promise<Restaurant[]> {
    await delay();

    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];

    const visitedIds = new Set(
      mockUserRestaurantRelations
        .filter(relation => relation.userId === userId)
        .map(relation => relation.restaurantId)
    );

    const candidateIds = mockRestaurants
      .filter(restaurant => !visitedIds.has(restaurant.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12)
      .map(restaurant => restaurant.id);

    if (candidateIds.length === 0) {
      const randomSelection = await this.getRandomRestaurants(6);
      return this.getRestaurantsWithStatus(randomSelection.map(restaurant => restaurant.id), { sortBy: 'rating' });
    }

    return this.getRestaurantsWithStatus(candidateIds, { sortBy: 'rating' });
  }

  // Restaurant status and filtering utilities
  static parseHours(hoursString: string): { open: number; close: number } | null {
    if (hoursString.toLowerCase() === 'closed') {
      return null;
    }

    // Parse hours like "7:30 AM - 12:00 AM" or "11:00 AM - 11:00 PM"
    const match = hoursString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    const [, openHour, openMin, openAmPm, closeHour, closeMin, closeAmPm] = match;

    let openTime = parseInt(openHour) + (parseInt(openMin) / 60);
    let closeTime = parseInt(closeHour) + (parseInt(closeMin) / 60);

    if (openAmPm.toUpperCase() === 'PM' && parseInt(openHour) !== 12) {
      openTime += 12;
    }
    if (openAmPm.toUpperCase() === 'AM' && parseInt(openHour) === 12) {
      openTime = parseInt(openMin) / 60;
    }

    if (closeAmPm.toUpperCase() === 'PM' && parseInt(closeHour) !== 12) {
      closeTime += 12;
    }
    if (closeAmPm.toUpperCase() === 'AM' && parseInt(closeHour) === 12) {
      closeTime = parseInt(closeMin) / 60;
    }

    // Handle overnight hours (e.g., 11 PM - 3 AM)
    if (closeTime < openTime) {
      closeTime += 24;
    }

    return { open: openTime, close: closeTime };
  }

  static isRestaurantOpen(restaurant: Restaurant, currentTime?: Date): boolean {
    if (!restaurant.hours) return false;
    const now = currentTime || new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const currentDay = dayNames[now.getDay()];
    const currentHour = now.getHours() + (now.getMinutes() / 60);

    const todayHours = restaurant.hours[currentDay];
    const parsedHours = this.parseHours(todayHours);

    if (!parsedHours) return false;

    // Handle overnight restaurants
    if (parsedHours.close > 24) {
      return currentHour >= parsedHours.open || currentHour <= (parsedHours.close - 24);
    }

    return currentHour >= parsedHours.open && currentHour <= parsedHours.close;
  }

  static getClosingTime(restaurant: Restaurant, currentTime?: Date): string | null {
    if (!restaurant.hours) return null;
    const now = currentTime || new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const currentDay = dayNames[now.getDay()];

    const todayHours = restaurant.hours[currentDay];
    const parsedHours = this.parseHours(todayHours);

    if (!parsedHours) return null;

    let closeHour = parsedHours.close;
    if (closeHour > 24) closeHour -= 24;

    const hour = Math.floor(closeHour);
    const minute = Math.round((closeHour - hour) * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  static async getRestaurantsWithStatus(
    restaurantIds: string[],
    filters?: {
      openNow?: boolean;
      acceptsReservations?: boolean;
      sortBy?: 'rating' | 'distance' | 'name';
    }
  ): Promise<Restaurant[]> {
    await delay();

    let restaurants = mockRestaurants.filter(r => restaurantIds.includes(r.id));

    // Add status information
    restaurants = restaurants.map(restaurant => ({
      ...restaurant,
      isOpen: this.isRestaurantOpen(restaurant),
      closingTime: this.getClosingTime(restaurant),
      acceptsReservations: Math.random() > 0.3, // Mock: 70% accept reservations
    }));

    // Apply filters
    if (filters?.openNow) {
      restaurants = restaurants.filter(r => r.isOpen);
    }

    if (filters?.acceptsReservations) {
      restaurants = restaurants.filter(r => r.acceptsReservations);
    }

    // Apply sorting
    if (filters?.sortBy === 'rating') {
      restaurants.sort((a, b) => b.rating - a.rating);
    } else if (filters?.sortBy === 'distance') {
      restaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (filters?.sortBy === 'name') {
      restaurants.sort((a, b) => a.name.localeCompare(b.name));
    }

    return restaurants;
  }

  // Notification-related methods
  static async getNotifications(): Promise<Notification[]> {
    await delay();
    // Return notifications sorted by timestamp (newest first)
    return [...mockNotifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await delay();
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  static async markAllNotificationsAsRead(): Promise<void> {
    await delay();
    mockNotifications.forEach(n => n.isRead = true);
  }

  static async getUnreadNotificationCount(): Promise<number> {
    await delay();
    return mockNotifications.filter(n => !n.isRead).length;
  }

  // Recent search methods
  static async getRecentSearches(): Promise<RecentSearch[]> {
    await delay();
    return mockRecentSearches;
  }

  static async addRecentSearch(restaurantId: string): Promise<void> {
    await delay();
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const newSearch: RecentSearch = {
        id: `recent-${Date.now()}`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        location: `${restaurant.location.neighborhood}, ${restaurant.location.city}`,
        timestamp: new Date(),
      };
      mockRecentSearches.unshift(newSearch);
      // Keep only the 10 most recent
      mockRecentSearches.splice(10);
    }
  }

  static async clearRecentSearch(searchId: string): Promise<void> {
    await delay();
    const index = mockRecentSearches.findIndex(s => s.id === searchId);
    if (index !== -1) {
      mockRecentSearches.splice(index, 1);
    }
  }

  // Restaurant discovery methods for profile page
  static async getReservableRestaurants(limit: number = 10): Promise<Restaurant[]> {
    await delay();
    return mockRestaurants
      .filter(r => r.acceptsReservations === true)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  static async getNearbyRecommendations(userId: string, maxDistance: number = 2.0, limit: number = 10): Promise<Restaurant[]> {
    await delay();
    // Get restaurants that are nearby (within maxDistance miles) and have good ratings
    return mockRestaurants
      .filter(r => r.distance && r.distance <= maxDistance && r.rating >= 7.5)
      .sort((a, b) => {
        // Sort by rating descending, then by distance ascending
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
        return (a.distance || 999) - (b.distance || 999);
      })
      .slice(0, limit);
  }

  static async getFriendRecommendations(userId: string, limit: number = 10): Promise<Restaurant[]> {
    await delay();
    // Get current user's following list
    const currentUser = await this.getCurrentUser();
    // In a real app, we'd fetch the user's following list
    // For now, we'll use user IDs that appear in recommendedBy arrays

    // Get restaurants recommended by friends
    return mockRestaurants
      .filter(r => r.recommendedBy && r.recommendedBy.length > 0)
      .sort((a, b) => {
        // Sort by number of friend recommendations, then by rating
        const recCountDiff = (b.recommendedBy?.length || 0) - (a.recommendedBy?.length || 0);
        if (recCountDiff !== 0) return recCountDiff;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, limit);
  }

  // Tastemaker methods
  static async getTastemakers(limit?: number): Promise<User[]> {
    await delay();
    const tastemakers = mockTastemakers.sort((a, b) =>
      (b.stats.followers || 0) - (a.stats.followers || 0)
    );
    return limit ? tastemakers.slice(0, limit) : tastemakers;
  }

  static async getTastemakerByUsername(username: string): Promise<User | null> {
    await delay();
    return mockTastemakers.find(tm => tm.username === username) || null;
  }

  static async getTastemakerPosts(limit?: number): Promise<TastemakerPost[]> {
    await delay();
    // Populate user data for each post
    const postsWithUsers = mockTastemakerPosts.map(post => ({
      ...post,
      user: mockTastemakers.find(tm => tm.id === post.userId),
    }));

    const sorted = postsWithUsers.sort((a, b) =>
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  static async getFeaturedTastemakerPosts(limit?: number): Promise<TastemakerPost[]> {
    await delay();
    const featured = getFeaturedPosts().map(post => ({
      ...post,
      user: mockTastemakers.find(tm => tm.id === post.userId),
    }));

    const sorted = featured.sort((a, b) =>
      b.interactions.views - a.interactions.views
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  static async getTastemakerPostById(postId: string): Promise<TastemakerPost | null> {
    await delay();
    const post = mockTastemakerPosts.find(p => p.id === postId);
    if (!post) return null;

    // Populate user and restaurant data
    const user = mockTastemakers.find(tm => tm.id === post.userId);
    const restaurants = mockRestaurants.filter(r => post.restaurantIds.includes(r.id));

    return {
      ...post,
      user,
      restaurants,
    };
  }

  static async getTastemakerPostsByUser(userId: string, limit?: number): Promise<TastemakerPost[]> {
    await delay();
    const userPosts = getPostsByUserId(userId).map(post => ({
      ...post,
      user: mockTastemakers.find(tm => tm.id === userId),
    }));

    const sorted = userPosts.sort((a, b) =>
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  static async likeTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find(p => p.id === postId);
    if (post && !post.interactions.likes.includes(userId)) {
      post.interactions.likes.push(userId);
    }
  }

  static async unlikeTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find(p => p.id === postId);
    if (post) {
      const index = post.interactions.likes.indexOf(userId);
      if (index > -1) {
        post.interactions.likes.splice(index, 1);
      }
    }
  }

  static async bookmarkTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find(p => p.id === postId);
    if (post && !post.interactions.bookmarks.includes(userId)) {
      post.interactions.bookmarks.push(userId);
    }
  }

  static async unbookmarkTastemakerPost(postId: string, userId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find(p => p.id === postId);
    if (post) {
      const index = post.interactions.bookmarks.indexOf(userId);
      if (index > -1) {
        post.interactions.bookmarks.splice(index, 1);
      }
    }
  }

  static async incrementPostViews(postId: string): Promise<void> {
    await delay();
    const post = mockTastemakerPosts.find(p => p.id === postId);
    if (post) {
      post.interactions.views += 1;
    }
  }

  // Reservation methods
  static async getUserReservations(userId: string, filter?: 'available' | 'claimed' | 'shared'): Promise<Reservation[]> {
    await delay();

    let reservations = mockReservations;

    if (filter === 'available') {
      return getAvailableReservations();
    } else if (filter === 'claimed') {
      return getClaimedReservationsByUser(userId);
    } else if (filter === 'shared') {
      return getSharedReservationsByUser(userId);
    }

    // Return all user's reservations (owned, claimed, or shared)
    return reservations.filter(r =>
      r.userId === userId ||
      r.claimedBy === userId ||
      r.sharedWith?.includes(userId)
    );
  }

  static async getAvailableReservations(): Promise<Reservation[]> {
    await delay();
    return getAvailableReservations();
  }

  static async getClaimedReservations(userId: string): Promise<Reservation[]> {
    await delay();
    return getClaimedReservationsByUser(userId);
  }

  static async getSharedReservations(userId: string): Promise<Reservation[]> {
    await delay();
    return getSharedReservationsByUser(userId);
  }

  static async claimReservation(reservationId: string, userId: string): Promise<boolean> {
    await delay();

    const reservation = mockReservations.find(r => r.id === reservationId);
    if (!reservation || reservation.status !== 'available') {
      return false;
    }

    reservation.status = 'claimed';
    reservation.claimedBy = userId;
    return true;
  }

  static async shareReservation(reservationId: string, recipientUserIds: string[]): Promise<boolean> {
    await delay();

    const reservation = mockReservations.find(r => r.id === reservationId);
    if (!reservation) {
      return false;
    }

    reservation.status = 'shared';
    reservation.sharedWith = recipientUserIds;
    return true;
  }

  static async cancelReservationShare(reservationId: string): Promise<boolean> {
    await delay();

    const reservation = mockReservations.find(r => r.id === reservationId);
    if (!reservation) {
      return false;
    }

    reservation.status = 'cancelled';
    return true;
  }

  static async getUserReservationPriority(userId: string): Promise<ReservationPriorityLevel> {
    await delay();
    return getUserPriorityLevel(userId);
  }

  static async getReservationReminders(userId: string): Promise<Reservation[]> {
    await delay();
    return getReservationReminders(userId);
  }

  static async getReservationById(reservationId: string): Promise<Reservation | null> {
    await delay();
    return mockReservations.find(r => r.id === reservationId) || null;
  }

  // Menu and Ordering methods
  static async getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    await delay();

    const menuItemIds = restaurantMenus[restaurantId] || [];
    const menu = allMenuItems.filter(item => menuItemIds.includes(item.id));

    // Sort by category, then by popularity
    return menu.sort((a, b) => {
      const categoryOrder: Record<string, number> = {
        appetizer: 1,
        entree: 2,
        side: 3,
        dessert: 4,
        drink: 5,
      };

      const categoryDiff = (categoryOrder[a.category] || 0) - (categoryOrder[b.category] || 0);
      if (categoryDiff !== 0) return categoryDiff;

      return b.popularity - a.popularity;
    });
  }

  static async generateOrderSuggestion(
    restaurantId: string,
    partySize: number,
    hungerLevel: HungerLevel,
    mealTime: MealTime = 'any-time',
    dietaryRestrictions?: string[]
  ): Promise<OrderSuggestion> {
    await delay(300); // Slightly longer delay to simulate AI processing

    const menu = await this.getRestaurantMenu(restaurantId);

    if (menu.length === 0) {
      throw new Error('No menu available for this restaurant');
    }

    // Calculate "hunger points" based on party size and hunger level
    const hungerMultiplier = {
      'light': 0.8,
      'moderate': 1.2,
      'very-hungry': 1.8,
    }[hungerLevel];

    const basePointsPerPerson = 10;
    const totalHungerPoints = partySize * basePointsPerPerson * hungerMultiplier;

    // Define portion point values
    const portionPoints: Record<string, number> = {
      small: 5,
      medium: 10,
      large: 15,
      shareable: 12,
    };

    // Filter menu based on meal time and dietary restrictions
    let availableMenu = menu;

    // Filter by meal time
    if (mealTime !== 'any-time') {
      availableMenu = availableMenu.filter(item => {
        if (!item.mealTime || item.mealTime.length === 0) {
          return true; // Include items without mealTime metadata
        }
        return item.mealTime.includes(mealTime) || item.mealTime.includes('any-time');
      });
    }

    // Filter by dietary restrictions
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      availableMenu = availableMenu.filter(item => {
        if (dietaryRestrictions.includes('vegetarian') && !item.isVegetarian) {
          return false;
        }
        if (dietaryRestrictions.includes('gluten-free') && !item.isGlutenFree) {
          return false;
        }
        return true;
      });
    }

    // Separate items by category
    const appetizers = availableMenu.filter(i => i.category === 'appetizer');
    const entrees = availableMenu.filter(i => i.category === 'entree');
    const sides = availableMenu.filter(i => i.category === 'side');
    const desserts = availableMenu.filter(i => i.category === 'dessert');
    const drinks = availableMenu.filter(i => i.category === 'drink');

    // Build the order
    const selectedItems: Array<MenuItem & { quantity: number }> = [];
    let currentPoints = 0;
    const reasoning: string[] = [];

    // Helper function to add items
    const addItem = (item: MenuItem, quantity: number = 1) => {
      selectedItems.push({ ...item, quantity });
      currentPoints += portionPoints[item.portionSize] * quantity;
    };

    // Strategy based on party size and hunger level
    if (partySize === 1) {
      // Solo dining
      if (hungerLevel === 'light') {
        // 1 appetizer or 1 entree
        if (Math.random() > 0.5 && appetizers.length > 0) {
          addItem(appetizers[0]);
          reasoning.push('Perfect light bite for one');
        } else if (entrees.length > 0) {
          addItem(entrees[0]);
          reasoning.push('A satisfying solo meal');
        }
      } else if (hungerLevel === 'moderate') {
        // 1 entree + maybe appetizer
        if (entrees.length > 0) addItem(entrees[0]);
        if (appetizers.length > 0 && currentPoints < totalHungerPoints * 0.8) {
          addItem(appetizers[0]);
        }
        reasoning.push('Great portions for one person');
      } else {
        // very-hungry: entree + appetizer + dessert
        if (appetizers.length > 0) addItem(appetizers[0]);
        if (entrees.length > 0) addItem(entrees[0]);
        if (desserts.length > 0) addItem(desserts[0]);
        reasoning.push('Feast for one');
      }
    } else {
      // Group dining
      // Always add some appetizers for sharing
      const numAppetizers = Math.min(
        Math.ceil(partySize / 2),
        appetizers.length,
        hungerLevel === 'light' ? 1 : hungerLevel === 'moderate' ? 2 : 3
      );

      for (let i = 0; i < numAppetizers && i < appetizers.length; i++) {
        addItem(appetizers[i]);
      }

      if (numAppetizers > 0) {
        reasoning.push('Shareable starters for the table');
      }

      // Add entrees based on party size
      const entreesNeeded = hungerLevel === 'light'
        ? Math.ceil(partySize * 0.5)
        : hungerLevel === 'very-hungry'
        ? partySize + Math.floor(partySize / 3)
        : partySize;

      // Get top-rated entrees
      const sortedEntrees = [...entrees].sort((a, b) => b.popularity - a.popularity);

      for (let i = 0; i < entreesNeeded && currentPoints < totalHungerPoints; i++) {
        const entreeIndex = i % sortedEntrees.length;
        if (sortedEntrees[entreeIndex]) {
          const existingItem = selectedItems.find(
            si => si.id === sortedEntrees[entreeIndex].id
          );

          if (existingItem) {
            existingItem.quantity++;
          } else {
            addItem(sortedEntrees[entreeIndex]);
          }
        }
      }

      reasoning.push('Includes crowd favorites');

      // Add sides if very hungry or moderate with room
      if ((hungerLevel === 'very-hungry' || hungerLevel === 'moderate') && sides.length > 0) {
        const numSides = Math.min(2, sides.length);
        for (let i = 0; i < numSides; i++) {
          addItem(sides[i]);
        }
        if (numSides > 0) {
          reasoning.push('Complementary sides to share');
        }
      }

      // Add dessert if very hungry
      if (hungerLevel === 'very-hungry' && desserts.length > 0) {
        const numDesserts = Math.min(Math.ceil(partySize / 2), desserts.length);
        for (let i = 0; i < numDesserts; i++) {
          addItem(desserts[i]);
        }
        reasoning.push('Sweet ending to your meal');
      }

      // Add drinks
      if (drinks.length > 0 && partySize >= 2) {
        const numDrinks = Math.min(2, drinks.length);
        for (let i = 0; i < numDrinks; i++) {
          addItem(drinks[i], partySize);
        }
      }
    }

    // Calculate total price
    const totalPrice = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Generate sharability description
    const estimatedSharability = partySize === 1
      ? 'Perfect portions for one'
      : partySize <= 2
      ? `Great for ${partySize} people`
      : partySize <= 4
      ? `Ideal for your group of ${partySize}`
      : `Feast for ${partySize} people`;

    // Add pricing reasoning
    const pricePerPerson = totalPrice / partySize;
    if (pricePerPerson < 30) {
      reasoning.push('Budget-friendly option');
    } else if (pricePerPerson > 60) {
      reasoning.push('Premium dining experience');
    }

    return {
      id: `suggestion-${Date.now()}`,
      restaurantId,
      partySize,
      hungerLevel,
      mealTime,
      items: selectedItems,
      totalPrice,
      reasoning,
      estimatedSharability,
    };
  }

  // Group Dinner methods
  static async getUserFriends(userId: string): Promise<User[]> {
    await delay();
    // Return users who the current user is following (simplified)
    // In a real app, this would be a proper friends/following relationship
    return mockUsers.filter(u => u.id !== userId).slice(0, 10);
  }

  static async getRecentDiningCompanions(userId: string): Promise<User[]> {
    await delay();
    // For now, return a subset of friends
    // In a real app, this would track who you've actually dined with
    return mockUsers.filter(u => u.id !== userId).slice(0, 5);
  }

  static async getRestaurantAvailability(restaurantId: string, date: Date): Promise<{ available: boolean; timeSlot?: string }> {
    await delay();
    // Mock availability - in reality this would check reservation system
    const randomAvailable = Math.random() > 0.3; // 70% chance of availability
    const timeSlots = ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];
    const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

    return {
      available: randomAvailable,
      timeSlot: randomAvailable ? randomSlot : undefined
    };
  }

  static async getGroupDinnerSuggestions(
    userId: string,
    participantIds?: string[],
    category?: import('@/types').ListCategory
  ): Promise<import('@/types').GroupDinnerMatch[]> {
    await delay();

    const isGroup = participantIds && participantIds.length > 0;
    const allUserIds = isGroup ? [userId, ...participantIds] : [userId];

    // Get want-to-try restaurants for all participants
    const wantToTryRelations = mockUserRestaurantRelations.filter(
      rel => allUserIds.includes(rel.userId) && rel.status === 'want_to_try'
    );

    // Get restaurants that have been visited recently (to filter out)
    const recentlyVisited = mockUserRestaurantRelations.filter(
      rel => allUserIds.includes(rel.userId) &&
      rel.status === 'been' &&
      rel.visitDate &&
      (new Date().getTime() - new Date(rel.visitDate).getTime()) < 30 * 24 * 60 * 60 * 1000 // 30 days
    ).map(rel => rel.restaurantId);

    // Get all users for dietary restrictions
    const users = await Promise.all(allUserIds.map(id => this.getUserById(id)));
    const allDietaryRestrictions = users
      .filter((u): u is User => u !== null)
      .flatMap(u => u.dietaryRestrictions || []);

    // Count how many people have each restaurant on their want-to-try list
    const restaurantCounts = new Map<string, { count: number; userIds: string[] }>();

    wantToTryRelations.forEach(rel => {
      const existing = restaurantCounts.get(rel.restaurantId) || { count: 0, userIds: [] };
      restaurantCounts.set(rel.restaurantId, {
        count: existing.count + 1,
        userIds: [...existing.userIds, rel.userId]
      });
    });

    // Build scored matches
    const matches: import('@/types').GroupDinnerMatch[] = [];

    for (const [restaurantId, data] of Array.from(restaurantCounts.entries())) {
      // Skip recently visited
      if (recentlyVisited.includes(restaurantId)) continue;

      const restaurant = mockRestaurants.find(r => r.id === restaurantId);
      if (!restaurant) continue;

      // Filter by category if specified
      if (category && restaurant.category !== category) continue;

      // Calculate score
      let score = 0;
      const matchReasons: string[] = [];

      // Want-to-try overlap (70% weight)
      const overlapRatio = data.count / allUserIds.length;
      const wantToTryScore = overlapRatio * 70;
      score += wantToTryScore;

      if (data.count === allUserIds.length) {
        matchReasons.push('Everyone wants to try this!');
      } else if (data.count > 1) {
        matchReasons.push(`On ${data.count} want-to-try lists`);
      } else {
        matchReasons.push('On your want-to-try list');
      }

      // Dietary compatibility (20% weight)
      // For simplicity, assume all restaurants can accommodate dietary restrictions in mock
      const dietaryScore = 20;
      score += dietaryScore;
      if (allDietaryRestrictions.length > 0) {
        matchReasons.push('Accommodates dietary restrictions');
      }

      // Location convenience (10% weight)
      // In real app, would calculate distance from participants
      const locationScore = restaurant.distance ? Math.max(0, 10 - restaurant.distance) : 10;
      score += locationScore;
      if (restaurant.distance && restaurant.distance < 2) {
        matchReasons.push('Nearby location');
      }

      // Get availability
      const availability = await this.getRestaurantAvailability(restaurantId, new Date());

      matches.push({
        restaurant,
        score: Math.round(score),
        onListsCount: data.count,
        participants: data.userIds,
        matchReasons,
        availability: availability.available ? {
          date: new Date().toLocaleDateString(),
          timeSlot: availability.timeSlot || 'Various times'
        } : undefined
      });
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  // Taste Profile methods
  static async getUserTasteProfile(userId: string, days: number = 30): Promise<import('@/types').TasteProfileStats> {
    await delay();

    // Get all user's "been" restaurants - use Set for O(1) lookup
    const userRelations = mockUserRestaurantRelations.filter(
      rel => rel.userId === userId && rel.status === 'been'
    );

    // Early return if no data
    if (userRelations.length === 0) {
      return {
        last30Days: {
          restaurantsCount: 0,
          cuisinesCount: 0,
          activityPercentile: 0,
          primaryLocation: 'Unknown',
        },
        cuisineBreakdown: [],
        cityBreakdown: [],
        countryBreakdown: [],
        diningLocations: [],
        totalRestaurants: 0,
        totalCities: 0,
        totalCountries: 0,
        totalCuisines: 0,
      };
    }

    const restaurantIdsSet = new Set(userRelations.map(rel => rel.restaurantId));
    const restaurants = mockRestaurants.filter(r => restaurantIdsSet.has(r.id));

    // Calculate last N days stats
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const recentRelations = userRelations.filter(
      rel => rel.visitDate && new Date(rel.visitDate) >= daysAgo
    );

    const recentRestaurantIdsSet = new Set(recentRelations.map(rel => rel.restaurantId));
    const recentRestaurants = mockRestaurants.filter(r => recentRestaurantIdsSet.has(r.id));

    const recentCuisines = new Set(recentRestaurants.flatMap(r => r.cuisine));

    const user = await this.getUserById(userId);
    const primaryLocation = user?.location.city || 'Unknown';

    // OPTIMIZED: Calculate all breakdowns in a single loop
    const cuisineMap = new Map<string, { count: number; totalScore: number; restaurantIds: string[] }>();
    const cityMap = new Map<string, { count: number; totalScore: number; restaurantIds: string[]; state?: string }>();
    const countryMap = new Map<string, { count: number; totalScore: number; restaurantIds: string[] }>();
    const cityLocationMap = new Map<string, import('@/types').DiningLocation>();

    // Single loop through restaurants - major performance improvement
    restaurants.forEach(restaurant => {
      const restaurantId = restaurant.id;
      const rating = restaurant.rating;

      // Process cuisines - push instead of spread
      restaurant.cuisine.forEach(cuisine => {
        let cuisineData = cuisineMap.get(cuisine);
        if (!cuisineData) {
          cuisineData = { count: 0, totalScore: 0, restaurantIds: [] };
          cuisineMap.set(cuisine, cuisineData);
        }
        cuisineData.count++;
        cuisineData.totalScore += rating;
        cuisineData.restaurantIds.push(restaurantId); // Push instead of spread
      });

      // Process cities - push instead of spread
      const cityKey = `${restaurant.location.city}, ${restaurant.location.state}`;
      let cityData = cityMap.get(cityKey);
      if (!cityData) {
        cityData = { count: 0, totalScore: 0, restaurantIds: [], state: restaurant.location.state };
        cityMap.set(cityKey, cityData);
      }
      cityData.count++;
      cityData.totalScore += rating;
      cityData.restaurantIds.push(restaurantId); // Push instead of spread

      // Process countries - push instead of spread
      const country = 'United States'; // Mock: assume all restaurants are in US
      let countryData = countryMap.get(country);
      if (!countryData) {
        countryData = { count: 0, totalScore: 0, restaurantIds: [] };
        countryMap.set(country, countryData);
      }
      countryData.count++;
      countryData.totalScore += rating;
      countryData.restaurantIds.push(restaurantId); // Push instead of spread

      // Process city locations - push instead of spread
      const cityKey2 = restaurant.location.city;
      let cityLocation = cityLocationMap.get(cityKey2);
      if (!cityLocation) {
        cityLocation = {
          city: restaurant.location.city,
          country: 'United States',
          state: restaurant.location.state,
          lat: restaurant.location.coordinates.lat,
          lng: restaurant.location.coordinates.lng,
          restaurantIds: [],
        };
        cityLocationMap.set(cityKey2, cityLocation);
      }
      cityLocation.restaurantIds.push(restaurantId); // Push instead of spread
    });

    // Convert maps to arrays (only once at the end)
    const cuisineBreakdown: import('@/types').CuisineBreakdown[] = Array.from(cuisineMap.entries()).map(([cuisine, data]) => ({
      cuisine,
      count: data.count,
      avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
      restaurantIds: data.restaurantIds,
    }));

    const cityBreakdown: import('@/types').CityBreakdown[] = Array.from(cityMap.entries()).map(([city, data]) => ({
      city: city.split(',')[0].trim(),
      state: data.state,
      count: data.count,
      avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
      restaurantIds: data.restaurantIds,
    }));

    const countryBreakdown: import('@/types').CountryBreakdown[] = Array.from(countryMap.entries()).map(([country, data]) => ({
      country,
      count: data.count,
      avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
      restaurantIds: data.restaurantIds,
    }));

    const diningLocations: import('@/types').DiningLocation[] = Array.from(cityLocationMap.values());

    return {
      last30Days: {
        restaurantsCount: recentRestaurants.length,
        cuisinesCount: recentCuisines.size,
        activityPercentile: 96, // Mock: "Top 4%"
        primaryLocation,
      },
      cuisineBreakdown,
      cityBreakdown,
      countryBreakdown,
      diningLocations,
      totalRestaurants: restaurants.length,
      totalCities: cityMap.size,
      totalCountries: countryMap.size,
      totalCuisines: cuisineMap.size,
    };
  }

  // Ranking methods
  static async getRankedRestaurants(userId: string, category: import('@/types').ListCategory): Promise<(import('@/types').Restaurant & { userRating?: number })[]> {
    await delay();

    // Get all restaurants in the 'been' list for this user
    const relations = mockUserRestaurantRelations.filter(
      relation => relation.userId === userId && relation.status === 'been'
    );

    // Filter by category (for now, all restaurants go into 'restaurants' category)
    // In a real app, you might filter by restaurant type based on category

    // Get full restaurant objects with their rank indices and user ratings
    const restaurantsWithRanks = relations
      .map(relation => {
        const restaurant = mockRestaurants.find(r => r.id === relation.restaurantId);
        return restaurant ? {
          restaurant,
          rankIndex: relation.rankIndex ?? 999999,
          userRating: relation.rating
        } : null;
      })
      .filter((item): item is { restaurant: import('@/types').Restaurant; rankIndex: number; userRating: number | undefined } => item !== null);

    // Sort by rank index (lower index = higher rank)
    restaurantsWithRanks.sort((a, b) => a.rankIndex - b.rankIndex);

    // Attach userRating to restaurant objects
    return restaurantsWithRanks.map(item => ({
      ...item.restaurant,
      userRating: item.userRating
    }));
  }

  static async insertRankedRestaurant(
    userId: string,
    restaurantId: string,
    category: import('@/types').ListCategory,
    position: number,
    rating: number,
    data?: {
      notes?: string;
      photos?: string[];
      tags?: string[];
      companions?: string[];
    }
  ): Promise<import('@/types').UserRestaurantRelation> {
    await delay();

    // Update rank indices for existing restaurants at or after this position
    await this.updateRankIndices(userId, category, position);

    // Create the new relation with rank index
    const newRelation: import('@/types').UserRestaurantRelation = {
      userId,
      restaurantId,
      status: 'been',
      rating,
      rankIndex: position,
      notes: data?.notes,
      photos: data?.photos,
      tags: data?.tags,
      companions: data?.companions,
      createdAt: new Date(),
      visitDate: new Date(),
    };

    // Add to the list
    mockUserRestaurantRelations.push(newRelation);

    return newRelation;
  }

  static async updateRankIndices(
    userId: string,
    category: import('@/types').ListCategory,
    fromIndex: number
  ): Promise<void> {
    await delay();

    // Find all relations for this user in the 'been' status
    const relations = mockUserRestaurantRelations.filter(
      relation => relation.userId === userId && relation.status === 'been'
    );

    // Increment rank index for all items at or after the insertion point
    relations.forEach(relation => {
      if (relation.rankIndex !== undefined && relation.rankIndex >= fromIndex) {
        relation.rankIndex += 1;
      }
    });
  }
}

export default MockDataService;
