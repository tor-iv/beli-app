/**
 * Django REST API Client
 *
 * Provides a typed client for making requests to the Django backend.
 * Used as an alternative to direct Supabase SDK calls.
 *
 * Environment Variables:
 *   NEXT_PUBLIC_DJANGO_API_URL: Base URL for Django API (default: http://localhost:8000/api/v1)
 */

const DJANGO_API_URL =
  process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

// Cache Django availability status
let djangoAvailabilityCache: { available: boolean; checkedAt: number } | null = null;
const DJANGO_HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if Django API is available (with caching)
 */
export async function isDjangoAvailable(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if fresh
  if (djangoAvailabilityCache && now - djangoAvailabilityCache.checkedAt < DJANGO_HEALTH_CHECK_INTERVAL) {
    return djangoAvailabilityCache.available;
  }

  try {
    // Check if Django URL is configured
    if (!DJANGO_API_URL) {
      djangoAvailabilityCache = { available: false, checkedAt: now };
      return false;
    }

    // Try a lightweight health check
    const response = await fetch(`${DJANGO_API_URL}/restaurants/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    const available = response.ok;
    djangoAvailabilityCache = { available, checkedAt: now };
    return available;
  } catch {
    djangoAvailabilityCache = { available: false, checkedAt: now };
    return false;
  }
}

/**
 * Invalidate Django availability cache
 */
export function invalidateDjangoCache(): void {
  djangoAvailabilityCache = null;
}

/**
 * HTTP request options
 */
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Make a request to the Django API
 */
async function djangoFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, timeout = 10000 } = options;

  const url = `${DJANGO_API_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`Django API error (${response.status}): ${error}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

/**
 * Django API Client with typed methods for each endpoint
 */
export const djangoClient = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, timeout?: number) =>
    djangoFetch<T>(endpoint, { method: 'GET', timeout }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, body: unknown, timeout?: number) =>
    djangoFetch<T>(endpoint, { method: 'POST', body, timeout }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body: unknown, timeout?: number) =>
    djangoFetch<T>(endpoint, { method: 'PUT', body, timeout }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, body: unknown, timeout?: number) =>
    djangoFetch<T>(endpoint, { method: 'PATCH', body, timeout }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, timeout?: number) =>
    djangoFetch<T>(endpoint, { method: 'DELETE', timeout }),
};

/**
 * Get Django API status (useful for debugging)
 */
export async function getDjangoStatus(): Promise<{
  available: boolean;
  url: string;
}> {
  const available = await isDjangoAvailable();
  return {
    available,
    url: DJANGO_API_URL,
  };
}

// =============================================================================
// TYPED API OPERATIONS
// These match the Django REST endpoints created in beli-backend
// =============================================================================

/**
 * Restaurant API operations
 * Endpoints: /api/v1/restaurants/
 */
export const restaurantApi = {
  /** Get all restaurants */
  getAll: () => djangoClient.get<RestaurantListResponse>('/restaurants/'),

  /** Get restaurant by ID */
  getById: (id: string) => djangoClient.get<Restaurant>(`/restaurants/${id}/`),

  /** Search restaurants by query */
  search: (query: string) =>
    djangoClient.get<RestaurantListResponse>(`/restaurants/search/?q=${encodeURIComponent(query)}`),

  /** Get restaurant menu */
  getMenu: (restaurantId: string) =>
    djangoClient.get<MenuResponse>(`/menus/?restaurantId=${restaurantId}`),

  /** Get what to order suggestions */
  getOrderSuggestions: (restaurantId: string, partySize: number, hungerLevel: number) =>
    djangoClient.get<OrderSuggestionsResponse>(
      `/menus/suggest-order/?restaurantId=${restaurantId}&partySize=${partySize}&hungerLevel=${hungerLevel}`
    ),
};

/**
 * User API operations
 * Endpoints: /api/v1/users/
 */
export const userApi = {
  /** Get current user (demo mode) */
  getMe: (userId?: string) =>
    djangoClient.get<User>(userId ? `/users/me/?userId=${userId}` : '/users/me/'),

  /** Get user by ID */
  getById: (id: string) => djangoClient.get<User>(`/users/${id}/`),

  /** Get user by username */
  getByUsername: (username: string) =>
    djangoClient.get<User>(`/users/username/${username}/`),

  /** Search users */
  search: (query: string) =>
    djangoClient.get<UserListResponse>(`/users/search/?q=${encodeURIComponent(query)}`),

  /** Get leaderboard */
  getLeaderboard: (limit = 50) =>
    djangoClient.get<UserListResponse>(`/users/leaderboard/?limit=${limit}`),

  /** Get user followers */
  getFollowers: (userId: string) =>
    djangoClient.get<UserListResponse>(`/users/${userId}/followers/`),

  /** Get users this user follows */
  getFollowing: (userId: string) =>
    djangoClient.get<UserListResponse>(`/users/${userId}/following/`),

  /** Get user's ratings */
  getRatings: (userId: string, status?: string) =>
    djangoClient.get<RatingListResponse>(
      `/users/${userId}/ratings/${status ? `?status=${status}` : ''}`
    ),

  /** Get match percentage between two users */
  getMatchPercentage: (userId: string, targetId: string) =>
    djangoClient.get<{ matchPercentage: number }>(`/users/${userId}/match/${targetId}/`),

  /** Get user's taste profile */
  getTasteProfile: (userId: string) =>
    djangoClient.get<TasteProfileResponse>(`/users/${userId}/taste-profile/`),
};

/**
 * Feed API operations
 * Endpoints: /api/v1/feed/
 */
export const feedApi = {
  /** Get activity feed */
  getFeed: (userId?: string, limit = 50) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('limit', limit.toString());
    return djangoClient.get<FeedResponse>(`/feed/?${params.toString()}`);
  },

  /** Like a feed item */
  like: (feedItemId: string, userId: string) =>
    djangoClient.post<{ success: boolean }>(`/feed/${feedItemId}/like/`, { userId }),

  /** Unlike a feed item */
  unlike: (feedItemId: string, userId: string) =>
    djangoClient.post<{ success: boolean }>(`/feed/${feedItemId}/unlike/`, { userId }),

  /** Get comments for a feed item */
  getComments: (feedItemId: string) =>
    djangoClient.get<CommentListResponse>(`/feed/${feedItemId}/comments/`),

  /** Add comment to a feed item */
  addComment: (feedItemId: string, userId: string, text: string) =>
    djangoClient.post<Comment>(`/feed/${feedItemId}/comments/`, { userId, text }),
};

/**
 * Ratings API operations (user-restaurant relationships)
 * Endpoints: /api/v1/ratings/
 */
export const ratingsApi = {
  /** Add a rating */
  addRating: (data: {
    userId: string;
    restaurantId: string;
    status: 'been' | 'want_to_try';
    score?: number;
    review?: string;
  }) => djangoClient.post<Rating>('/ratings/', data),

  /** Update a rating */
  updateRating: (ratingId: string, data: Partial<Rating>) =>
    djangoClient.patch<Rating>(`/ratings/${ratingId}/`, data),

  /** Delete a rating */
  deleteRating: (ratingId: string) =>
    djangoClient.delete<{ success: boolean }>(`/ratings/${ratingId}/`),

  /** Get watchlist for user */
  getWatchlist: (userId: string) =>
    djangoClient.get<WatchlistResponse>(`/ratings/watchlist/?userId=${userId}`),

  /** Get friend recommendations for a restaurant */
  getFriendRecommendations: (restaurantId: string, userId: string) =>
    djangoClient.get<FriendRecommendationsResponse>(
      `/ratings/friend-recommendations/?restaurantId=${restaurantId}&userId=${userId}`
    ),
};

/**
 * Lists API operations
 * Endpoints: /api/v1/lists/
 */
export const listsApi = {
  /** Get user's lists */
  getUserLists: (userId: string) =>
    djangoClient.get<ListsResponse>(`/lists/?userId=${userId}`),

  /** Get list by ID */
  getById: (listId: string) => djangoClient.get<List>(`/lists/${listId}/`),

  /** Create a new list */
  create: (data: { userId: string; name: string; description?: string; isPublic?: boolean }) =>
    djangoClient.post<List>('/lists/', data),

  /** Update a list */
  update: (listId: string, data: Partial<List>) =>
    djangoClient.patch<List>(`/lists/${listId}/`, data),

  /** Delete a list */
  delete: (listId: string) => djangoClient.delete<{ success: boolean }>(`/lists/${listId}/`),

  /** Add restaurant to list */
  addRestaurant: (listId: string, restaurantId: string) =>
    djangoClient.post<{ success: boolean }>(`/lists/${listId}/add-restaurant/`, { restaurantId }),

  /** Remove restaurant from list */
  removeRestaurant: (listId: string, restaurantId: string) =>
    djangoClient.post<{ success: boolean }>(`/lists/${listId}/remove-restaurant/`, { restaurantId }),
};

/**
 * Group Dinner API operations
 * Endpoints: /api/v1/group-dinner/
 */
export const groupDinnerApi = {
  /** Create a new group dinner session */
  createSession: (data: { hostId: string; participantIds: string[] }) =>
    djangoClient.post<GroupDinnerSession>('/group-dinner/', data),

  /** Get session by ID */
  getSession: (sessionId: string) =>
    djangoClient.get<GroupDinnerSession>(`/group-dinner/${sessionId}/`),

  /** Submit a swipe for a restaurant */
  submitSwipe: (sessionId: string, userId: string, restaurantId: string, direction: 'left' | 'right') =>
    djangoClient.post<{ success: boolean }>(`/group-dinner/${sessionId}/swipe/`, {
      userId,
      restaurantId,
      direction,
    }),

  /** Get candidates for group */
  getCandidates: (sessionId: string) =>
    djangoClient.get<GroupDinnerCandidatesResponse>(`/group-dinner/${sessionId}/candidates/`),

  /** Get matches (restaurants everyone liked) */
  getMatches: (sessionId: string) =>
    djangoClient.get<GroupDinnerMatchesResponse>(`/group-dinner/${sessionId}/matches/`),
};

/**
 * Tastemakers API operations
 * Endpoints: /api/v1/tastemakers/
 */
export const tastemakersApi = {
  /** Get all tastemakers */
  getAll: () => djangoClient.get<TastemakersListResponse>('/tastemakers/'),

  /** Get tastemaker by ID */
  getById: (id: string) => djangoClient.get<Tastemaker>(`/tastemakers/${id}/`),

  /** Get tastemaker's posts */
  getPosts: (tastemakerId: string) =>
    djangoClient.get<TastemakerPostsResponse>(`/tastemakers/${tastemakerId}/posts/`),

  /** Get single post */
  getPost: (postId: string) =>
    djangoClient.get<TastemakerPost>(`/tastemakers/posts/${postId}/`),

  /** Follow a tastemaker */
  follow: (tastemakerId: string, userId: string) =>
    djangoClient.post<{ success: boolean }>(`/tastemakers/${tastemakerId}/follow/`, { userId }),

  /** Unfollow a tastemaker */
  unfollow: (tastemakerId: string, userId: string) =>
    djangoClient.post<{ success: boolean }>(`/tastemakers/${tastemakerId}/unfollow/`, { userId }),
};

/**
 * Notifications API operations
 * Endpoints: /api/v1/notifications/
 */
export const notificationsApi = {
  /** Get user's notifications */
  getAll: (userId: string, limit = 50) =>
    djangoClient.get<NotificationsResponse>(`/notifications/?userId=${userId}&limit=${limit}`),

  /** Mark notification as read */
  markAsRead: (notificationId: string) =>
    djangoClient.post<{ success: boolean }>(`/notifications/${notificationId}/read/`, {}),

  /** Mark all notifications as read */
  markAllAsRead: (userId: string) =>
    djangoClient.post<{ success: boolean }>('/notifications/read-all/', { userId }),

  /** Get unread notification count */
  getUnreadCount: (userId: string) =>
    djangoClient.get<{ count: number }>(`/notifications/unread-count/?userId=${userId}`),
};

/**
 * Auth API operations (when REQUIRE_AUTH=true)
 * Endpoints: /api/v1/auth/
 */
export const authApi = {
  /** Get JWT token pair */
  login: (username: string, password: string) =>
    djangoClient.post<{ access: string; refresh: string }>('/auth/token/', {
      username,
      password,
    }),

  /** Refresh access token */
  refresh: (refreshToken: string) =>
    djangoClient.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    }),

  /** Verify token is valid */
  verify: (token: string) =>
    djangoClient.post<Record<string, never>>('/auth/token/verify/', { token }),
};

// =============================================================================
// TYPE DEFINITIONS
// These should match the Django serializer output
// =============================================================================

interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceLevel: number;
  location: {
    address: string;
    neighborhood: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  stats: {
    beenCount: number;
    wantToTryCount: number;
    followersCount: number;
    followingCount: number;
    rank?: number;
  };
}

interface Rating {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant?: Restaurant;
  status: 'been' | 'want_to_try';
  score?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeedItem {
  id: string;
  type: string;
  user: User;
  restaurant?: Restaurant;
  content?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  timestamp: string;
}

interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  timestamp: string;
}

interface List {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  restaurantIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface GroupDinnerSession {
  id: string;
  hostId: string;
  participantIds: string[];
  status: 'active' | 'completed';
  createdAt: string;
}

interface GroupDinnerCandidate {
  restaurant: Restaurant;
  matchScore: number;
  matchBreakdown: {
    wantToTryOverlap: number;
    dietaryCompatibility: number;
    locationConvenience: number;
  };
}

interface Tastemaker {
  id: string;
  userId: string;
  user: User;
  specialty: string;
  badges: string[];
  followerCount: number;
  postCount: number;
}

interface TastemakerPost {
  id: string;
  tastemakerId: string;
  title: string;
  content: string;
  restaurantIds: string[];
  imageUrl?: string;
  publishedAt: string;
}

interface Notification {
  id: string;
  type: string;
  actorUser?: User;
  targetRestaurant?: Restaurant;
  actionDescription: string;
  isRead: boolean;
  timestamp: string;
}

interface TasteProfileResponse {
  topCuisines: Array<{ cuisine: string; count: number }>;
  pricePreference: number | null;
  averageRating: number | null;
  ratingDistribution: Record<string, number>;
  totalRated: number;
  adventurousnessScore: number;
  insights: string[];
}

interface MenuResponse {
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
  }>;
}

interface OrderSuggestionsResponse {
  suggestions: Array<{
    item: { id: string; name: string; price: number };
    reason: string;
  }>;
  totalEstimate: number;
}

// List response types
interface RestaurantListResponse { results: Restaurant[]; count: number }
interface UserListResponse { results: User[]; count: number }
interface RatingListResponse { results: Rating[]; count: number }
interface FeedResponse { results: FeedItem[]; count: number }
interface CommentListResponse { results: Comment[]; count: number }
interface ListsResponse { results: List[]; count: number }
interface WatchlistResponse { results: Restaurant[]; count: number }
interface FriendRecommendationsResponse { results: Array<{ user: User; rating: Rating }>; count: number }
interface GroupDinnerCandidatesResponse { results: GroupDinnerCandidate[]; count: number }
interface GroupDinnerMatchesResponse { results: Restaurant[]; count: number }
interface TastemakersListResponse { results: Tastemaker[]; count: number }
interface TastemakerPostsResponse { results: TastemakerPost[]; count: number }
interface NotificationsResponse { results: Notification[]; count: number }
