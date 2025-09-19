import { User, Restaurant, UserRestaurantRelation, FeedItem, List } from '../types';
import { mockUsers, currentUser } from './mock/users';
import { mockRestaurants } from './mock/restaurants';
import { mockUserRestaurantRelations } from './mock/userRestaurantRelations';
import { mockReviews, Review } from './mock/reviews';
import { mockActivities, trendingRestaurants, recentCheckIns, Activity } from './mock/activities';
import { mockLists, getUserListsByType, featuredLists } from './mock/lists';

// Simulate network delay
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

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
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(lowercaseQuery) ||
        restaurant.cuisine.some(c => c.toLowerCase().includes(lowercaseQuery)) ||
        restaurant.location.neighborhood.toLowerCase().includes(lowercaseQuery)
      );
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
    await delay();
    return trendingRestaurants;
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

  static async getUserListsByType(userId: string, type: 'been' | 'want_to_try' | 'recs' | 'playlists'): Promise<List[]> {
    await delay();
    return getUserListsByType(userId, type);
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

    // Simple recommendation logic based on user's cuisine preferences
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];

    // Get restaurants the user hasn't been to
    const userRestaurantIds = mockUserRestaurantRelations
      .filter(relation => relation.userId === userId)
      .map(relation => relation.restaurantId);

    const unvisitedRestaurants = mockRestaurants.filter(
      restaurant => !userRestaurantIds.includes(restaurant.id)
    );

    // Sort by rating and return top recommendations
    return unvisitedRestaurants
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }
}

export default MockDataService;