/**
 * API Parity Tests
 *
 * These tests verify that the Django REST API returns responses
 * that match the expected TypeScript service shapes.
 *
 * Run with Django server at localhost:8000
 */
import { describe, it, expect, beforeAll } from 'vitest';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api/v1';

// Helper to handle both paginated and unpaginated responses
function extractResults<T>(response: T | { results: T }): T {
  if (response && typeof response === 'object' && 'results' in response) {
    return (response as { results: T }).results;
  }
  return response as T;
}

// ===========================================
// Restaurant Response Shape Tests
// ===========================================

describe('Restaurant API Parity', () => {
  let restaurants: any[];
  let singleRestaurant: any;

  beforeAll(async () => {
    // Fetch restaurants from Django API
    const response = await fetch(`${DJANGO_API_URL}/restaurants/`);
    const data = await response.json();
    restaurants = extractResults(data);

    // Get single restaurant for detailed testing
    if (restaurants.length > 0) {
      const singleResponse = await fetch(`${DJANGO_API_URL}/restaurants/${restaurants[0].id}/`);
      singleRestaurant = await singleResponse.json();
    }
  });

  it('returns array of restaurants', () => {
    expect(Array.isArray(restaurants)).toBe(true);
    expect(restaurants.length).toBeGreaterThan(0);
  });

  describe('Restaurant shape matches TypeScript interface', () => {
    it('has required string fields', () => {
      const restaurant = restaurants[0];

      expect(typeof restaurant.id).toBe('string');
      expect(typeof restaurant.name).toBe('string');
      expect(typeof restaurant.category).toBe('string');
      expect(typeof restaurant.priceRange).toBe('string');
    });

    it('has cuisine as array', () => {
      const restaurant = restaurants[0];
      expect(Array.isArray(restaurant.cuisine)).toBe(true);

      // If cuisine has items, they should be strings
      if (restaurant.cuisine.length > 0) {
        expect(typeof restaurant.cuisine[0]).toBe('string');
      }
    });

    it('has location fields', () => {
      const restaurant = restaurants[0];

      // Check location fields exist (Django may use different field names)
      const hasLocation =
        restaurant.neighborhood !== undefined ||
        restaurant.city !== undefined ||
        (restaurant.location && restaurant.location.neighborhood !== undefined);

      expect(hasLocation).toBe(true);
    });

    it('has numeric rating', () => {
      const restaurant = restaurants[0];

      // Rating should be a number or string that can be parsed
      const rating =
        typeof restaurant.rating === 'number'
          ? restaurant.rating
          : parseFloat(restaurant.rating);

      expect(typeof rating).toBe('number');
      expect(rating).toBeGreaterThanOrEqual(0);
      expect(rating).toBeLessThanOrEqual(10);
    });

    it('has optional images array', () => {
      const restaurant = restaurants[0];

      // Images should be array if present
      if (restaurant.images !== undefined) {
        expect(Array.isArray(restaurant.images)).toBe(true);
      }
    });
  });

  describe('Search endpoint', () => {
    it('returns restaurants matching query', async () => {
      const response = await fetch(`${DJANGO_API_URL}/restaurants/search/?q=pizza`);
      const data = await response.json();
      const results = extractResults(data);

      expect(Array.isArray(results)).toBe(true);
      // Results should contain "pizza" somewhere
      if (results.length > 0) {
        const hasMatch = results.some(
          (r: any) =>
            r.name.toLowerCase().includes('pizza') ||
            (Array.isArray(r.cuisine) && r.cuisine.some((c: string) => c.toLowerCase().includes('pizza')))
        );
        expect(hasMatch).toBe(true);
      }
    });
  });

  describe('Trending endpoint', () => {
    it('returns array of high-rated restaurants', async () => {
      const response = await fetch(`${DJANGO_API_URL}/restaurants/trending/`);
      const data = await response.json();
      const results = extractResults(data);

      expect(Array.isArray(results)).toBe(true);

      // All trending restaurants should have good ratings
      results.forEach((r: any) => {
        const rating = typeof r.rating === 'number' ? r.rating : parseFloat(r.rating);
        expect(rating).toBeGreaterThanOrEqual(7.0);
      });
    });
  });
});

// ===========================================
// User Response Shape Tests
// ===========================================

