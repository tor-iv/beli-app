// Re-export all mock data from the new structure
export { mockUsers, currentUser } from './mock/users';
export { mockRestaurants } from './mock/restaurants';
export { mockUserRestaurantRelations } from './mock/userRestaurantRelations';
export { mockReviews } from './mock/reviews';
export { mockActivities, trendingRestaurants, recentCheckIns } from './mock/activities';
export { mockLists, featuredLists } from './mock/lists';
export { default as MockDataService } from './mockDataService';

// Legacy exports for backward compatibility
import { mockActivities } from './mock/activities';
export const mockFeedItems = mockActivities;
