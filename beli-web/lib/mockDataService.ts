import { User, Restaurant, UserRestaurantRelation, FeedItem, List, ListCategory, ListScope, Notification, TastemakerPost, Reservation, ReservationPriorityLevel } from '@/types';
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
}

export default MockDataService;