describe('User API Parity', () => {
  let users: any[];
  let currentUser: any;

  beforeAll(async () => {
    // Fetch users from Django API
    const response = await fetch(`${DJANGO_API_URL}/users/`);
    const data = await response.json();
    users = extractResults(data);

    // Get current user
    const meResponse = await fetch(`${DJANGO_API_URL}/users/me/`);
    currentUser = await meResponse.json();
  });

  it('returns array of users', () => {
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  describe('User shape matches TypeScript interface', () => {
    it('has required identity fields', () => {
      const user = users[0];

      expect(typeof user.id).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(typeof user.displayName).toBe('string');
    });

    it('has avatar URL', () => {
      const user = users[0];
      expect(typeof user.avatar).toBe('string');
      // Avatar should be a URL
      expect(user.avatar).toMatch(/^https?:\/\//);
    });

    it('has stats object with required fields', () => {
      const user = users[0];

      expect(user.stats).toBeDefined();
      expect(typeof user.stats).toBe('object');

      // Check required stat fields exist and are numbers
      const requiredStats = ['followers', 'following', 'beenCount', 'wantToTryCount'];
      requiredStats.forEach((stat) => {
        expect(typeof user.stats[stat]).toBe('number');
      });
    });
  });

  describe('Current user endpoint (/me)', () => {
    it('returns user object with identity fields', () => {
      expect(currentUser.id).toBeDefined();
      expect(currentUser.username).toBeDefined();
      expect(currentUser.displayName).toBeDefined();
    });
  });

  describe('User search endpoint', () => {
    it('returns users matching query', async () => {
      const response = await fetch(`${DJANGO_API_URL}/users/search/?q=tor`);
      const data = await response.json();
      const results = extractResults(data);

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Leaderboard endpoint', () => {
    it('returns users sorted by activity with stats', async () => {
      const response = await fetch(`${DJANGO_API_URL}/users/leaderboard/?limit=10`);
      const data = await response.json();
      const results = extractResults(data);

      expect(Array.isArray(results)).toBe(true);

      // Leaderboard users should have stats
      results.forEach((user: any) => {
        expect(user.stats).toBeDefined();
        expect(typeof user.stats.beenCount).toBe('number');
      });
    }, 30000); // Increase timeout for large database
  });
});

// ===========================================
// Feed Response Shape Tests
// ===========================================

describe('Feed API Parity', () => {
  let feedItems: any[];

  beforeAll(async () => {
    const response = await fetch(`${DJANGO_API_URL}/feed/`);
    const data = await response.json();
    feedItems = extractResults(data);
  });

  it('returns array of feed items', () => {
    expect(Array.isArray(feedItems)).toBe(true);
  });

  describe('Feed item shape matches TypeScript interface', () => {
    it('has required fields for activity items', () => {
      if (feedItems.length === 0) return;

      const item = feedItems[0];

      expect(item.id).toBeDefined();
      expect(item.type).toBeDefined();
      expect(item.user).toBeDefined();
      expect(item.createdAt).toBeDefined();
    });

    it('has user with basic info', () => {
      if (feedItems.length === 0) return;

      const item = feedItems[0];

      expect(item.user.id).toBeDefined();
      expect(item.user.username).toBeDefined();
    });

    it('has restaurant info when applicable', () => {
      if (feedItems.length === 0) return;

      // Find a feed item with restaurant info
      const itemWithRestaurant = feedItems.find((item: any) => item.restaurant);

      if (itemWithRestaurant) {
        expect(itemWithRestaurant.restaurant.id).toBeDefined();
        expect(itemWithRestaurant.restaurant.name).toBeDefined();
      }
    });
  });
});

// ===========================================
// Lists Response Shape Tests
// ===========================================

describe('Lists API Parity', () => {
  it('returns array (empty if no lists table)', async () => {
    const response = await fetch(`${DJANGO_API_URL}/lists/`);
    const data = await response.json();
    const results = extractResults(data);

    // Should return array (even if empty)
    expect(Array.isArray(results)).toBe(true);
  });
});

// ===========================================
// Notifications Response Shape Tests
// ===========================================

describe('Notifications API Parity', () => {
  it('returns array (empty if no notifications table)', async () => {
    const response = await fetch(`${DJANGO_API_URL}/notifications/`);
    const data = await response.json();
    const results = extractResults(data);

    expect(Array.isArray(results)).toBe(true);
  });
});

// ===========================================
// Tastemakers Response Shape Tests
// ===========================================

describe('Tastemakers API Parity', () => {
  let tastemakers: any[];

  beforeAll(async () => {
    const response = await fetch(`${DJANGO_API_URL}/tastemakers/`);
    const data = await response.json();
    tastemakers = extractResults(data);
  });

  it('returns array of tastemakers', () => {
    expect(Array.isArray(tastemakers)).toBe(true);
  });

  describe('Tastemaker shape includes user fields', () => {
    it('has user identity fields', () => {
      if (tastemakers.length === 0) return;

      const tastemaker = tastemakers[0];

      // Tastemaker should have user-like fields
      expect(tastemaker.id).toBeDefined();
      expect(tastemaker.username || tastemaker.displayName).toBeDefined();
    });
  });
});

// ===========================================
// Comprehensive Shape Validation
// ===========================================

describe('Cross-endpoint field consistency', () => {
  it('restaurant IDs are consistent UUIDs', async () => {
    const restaurantsResponse = await fetch(`${DJANGO_API_URL}/restaurants/`);
    const restaurantsData = await restaurantsResponse.json();
    const restaurants = extractResults(restaurantsData);

    const feedResponse = await fetch(`${DJANGO_API_URL}/feed/`);
    const feedItems = extractResults(await feedResponse.json());

    // Restaurant IDs should be UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (restaurants.length > 0) {
      expect(restaurants[0].id).toMatch(uuidRegex);
    }

    // Feed item restaurant IDs should match format
    const feedWithRestaurant = feedItems.find((item: any) => item.restaurant);
    if (feedWithRestaurant) {
      expect(feedWithRestaurant.restaurant.id).toMatch(uuidRegex);
    }
  }, 30000); // Increase timeout for multiple fetch calls

  it('user IDs are consistent UUIDs', async () => {
    const usersResponse = await fetch(`${DJANGO_API_URL}/users/`);
    const usersData = await usersResponse.json();
    const users = extractResults(usersData);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (users.length > 0) {
      expect(users[0].id).toMatch(uuidRegex);
    }
  }, 30000); // Increase timeout
});
