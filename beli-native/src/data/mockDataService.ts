import { User, Restaurant, UserRestaurantRelation, FeedItem, List, ListCategory, ListScope, Notification, Reservation, ReservationPriorityLevel, MenuItem, OrderSuggestion, HungerLevel } from '../types';
import { mockUsers, currentUser } from './mock/users';
import { mockRestaurants } from './mock/restaurants';
import { mockUserRestaurantRelations } from './mock/userRestaurantRelations';
import { mockReviews, Review } from './mock/reviews';
import { mockActivities, trendingRestaurants, recentCheckIns, Activity } from './mock/activities';
import { mockLists, getUserListsByType, featuredLists } from './mock/lists';
import { mockNotifications } from './mock/notifications';
import { challenge2025, mockChallengeActivities, getActivitiesByMonth, getDaysRemaining, getProgressPercentage, Challenge2025, ChallengeActivity } from './mock/challenges';
import { mockReservations, getUserPriorityLevel, getAvailableReservations, getClaimedReservationsByUser, getSharedReservationsByUser, getReservationReminders } from './mock/reservations';
import { allMenuItems, restaurantMenus } from './mock/menuItems';

// Simulate network delay - reduced for better UX
const delay = (ms: number = 150) => new Promise(resolve => setTimeout(resolve, ms));

export class MockDataService {
  // User-related methods
  static async getCurrentUser(): Promise<User> {
    await delay();
    return currentUser;
  }

  static async getUserById(userId: string): Promise<User | null> {
    await delay();
    return mockUsers.find(user => user.id === userId) || null;
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
    return mockRestaurants.filter(restaurant => restaurantIds.includes(restaurant.id));
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

  static async getUserListProgress(userId: string, listId: string): Promise<{ visited: number; total: number }> {
    await delay();

    const list = mockLists.find(l => l.id === listId);
    if (!list) {
      return { visited: 0, total: 0 };
    }

    // Get user's been list to check which restaurants they've visited
    const userRelations = await this.getUserRestaurantRelations(userId);
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

  // Search recent searches (mock implementation)
  static async getRecentSearches(userId: string): Promise<string[]> {
    await delay();

    // Mock recent searches - in a real app this would be stored per user
    return [
      'Pizza',
      'Ramen',
      'Italian',
      'Date night',
      'Brunch',
    ];
  }

  static async addRecentSearch(userId: string, query: string): Promise<void> {
    await delay();
    // In a real app, this would save the search query for the user
    console.log(`Added search "${query}" for user ${userId}`);
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

  static async getFriendRecommendations(userId: string): Promise<Restaurant[]> {
    const visitedIds = new Set(
      mockUserRestaurantRelations
        .filter(relation => relation.userId === userId)
        .map(relation => relation.restaurantId)
    );

    const friendListRestaurantIds = mockLists
      .filter(list => list.listType === 'recs' && list.userId !== userId)
      .flatMap(list => list.restaurants);

    const uniqueIds = Array.from(new Set(friendListRestaurantIds)).filter(id => !visitedIds.has(id));

    const idsToFetch = (uniqueIds.length > 0 ? uniqueIds : trendingRestaurants.map(r => r.id)).slice(0, 12);

    return this.getRestaurantsWithStatus(idsToFetch, { sortBy: 'rating' });
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

  // Challenge 2025 methods
  static async getChallenge2025(): Promise<Challenge2025> {
    await delay();
    return {
      ...challenge2025,
      currentCount: mockChallengeActivities.length,
    };
  }

  static async getChallengeActivities(month?: string): Promise<Array<ChallengeActivity & { restaurant: Restaurant }>> {
    await delay();
    let activities = mockChallengeActivities;

    if (month) {
      activities = activities.filter(activity => {
        const activityMonth = new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
        return activityMonth === month;
      });
    }

    // Enrich activities with restaurant data
    return activities.map(activity => ({
      ...activity,
      restaurant: mockRestaurants.find(r => r.id === activity.restaurantId)!,
    })).filter(a => a.restaurant); // Filter out any with missing restaurant data
  }

  static async getChallengeStats(): Promise<{
    currentCount: number;
    goalCount: number;
    daysRemaining: number;
    progressPercentage: number;
  }> {
    await delay();
    return {
      currentCount: mockChallengeActivities.length,
      goalCount: challenge2025.goalCount,
      daysRemaining: getDaysRemaining(),
      progressPercentage: getProgressPercentage(),
    };
  }

  static async updateChallengeGoal(goalCount: number): Promise<void> {
    await delay();
    challenge2025.goalCount = goalCount;
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
    participantIds?: string[]
  ): Promise<import('../types').GroupDinnerMatch[]> {
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
    const matches: import('../types').GroupDinnerMatch[] = [];

    for (const [restaurantId, data] of Array.from(restaurantCounts.entries())) {
      // Skip recently visited
      if (recentlyVisited.includes(restaurantId)) continue;

      const restaurant = mockRestaurants.find(r => r.id === restaurantId);
      if (!restaurant) continue;

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

  // Menu and Ordering methods
  static async getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    await delay();

    const menuItemIds = restaurantMenus[restaurantId] || [];
    const menuItems = allMenuItems.filter(item => menuItemIds.includes(item.id));

    // Sort by category and popularity
    return menuItems.sort((a, b) => {
      const categoryOrder: Record<string, number> = {
        appetizer: 1,
        entree: 2,
        side: 3,
        dessert: 4,
        drink: 5,
      };

      const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
      if (categoryDiff !== 0) return categoryDiff;

      return b.popularity - a.popularity;
    });
  }

  static async generateOrderSuggestion(
    restaurantId: string,
    partySize: number,
    hungerLevel: HungerLevel,
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

    // Filter menu based on dietary restrictions
    let availableMenu = menu;
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      availableMenu = menu.filter(item => {
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
      items: selectedItems,
      totalPrice,
      reasoning,
      estimatedSharability,
    };
  }
}

export default MockDataService;

// Export types
export type { Challenge2025, ChallengeActivity };
